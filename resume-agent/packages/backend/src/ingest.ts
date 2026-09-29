/**
 * 把 data/resume 里的示例或真实简历切块、向量化，并整表重建 LanceDB。
 * 换 EMBEDDING_MODEL 之后必须重跑，因为维度变了，旧表不能混用。
 * 用法：在 resume-agent 目录执行 pnpm ingest
 */
import { join } from "node:path";
import { createEmbeddingClient, loadResumeDirectory, rebuildResumeIndex } from "@resume/retrieval";
import { loadConfig } from "./config.js";
import { loadEnvFile } from "./env.js";
import { repoRoot } from "./paths.js";

loadEnvFile(join(repoRoot, ".env"));

const config = loadConfig();
if (!config.embeddingApiKey) {
  console.error("缺少 EMBEDDING_API_KEY。请在 resume-agent/.env 里填写向量接口的密钥。");
  process.exit(1);
}

const { profile, chunks } = loadResumeDirectory(config.resumeDir);
const client = createEmbeddingClient({
  baseUrl: config.embeddingBaseUrl,
  model: config.embeddingModel,
  apiKey: config.embeddingApiKey,
});
const result = await rebuildResumeIndex({
  path: config.lancedbPath,
  chunks,
  client,
});
console.log(`已为「${profile.name}」写入 ${result.count} 条片段，向量维度 ${result.dimension}。`);
