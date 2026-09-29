import { randomUUID } from "node:crypto";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { Agent } from "@earendil-works/pi-agent-core";
import {
  createEmbeddingClient,
  loadProfile,
  loadResumeDirectory,
  ResumeIndex,
  type Profile,
} from "@resume/retrieval";
import express, { type Express, type Request, type Response } from "express";
import { createResumeAgent } from "./agent.js";
import type { AppConfig } from "./config.js";
import { buildMockEvents } from "./mock-chat.js";
import { selectChatModel } from "./model.js";
import { createRateLimiter } from "./rate-limit.js";
import { formatSse, mapAgentEvent, type SseEvent } from "./sse.js";
import { createResumeTools, toolLabelMap, type ResumeLookup } from "./tools.js";

interface Session {
  id: string;
  agent: Agent;
  busy: boolean;
}

function clientIp(req: Request): string {
  return req.ip || req.socket.remoteAddress || "unknown";
}

function writeEvent(res: Response, event: SseEvent, closed: () => boolean): void {
  if (closed() || res.writableEnded) return;
  res.write(formatSse(event));
}

function toolText(result: { content: Array<{ type: string; text?: string }> }): string {
  return result.content
    .map((part) => (part.type === "text" ? part.text ?? "" : ""))
    .filter(Boolean)
    .join("\n");
}

export function createLookup(config: AppConfig): ResumeLookup {
  const index = new ResumeIndex(
    config.lancedbPath,
    createEmbeddingClient({
      baseUrl: config.embeddingBaseUrl,
      model: config.embeddingModel,
      apiKey: config.embeddingApiKey,
    }),
  );
  return {
    getProfile: () => loadProfile(config.resumeDir),
    // 按 id 直接读原文，不走向量。索引没建好时「查看详情」仍然可用。
    getById: (id) => {
      const chunk = loadResumeDirectory(config.resumeDir).chunks.find((item) => item.id === id);
      return Promise.resolve(chunk ?? null);
    },
    search: async (query) => {
      if (!config.embeddingApiKey) {
        throw new Error("还没有配置 EMBEDDING_API_KEY，无法检索简历。");
      }
      return index.search(query);
    },
  };
}

