import { join } from "node:path";
import { repoRoot } from "./paths.js";

export interface AppConfig {
  port: number;
  /** 留空则按 pi-ai 目录自动选择。 */
  deepseekModelId?: string;
  embeddingBaseUrl: string;
  embeddingModel: string;
  embeddingApiKey: string;
  lancedbPath: string;
  resumeDir: string;
  publicDir: string;
  frontendDist: string;
  rateLimitWindowMs: number;
  rateLimitMax: number;
  chatMock: boolean;
  mockDelayMs: number;
  trustProxy: boolean;
  corsOrigins: string[];
}

function integer(name: string, fallback: number): number {
  const raw = process.env[name];
  if (!raw) return fallback;
  const value = Number(raw);
  if (!Number.isFinite(value)) throw new Error(`${name} 必须是数字`);
  return value;
}

export function loadConfig(): AppConfig {
  const modelId = process.env.DEEPSEEK_MODEL?.trim();
  return {
    port: integer("PORT", 8787),
    ...(modelId ? { deepseekModelId: modelId } : {}),
    embeddingBaseUrl: process.env.EMBEDDING_BASE_URL?.trim() || "https://api.siliconflow.cn/v1",
    embeddingModel: process.env.EMBEDDING_MODEL?.trim() || "BAAI/bge-m3",
    embeddingApiKey: process.env.EMBEDDING_API_KEY?.trim() || "",
    lancedbPath: process.env.LANCEDB_PATH?.trim() || join(repoRoot, "data/lancedb"),
    resumeDir: process.env.RESUME_DIR?.trim() || join(repoRoot, "data/resume"),
    publicDir: process.env.PUBLIC_DIR?.trim() || join(repoRoot, "data/public"),
    frontendDist: join(repoRoot, "packages/frontend/dist"),
    rateLimitWindowMs: integer("RATE_LIMIT_WINDOW_MS", 60_000),
    rateLimitMax: integer("RATE_LIMIT_MAX", 20),
    chatMock: process.env.CHAT_MOCK === "1",
    mockDelayMs: integer("CHAT_MOCK_DELAY_MS", 350),
    trustProxy: process.env.TRUST_PROXY === "1",
    corsOrigins: (process.env.CORS_ORIGIN || "http://127.0.0.1:5174,http://localhost:5174")
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean),
  };
}
