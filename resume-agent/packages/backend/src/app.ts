import { existsSync } from "node:fs";
import { join } from "node:path";
import type { StreamFn } from "@earendil-works/pi-agent-core";
import {
  createEmbeddingClient,
  loadProfile,
  loadResumeDirectory,
  searchResume,
  VECTOR_DIMENSION,
  type Profile,
  type VectorStore,
} from "@resume/retrieval";
import express, { type Express, type Request, type Response } from "express";
import { streamChat } from "./chat-turn.js";
import type { AppConfig } from "./config.js";
import { selectChatModel } from "./model.js";
import { createRateLimiter } from "./rate-limit.js";
import { formatSse, type SseEvent } from "./sse.js";
import { createResumeTools, toolLabelMap, type ResumeLookup } from "./tools.js";
import { FeedbackError, type BusinessStore, type LoadedSession } from "./business-store.js";

const VISITOR_COOKIE = "resume_visitor";
const DISLIKE_REASONS = ["信息不准确", "没回答到点上", "其他"] as const;

export interface AppDeps {
  business: BusinessStore;
  vector: VectorStore;
  streamFn?: StreamFn;
}

function clientIp(req: Request): string {
  return req.ip || req.socket.remoteAddress || "unknown";
}

function readCookie(header: string | undefined, name: string): string | null {
  if (!header) return null;
  for (const part of header.split(";")) {
    const separator = part.indexOf("=");
    if (separator < 0) continue;
    if (part.slice(0, separator).trim() !== name) continue;
    return decodeURIComponent(part.slice(separator + 1).trim());
  }
  return null;
}

function visitorCookie(id: string, secure: boolean): string {
  const parts = [
    `${VISITOR_COOKIE}=${id}`,
    "Path=/",
    "HttpOnly",
    "SameSite=Lax",
    `Max-Age=${60 * 60 * 24 * 400}`,
  ];
  if (secure) parts.push("Secure");
  return parts.join("; ");
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

function visitorId(res: Response): string {
  const id = res.locals.visitorId;
  return typeof id === "string" ? id : "";
}

export function createLookup(config: AppConfig, vector: VectorStore): ResumeLookup {
  const client = createEmbeddingClient({
    baseUrl: config.embeddingBaseUrl,
    model: config.embeddingModel,
    apiKey: config.embeddingApiKey,
  });
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
      if (config.embeddingDimension !== VECTOR_DIMENSION) {
        throw new Error(
          `EMBEDDING_DIMENSION=${config.embeddingDimension}，数据库列是 vector(${VECTOR_DIMENSION})。两者必须一致。`,
        );
      }
      return searchResume(vector, client, query);
    },
  };
}

