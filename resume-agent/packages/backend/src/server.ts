import { Pool } from "pg";
import { createPgVectorStore, VECTOR_DIMENSION } from "@resume/retrieval";
import { join } from "node:path";
import { createApp } from "./app.js";
import { createPostgresBusinessStore } from "./business-store.js";
import { loadConfig } from "./config.js";
import { loadEnvFile } from "./env.js";
import { runMigrations } from "./migrate.js";
import { repoRoot } from "./paths.js";

loadEnvFile(join(repoRoot, ".env"));

const config = loadConfig();
if (config.embeddingDimension !== VECTOR_DIMENSION) {
  throw new Error(
    `EMBEDDING_DIMENSION=${config.embeddingDimension}，数据库列是 vector(${VECTOR_DIMENSION})。两者必须一致。`,
  );
}

const pool = new Pool({ connectionString: config.databaseUrl });
await runMigrations(config.databaseUrl);
const app = createApp(config, {
  business: createPostgresBusinessStore(pool),
  vector: createPgVectorStore(pool),
});
const server = app.listen(config.port, () => {
  const mode = config.chatMock ? "演示模式" : "模型模式";
  console.log(`简历助手已启动（${mode}）：http://127.0.0.1:${config.port}`);
});

async function shutdown(): Promise<void> {
  server.close();
  await pool.end();
}

process.on("SIGINT", () => {
  void shutdown();
});
process.on("SIGTERM", () => {
  void shutdown();
});
