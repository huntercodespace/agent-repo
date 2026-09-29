import { join } from "node:path";
import { createApp } from "./app.js";
import { loadConfig } from "./config.js";
import { loadEnvFile } from "./env.js";
import { repoRoot } from "./paths.js";

loadEnvFile(join(repoRoot, ".env"));

const config = loadConfig();
const app = createApp(config);
app.listen(config.port, () => {
  const mode = config.chatMock ? "演示模式" : "模型模式";
  console.log(`简历助手已启动（${mode}）：http://127.0.0.1:${config.port}`);
});