export function createApp(config: AppConfig, deps: AppDeps): Express {
  const app = express();
  if (config.trustProxy) app.set("trust proxy", 1);
  const model = selectChatModel(config.deepseekModelId);
  const lookup = createLookup(config, deps.vector);
  const tools = createResumeTools(lookup);
  const labels = toolLabelMap(tools);
  const chatLimiter = createRateLimiter({
    windowMs: config.rateLimitWindowMs,
    max: config.rateLimitMax,
  });
  const feedbackLimiter = createRateLimiter({
    windowMs: config.rateLimitWindowMs,
    max: config.rateLimitMax,
  });
  const busy = new Set<string>();
  const runs = new Map<
    string,
    { visitorId: string; stopRequested: boolean; abort: (() => void) | null; done: Promise<void>; finish: () => void }
  >();

  app.use(express.json({ limit: "32kb" }));
  app.use((req, res, next) => {
    const origin = req.header("origin");
    if (origin && config.corsOrigins.includes(origin)) {
      res.setHeader("Access-Control-Allow-Origin", origin);
      res.setHeader("Access-Control-Allow-Credentials", "true");
      res.setHeader("Vary", "Origin");
      res.setHeader("Access-Control-Allow-Headers", "Content-Type");
      res.setHeader("Access-Control-Allow-Methods", "GET,POST,PATCH,DELETE,OPTIONS");
    }
    if (req.method === "OPTIONS") {
      res.status(204).end();
      return;
    }
    next();
  });

  app.use("/api", async (req, res, next) => {
    try {
      const current = readCookie(req.header("cookie"), VISITOR_COOKIE);
      const id = await deps.business.ensureVisitor(current);
      res.locals.visitorId = id;
      if (id !== current) res.append("Set-Cookie", visitorCookie(id, config.cookieSecure));
      next();
    } catch (error) {
      next(error);
    }
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

  app.get("/api/sessions", async (req, res) => {
    const query = typeof req.query.q === "string" ? req.query.q.slice(0, 100) : "";
    const sessions = await deps.business.listSessions(visitorId(res), query);
    res.json({ sessions });
  });

  app.get("/api/sessions/:id", async (req, res) => {
    const session = await deps.business.getSession(visitorId(res), String(req.params.id ?? ""));
    if (!session) {
      res.status(404).json({ message: "没有找到这轮对话。" });
      return;
    }
    res.json(session);
  });

  app.patch("/api/sessions/:id", async (req, res) => {
    const title = typeof req.body?.title === "string" ? req.body.title.trim().replace(/\s+/g, " ") : "";
    if (!title) {
      res.status(400).json({ message: "请输入对话标题。" });
      return;
    }
    if (title.length > 80) {
      res.status(400).json({ message: "标题请控制在 80 字以内。" });
      return;
    }
    const updated = await deps.business.renameSession(visitorId(res), String(req.params.id ?? ""), title);
    if (!updated) {
      res.status(404).json({ message: "没有找到这轮对话。" });
      return;
    }
    res.json(updated);
  });

  app.delete("/api/sessions/:id", async (req, res) => {
    const removed = await deps.business.deleteSession(visitorId(res), String(req.params.id ?? ""));
    if (!removed) {
      res.status(404).json({ message: "没有找到这轮对话。" });
      return;
    }
    res.json({ ok: true });
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

  app.post("/api/feedback", async (req, res) => {
    if (!feedbackLimiter.allow(clientIp(req))) {
      res.status(429).json({ message: "提交太频繁了，请稍后再试。" });
      return;
    }
    const rating = req.body?.rating === "like" || req.body?.rating === "dislike" || req.body?.rating === "clear" ? req.body.rating : "";
    if (!rating) {
      res.status(400).json({ message: "评分只能是 like、dislike 或 clear。" });
      return;
    }
    const sessionId = typeof req.body?.sessionId === "string" ? req.body.sessionId : "";
    const messageId = typeof req.body?.messageId === "string" ? req.body.messageId : "";
    if (!sessionId || !messageId) {
      res.status(400).json({ message: "缺少会话或消息。" });
      return;
    }
    const reason = typeof req.body?.reason === "string" ? req.body.reason.trim() : "";
    if (reason && (rating !== "dislike" || !(DISLIKE_REASONS as readonly string[]).includes(reason))) {
      res.status(400).json({ message: "不认识的反馈原因。" });
      return;
    }
    const comment = typeof req.body?.comment === "string" ? req.body.comment.trim().slice(0, 1000) : "";
    try {
      if (rating === "clear") {
        await deps.business.clearFeedback(visitorId(res), sessionId, messageId);
      } else {
        await deps.business.insertFeedback({
          visitorId: visitorId(res),
          sessionId,
          messageId,
          rating,
          reason: rating === "dislike" ? reason : "",
          comment: rating === "dislike" ? comment : "",
        });
      }
      res.json({ ok: true });
    } catch (error) {
      if (error instanceof FeedbackError) {
        res.status(error.status).json({ message: error.message });
        return;
      }
      res.status(500).json({ message: "没有记下这条反馈。" });
    }
  });

  app.post("/api/chat/stop", async (req, res) => {
    const sessionId = typeof req.body?.sessionId === "string" ? req.body.sessionId : "";
    const run = runs.get(sessionId);
    if (!run || run.visitorId !== visitorId(res)) {
      res.status(404).json({ message: "当前没有正在生成的回答。" });
      return;
    }
    run.stopRequested = true;
    run.abort?.();
    await run.done;
    res.json({ ok: true });
  });

  app.post("/api/chat", async (req, res) => {
    if (!chatLimiter.allow(clientIp(req))) {
      res.status(429).json({ message: "提问太频繁了，请稍后再试。" });
      return;
    }
    const regenerate = req.body?.regenerate === true;
    const retry = req.body?.retry === true;
    const message = typeof req.body?.message === "string" ? req.body.message.trim() : "";
    if (retry && regenerate) {
      res.status(400).json({ message: "重试和重新生成不能同时进行。" });
      return;
    }
    if (!regenerate && !retry && !message) {
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
    const owner = visitorId(res);
    let created = false;
    let session: LoadedSession | null = requestedId ? await deps.business.loadSession(owner, requestedId) : null;
    if (regenerate && !session) {
      res.status(404).json({ message: "没有找到这轮对话，无法重新生成。" });
      return;
    }
    if (retry && !session) {
      res.status(404).json({ message: "没有找到这轮对话，无法重试。" });
      return;
    }
    if (!session) {
      const fresh = await deps.business.createSession(owner);
      created = true;
      session = { id: fresh.id, title: "", rows: [] };
    }
    if (busy.has(session.id)) {
      if (created) await deps.business.deleteSession(owner, session.id);
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
    let finishRun: () => void = () => {};
    const done = new Promise<void>((resolve) => {
      finishRun = resolve;
    });
    const run = { visitorId: owner, stopRequested: false, abort: null as (() => void) | null, done, finish: finishRun };
    runs.set(session.id, run);
    const isClosed = () => closed;
    res.on("close", () => {
      closed = true;
      if (!run.stopRequested) run.abort?.();
    });
    const ping = setInterval(() => {
      if (!closed && !res.writableEnded) res.write(": ping\n\n");
    }, 15_000);
    busy.add(session.id);
    let saved = false;
    const profile: Profile = loadProfile(config.resumeDir);
    writeEvent(res, { event: "session", data: { sessionId: session.id } }, isClosed);
    try {
      saved = await streamChat({
        business: deps.business,
        visitorId: owner,
        session,
        message,
        regenerate,
        retry,
        mock: config.chatMock,
        mockDelayMs: config.mockDelayMs,
        modelTimeoutMs: config.modelTimeoutMs,
        model,
        profile,
        tools,
        labels,
        ...(deps.streamFn ? { streamFn: deps.streamFn } : {}),
        emit: (event) => writeEvent(res, event, isClosed),
        isClosed,
        isStopRequested: () => run.stopRequested,
        onAgent: (agent) => {
          run.abort = () => agent.abort();
          if (run.stopRequested) agent.abort();
        },
      });
    } catch (error) {
      if (!isClosed()) {
        console.error("回答失败", error);
        writeEvent(
          res,
          { event: "error", data: { message: error instanceof Error ? error.message : "回答中断了，请再试一次。" } },
          isClosed,
        );
      }
    } finally {
      busy.delete(session.id);
      runs.delete(session.id);
      clearInterval(ping);
      if (!saved && created) {
        await deps.business.deleteSession(owner, session.id).catch(() => undefined);
      }
      finishRun();
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