export function createApp(config: AppConfig): Express {
  const app = express();
  if (config.trustProxy) app.set("trust proxy", 1);
  const model = selectChatModel(config.deepseekModelId);
  const lookup = createLookup(config);
  const tools = createResumeTools(lookup);
  const labels = toolLabelMap(tools);
  const sessions = new Map<string, Session>();
  const limiter = createRateLimiter({
    windowMs: config.rateLimitWindowMs,
    max: config.rateLimitMax,
  });

  app.use(express.json({ limit: "32kb" }));
  app.use((req, res, next) => {
    const origin = req.header("origin");
    if (origin && config.corsOrigins.includes(origin)) {
      res.setHeader("Access-Control-Allow-Origin", origin);
      res.setHeader("Vary", "Origin");
      res.setHeader("Access-Control-Allow-Headers", "Content-Type");
      res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
    }
    if (req.method === "OPTIONS") {
      res.status(204).end();
      return;
    }
    next();
  });

  app.get("/api/health", (_req, res) => {
    res.json({
      ok: true,
      mock: config.chatMock,
      provider: model.provider,
      model: model.id,
    });
  });

  app.get("/api/profile", (_req, res) => {
    try {
      res.json(loadProfile(config.resumeDir));
    } catch (error) {
      res.status(500).json({ message: error instanceof Error ? error.message : "读取档案失败" });
    }
  });

  app.get("/api/projects/:id", async (req, res) => {
    const id = String(req.params.id ?? "");
    const tool = tools.find((item) => item.name === "get_project_detail");
    if (!tool) {
      res.status(500).json({ message: "缺少项目工具" });
      return;
    }
    try {
      const result = await tool.execute("ui", { id });
      const details = result.details as { kind?: string } | undefined;
      if (details?.kind === "project") {
        res.json(details);
        return;
      }
      res.status(404).json({ message: toolText(result) || "简历里没有这个项目。" });
    } catch (error) {
      res.status(500).json({ message: error instanceof Error ? error.message : "读取项目失败" });
    }
  });

  app.post("/api/chat", async (req, res) => {
    if (!limiter.allow(clientIp(req))) {
      res.status(429).json({ message: "提问太频繁了，请稍后再试。" });
      return;
    }
    const message = typeof req.body?.message === "string" ? req.body.message.trim() : "";
    if (!message) {
      res.status(400).json({ message: "请输入问题。" });
      return;
    }
    if (message.length > 2000) {
      res.status(400).json({ message: "问题太长了，请缩短到 2000 字以内。" });
      return;
    }
    if (!config.chatMock && !process.env.DEEPSEEK_API_KEY) {
      res.status(503).json({ message: "服务还没有配置 DEEPSEEK_API_KEY。" });
      return;
    }

    const requestedId = typeof req.body?.sessionId === "string" ? req.body.sessionId : "";
    let session = requestedId ? sessions.get(requestedId) : undefined;
    if (!session) {
      const profile: Profile = loadProfile(config.resumeDir);
      session = {
        id: randomUUID(),
        agent: createResumeAgent({ model, profile, tools }),
        busy: false,
      };
      sessions.set(session.id, session);
      if (sessions.size > 200) {
        const oldest = sessions.keys().next().value;
        if (oldest) sessions.delete(oldest);
      }
    }
    if (session.busy) {
      res.status(409).json({ message: "上一个问题还在回答，请稍等。" });
      return;
    }

    res.status(200);
    res.setHeader("Content-Type", "text/event-stream; charset=utf-8");
    res.setHeader("Cache-Control", "no-cache, no-transform");
    res.setHeader("Connection", "keep-alive");
    res.setHeader("X-Accel-Buffering", "no");
    res.flushHeaders();

    let closed = false;
    let finished = false;
    const isClosed = () => closed;
    res.on("close", () => {
      closed = true;
      if (!finished) session?.agent.abort();
    });
    const ping = setInterval(() => {
      if (!closed && !res.writableEnded) res.write(": ping\n\n");
    }, 15_000);

    writeEvent(res, { event: "session", data: { sessionId: session.id } }, isClosed);
    session.busy = true;
    try {
      if (config.chatMock) {
        for (const event of buildMockEvents(message)) {
          if (closed) break;
          if (config.mockDelayMs > 0 && (event.event === "tool_end" || event.event === "text_delta")) {
            await new Promise((resolve) => setTimeout(resolve, config.mockDelayMs));
          }
          writeEvent(res, event, isClosed);
        }
      } else {
        const unsubscribe = session.agent.subscribe((event) => {
          const mapped = mapAgentEvent(event, labels);
          if (mapped) writeEvent(res, mapped, isClosed);
        });
        try {
          await session.agent.prompt(message);
        } finally {
          unsubscribe();
        }
      }
    } catch (error) {
      console.error("回答失败", error);
      writeEvent(res, { event: "error", data: { message: "回答中断了，请再试一次。" } }, isClosed);
    } finally {
      finished = true;
      session.busy = false;
      clearInterval(ping);
      if (!res.writableEnded) res.end();
    }
  });

  app.use("/media", express.static(config.publicDir));
  app.get("/resume/example.pdf", (_req, res) => {
    const file = join(config.publicDir, "example.pdf");
    let filename = "resume.pdf";
    try {
      filename = loadProfile(config.resumeDir).resumePdfFilename || filename;
    } catch {
      filename = "resume.pdf";
    }
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="resume.pdf"; filename*=UTF-8''${encodeURIComponent(filename)}`,
    );
    res.sendFile(file);
  });

  if (existsSync(config.frontendDist)) {
    app.use(express.static(config.frontendDist));
    app.use((req, res, next) => {
      if (req.method !== "GET") {
        next();
        return;
      }
      if (req.path.startsWith("/api") || req.path.startsWith("/media") || req.path.startsWith("/resume")) {
        next();
        return;
      }
      res.sendFile(join(config.frontendDist, "index.html"), (error) => {
        if (error) next();
      });
    });
  }

  return app;
}
