# 简历问答助手

访客（主要是招聘方）打开网页，就这份简历提问。助手用工具查简历原文和混合检索，再用第三人称回答。当前数据是虚构人物 **林知夏**，`profile.json` 里 `example` 为 `true` 时页面会标出「示例数据」。

访客可以：看档案和技能、点建议问题或自己输入、看检索步骤和项目卡片、下载示例 PDF、查看联系方式、给回答点赞或点踩、重命名或删除自己的对话。没有登录。身份是服务端签发的访客 cookie，每人只能看到自己的会话。

更新记录见 [CHANGELOG.md](CHANGELOG.md)。

## 技术栈

版本取自各包的 `package.json`（`packageManager` 与依赖声明）。带 `^` 的是允许的版本范围，锁定结果在 `pnpm-lock.yaml`。

| 技术 | 版本 | 为什么用它 |
| --- | --- | --- |
| Node.js | `>=22` | 仓库引擎要求，前后端都跑在 Node 上 |
| pnpm | `10.33.3` | workspace 管理 `packages/*` 三个包 |
| TypeScript | `^5.9.3` | 检索、后端、前端共用同一套类型约束 |
| React / React DOM | `^19.2.0` | 聊天页的组件 |
| Vite | `^7.1.12` | 前端开发服务器和打包；开发时把 `/api`、`/media`、`/resume` 代理到后端 |
| antd | `^6.1.1` | 按钮、输入、弹层，并用 ConfigProvider 套主题 |
| @ant-design/icons | `^6.1.0` | 与 antd 6 配套的图标 |
| @ant-design/x | `^2.9.0` | 对话气泡、输入框和思维链 |
| Express | `^5.2.1` | HTTP API，聊天响应用 SSE |
| @earendil-works/pi-agent-core | `0.99.1` | Agent 循环、工具调用，以及把历史放进下一轮 |
| @earendil-works/pi-ai | `0.99.1` | 自带 `deepseek` 模型目录和流式调用 |
| DeepSeek | 由 pi-ai 目录决定 | 对话模型。密钥只在服务端，经 `DEEPSEEK_API_KEY` 读取 |
| OpenAI 兼容 embeddings | 默认硅基流动 `BAAI/bge-m3`，1024 维 | 向量接口可换地址和模型，只要仍是 `/v1/embeddings` 且维度与表结构一致 |
| PostgreSQL 16 + pgvector | 镜像 `pgvector/pgvector:pg16`，驱动 `pg` `^8.23.0` | 会话、消息、反馈和简历向量放在同一个库 |
| @node-rs/jieba | `^2.0.3` | 中文搜索分词。不依赖数据库里的 zhparser |
| node-pg-migrate | `^9.0.0` | 执行 `migrations/` 里的 SQL，版本记在 `pgmigrations` |
| Vitest | `^3.2.4` | 检索包和后端的测试 |
| ESLint | `^9.39.1` | `pnpm lint` |
| typebox | `1.3.27` | 四个工具的参数 schema，给 Agent 用 |
| tsx | `^4.20.6` | 开发时直接跑 TypeScript 入口 |

## 架构总览

浏览器只谈 HTTP。Express 负责访客 cookie、限流、把库里的历史交给 Agent，并把事件写成 SSE。Agent 调 DeepSeek，需要事实时调用工具。检索工具把问题送给向量接口，再交给 `VectorStore`。会话、消息、反馈和 `resume_chunks` 都在同一个 Postgres。

```mermaid
flowchart LR
  browser[浏览器]
  express[Express]
  agent[Agent]
  tools[工具]
  vector[VectorStore]
  pg[(PostgreSQL)]
  embed[Embeddings_API]
  deepseek[DeepSeek_API]

  browser -->|SSE| express
  express --> agent
  express -->|会话消息反馈| pg
  agent --> deepseek
  agent --> tools
  tools --> vector
  tools --> embed
  vector -->|pgvector| pg
```

`VectorStore` 的当前实现是 `packages/retrieval` 里的 pgvector。换别的向量库时实现 `upsert`、`rebuild`、`delete`、`search` 即可。

## 目录结构

```text
resume-agent/
  docker-compose.yml       本地 Postgres（pgvector/pgvector:pg16）
  docker/init-test-db.sql  首次初始化时创建测试库 resume_test
  migrations/              node-pg-migrate 的 SQL
  data/resume/             档案 profile.json、条目 entries.json、可选 Markdown
  data/resume/samples/     示例 Markdown，导入时跳过
  data/public/             头像 avatar.svg 和示例 PDF
  packages/retrieval/      切块、结巴分词、向量客户端、VectorStore
  packages/backend/        Express、Agent、工具、会话、反馈、SSE
  packages/frontend/       Vite 聊天页
```

## 一次问答的请求流程

`POST /api/chat` 的请求体是 `{ "message": "…", "sessionId"?: "…", "regenerate"?: false, "retry"?: false }`。服务端使用数据库里该访客的历史。`sessionId` 必须属于当前 `resume_visitor`，否则新开一轮并返回新的 id。

```mermaid
sequenceDiagram
  participant Browser as 浏览器
  participant Express as Express
  participant DB as Postgres
  participant Agent as Agent
  participant Tool as 工具
  participant Model as DeepSeek

  Browser->>Express: POST /api/chat
  Express->>Express: 读取或签发 resume_visitor
  Express->>DB: 按访客加载会话
  Express-->>Browser: event session
  Express->>Agent: 用库里的历史创建 Agent
  Agent->>Model: 流式请求
  Agent->>Tool: 工具调用
  Tool->>DB: 检索或读取简历原文
  Express-->>Browser: tool_start / tool_progress / tool_end
  Express-->>Browser: text_delta
  alt 用户点击停止
    Browser->>Express: POST /api/chat/stop
    Express->>Agent: abort
    Express->>DB: 写入 stopReason 为 aborted 的半段回答
  else 连接自己断开
    Express->>Agent: abort
    Note over Express,DB: 不是用户停止时不写入这轮
  else 正常结束或模型错误
    Express->>DB: 写入消息和 ui_details
  end
  Express-->>Browser: event done 或 error
```

响应类型是 `text/event-stream`。每条事件：

```text
event: <name>
data: <json>

```

| event | data | 何时发送 |
| --- | --- | --- |
| `session` | `{ sessionId }` | 开头。下一轮把这个 id 原样传回 |
| `text_delta` | `{ delta }` | 模型增量正文 |
| `tool_start` | 工具字段，`status: "pending"` | 工具开始。中文 label 由服务端按工具名填写 |
| `tool_progress` | 同上，`status: "pending"` | 工具进行中 |
| `tool_end` | `status: "success"` 或 `"error"` | 工具结束。成功时 label 换成「已…」 |
| `error` | `{ message }` | 助手 `stopReason === "error"`。`message` 已去掉密钥 |
| `done` | `{ reason: "agent_end", sessionId, messageId, stopReason? }` | 这轮已经写入数据库。`stopReason` 为 `aborted` 时界面标已停止 |

工具事件的公共字段：

```json
{
  "toolCallId": "call-1",
  "name": "search_resume",
  "label": "正在查阅相关经历",
  "status": "pending",
  "args": {},
  "content": "给模型的短摘要",
  "details": {},
  "isError": false
}
```

`args` 在开始时出现，`content`、`details`、`isError` 在结束时出现。pi-ai 发给 DeepSeek 的工具结果只用 `content`，`details` 留在界面和 `messages.ui_details`。

未配置 `DEEPSEEK_API_KEY` 且未开演示模式时返回 503。提问超过每 IP 限额返回 429。同一会话上一轮还在生成返回 409。重新生成或重试时找不到会话返回 404。这些问题是 JSON，不是 SSE。问题最长 2000 字。请求体上限 32kb。

## 检索设计

一条工作、一个项目、一组技能或一条教育经历各成一块。字段来自 `ResumeChunk`：`id`、`type`（`experience`、`project`、`skill`、`education`）、`title`、`period`、`tech_stack`、`text`。`id` 必须是原文里的稳定值，只能包含字母、数字、下划线和连字符，入库时不会重新生成。

入库时 `@node-rs/jieba` 的搜索模式切开标题、时间、正文和技术栈，词写入 `search_tokens`。`search_tsv` 是生成列 `to_tsvector('simple', search_tokens)`，用 GIN 索引。`simple` 配置不再做英文词干，避免把已经切好的中文再拆坏。查询用同一套分词，拼成 OR 的 `to_tsquery('simple', …)`。

向量列是 `vector(1024)`，HNSW 使用 cosine（`embedding <=>`）。默认模型是 `BAAI/bge-m3`。`EMBEDDING_DIMENSION` 必须是 1024，否则服务拒绝启动，检索也会拒绝查询。

有查询词且向量和分词都可用时，关键词和向量各取 30 条候选，用 RRF 合并，k = 60：

```text
score = 1 / (60 + 向量排名) + 1 / (60 + 关键词排名)
```

缺一边的候选只计另一边。默认返回 6 条，上限 20。过滤条件在融合之前生效：

| 参数 | 列条件 |
| --- | --- |
| `type` | `type` 相等 |
| `tech_stack` | 数组里有这项技术，忽略大小写 |
| `period_from` | `end_year` 不早于该年；「至今」记为 9999 |
| `period_to` | `start_year` 不晚于该年 |

年份从 `period` 里抽取。抽不出来时记为 0 到 9999，等于不参与年份过滤。

`pnpm ingest` 调用 `VectorStore.rebuild`：一个事务里 `DELETE FROM resume_chunks` 再插入。中途失败会回滚，旧数据还在。`get_project_detail` 和档案卡片直接读 `data/resume/`，不经过向量表。

## 四个工具

| 工具 | 进行中 / 完成 | 给模型的 `content` | 给界面的 `details` |
| --- | --- | --- | --- |
| `search_resume` | 正在查阅相关经历 / 已查阅相关经历 | 命中条数和每条的类型、标题、时间、技术栈、不超过 140 字的摘要 | `kind: "search"`，`items[]` 含 `id`、`type`、`title`、`period`、`tech_stack`、`snippet` |
| `get_project_detail` | 正在查阅项目详情 / 已获取项目详情 | 该项目的标题、时间、技术栈和全文 | `kind: "project"` 及全文；找不到时 `kind: "project_missing"` |
| `download_resume` | 正在获取简历文件 / 已获取简历文件 | PDF 路径一行字 | `kind: "download"`，`url`、`filename` |
| `get_contact` | 正在获取联系方式 / 已获取联系方式 | 邮箱、电话、GitHub、网站里有值的几行 | `kind: "contact"`，四个字段，没有的为空字符串 |

系统提示要求用第三人称称呼档案里的姓名，先调用工具再回答，简历里没有的事情要直说，并建议用 `get_contact` 的结果联系本人。

界面上，`type === "project"` 的检索结果再画项目卡片。引用是回答正文里的上标（例如「1 · 项目」），带标题和摘要。下载和联系方式是卡片。`GET /api/projects/:id` 走同一份项目原文，给「查看详情」用，不再开一轮模型。

## 数据模型

迁移文件是 `migrations/1730000000000_init.sql`。

| 表 | 关键列 |
| --- | --- |
| `users` | `id`。预留，现在没有登录 |
| `visitors` | `id`，可空的 `user_id`（删用户时置空） |
| `sessions` | `visitor_id`、`title`、`created_at`、`updated_at` |
| `messages` | `session_id`、`seq`、`format_version`、`agent_message` jsonb、`ui_details` jsonb |
| `feedback` | `visitor_id`、`session_id`、`message_id`、`rating`、`reason`、`comment`、`question`、`answer`、`chunk_ids`、`model_id` |
| `resume_chunks` | 片段字段、`start_year`、`end_year`、`search_tokens`、`search_tsv`、`embedding vector(1024)` |

`messages.format_version` 当前是 `pi-agent-core@0.99.1`。`agent_message` 原样保存 Agent 的用户消息、助手消息、工具调用和工具结果。`ui_details` 只给界面重画卡片。继续一轮时如果版本对不上，接口要求新开对话。

外键：删访客会级联删他的会话和反馈；删会话会级联删消息和反馈；删消息会级联删反馈。`users` 删除只把 `visitors.user_id` 置空。会话删除是直接 `DELETE`，没有回收站。

评分：`rating` 只能是 `like` 或 `dislike`。再点一次「有用」，或在点踩层里选「撤销」，会删掉该访客在这条回答上的评分行。改成另一种评分会再插入一行，读会话时取最新一行。继续对话时已有消息沿用原来的 id 做更新，不会整段删掉再插入，因此评分不会被级联清掉。点踩原因可以是 `信息不准确`、`没回答到点上`、`其他`，也可以留空。问题、回答、命中片段和模型 id 由服务端从这一轮记录填写。

列表接口只返回至少有一条消息的会话，所以第一问要等回答写入之后才会出现在侧栏。

## 会话、停止、重试、超时、反馈、限流与安全

每一轮新建一个 Agent，把库里的 `AgentMessage` 放进初始消息，再 `prompt()` 新问题。错误回答在交给模型前会被滤掉。

- **停止**：`POST /api/chat/stop`，请求体 `{ "sessionId" }`。只对当前访客正在生成的那一轮调用 `agent.abort()`，半段回答以 `stopReason: "aborted"` 写入。界面显示「已停止生成」。没有正文时只保留重新生成。
- **连接断开**：浏览器自己断开时也会 `abort()`。这不是用户点的停止，这一轮不写入。
- **重试**：`retry: true` 只丢掉末尾 `stopReason === "error"` 的助手消息，已成功的工具结果留着，再 `continue()`。
- **重新生成**：`regenerate: true` 丢掉最后一条用户问题之后的内容，用库里的记录 `continue()`。
- **超时**：`MODEL_TIMEOUT_MS` 默认 `90000`，至少 `1000`。到点后这条回答的 `stopReason` 为 `error`，文案统一为「模型响应超时」。清理还会去掉密钥、连接串和过长堆栈。
- **反馈**：`POST /api/feedback`。`pnpm feedback:report` 先跑迁移，再打印最近 20 条点踩的时间、原因、问题和命中片段。
- **限流**：聊天和反馈各有一个按 IP 的窗口，默认 60 秒 20 次（`RATE_LIMIT_WINDOW_MS`、`RATE_LIMIT_MAX`）。超限返回 429。`TRUST_PROXY=1` 时按反向代理的转发头识别 IP。
- **安全**：模型密钥和向量密钥只在服务端。访客 cookie 名 `resume_visitor`，`HttpOnly`、`SameSite=Lax`，`COOKIE_SECURE=1` 时再加 `Secure`，有效期 400 天。别人的会话返回 404。错误文案经过 `sanitizeErrorMessage`。

会话接口：

| 方法 | 路径 | 作用 |
| --- | --- | --- |
| `GET` | `/api/sessions?q=` | 当前访客的对话，可按标题或内容搜索 |
| `GET` | `/api/sessions/:id` | 消息、思维链、卡片、`stopped`、`error`、最新 `rating` |
| `PATCH` | `/api/sessions/:id` | `{ "title" }`，去掉多余空白，最长 80 字 |
| `DELETE` | `/api/sessions/:id` | 删除这轮对话 |
| `GET` | `/api/health` | `{ ok, mock, provider, model }` |
| `GET` | `/api/profile` | 档案卡片 |
| `GET` | `/api/projects/:id` | 项目全文 |

标题默认来自第一个问题，超过 40 字会截断。分组是今天、最近 7 天、更早。

演示模式 `CHAT_MOCK=1` 不调用模型。`CHAT_MOCK_DELAY_MS` 默认 350，加在每条工具结束和正文增量之前。预设回答仍会写入数据库。发送「模拟超时」会得到一条可重试的超时回答。界面会写明答案是本地演示。

## 前端

开发服务器是 Vite，端口 `5174`，把 `/api`、`/media`、`/resume` 代理到 `http://127.0.0.1:8787`。生产构建在 `packages/frontend/dist`，后端在该目录存在时托管它。

布局：桌面左侧会话栏宽 260px，对话列 `.thread-inner` 为 `min(768px, 100%)`，左右各 24px，内容宽 720px。窄屏断点是 960px。手机顶栏标题是「简历问答」，历史从抽屉打开，遮罩盖住抽屉右侧。手机上 `visualViewport` 把高度和偏移写成 `--vvh`、`--vv-top`，固定定位的页面跟着可见区域走，避免键盘挡住输入框。

主题在 `packages/frontend/src/theme.ts`。主色 `#0057c2`，主色浅底 `#d9e2ff`，正文 `#111c2a`，次要文字 `#414755`，辅助文字 `#727786`，成功 `#216d00`，错误 `#ba1a1a`，页面底 `#f8f9ff`。`ConfigProvider` 关闭了两个字按钮的自动空格。应用包在 antd `App` 里，删除确认因此能用到圆角 12px 和错误色。

界面状态包括：欢迎页、会话列表和对话的骨架、生成中的「正在检索简历…」（一旦有工具步骤就只显示步骤）、停止、回答内的错误和重试、点赞与点踩、空列表「还没有对话」、搜索「搜不到」、连不上服务时的整页说明。离线说明固定为「请检查网络后重试」，原始错误只 `console.error`。

## 本地开发

需要 Node.js 22 和 pnpm 10。

```bash
cd resume-agent
pnpm install
cp .env.example .env
docker compose up -d
pnpm migrate
pnpm ingest
pnpm dev
```

浏览器打开 <http://127.0.0.1:5174>。只看界面、不调用模型：

```bash
CHAT_MOCK=1 pnpm --filter @resume/backend dev
pnpm --filter @resume/frontend dev
```

| 命令 | 作用 |
| --- | --- |
| `pnpm migrate` | 执行 SQL 迁移。后端启动时也会再跑一次 |
| `pnpm ingest` | 先编译检索包，再切块、向量化，事务内重建 `resume_chunks` |
| `pnpm dev` | 编译检索包后，同时启动后端 `8787` 和前端 `5174` |
| `pnpm test` | 检索测试，以及后端的工具、SSE、会话和反馈测试 |
| `pnpm feedback:report` | 打印最近的点踩 |
| `pnpm typecheck` | 三个包做类型检查 |
| `pnpm lint` | ESLint |
| `pnpm build` | 编译三个包。之后可 `pnpm --filter @resume/backend start` |
| `pnpm --filter @resume/frontend preview` | 预览前端构建，端口 `4174` |

`docker compose up -d` 使用镜像 `pgvector/pgvector:pg16`，用户、密码和库名都是 `resume`，端口 `5432`。数据卷是 `resume_pg`。第一次初始化会执行 `docker/init-test-db.sql`，创建 `resume_test`。数据卷已经存在、测试库还没有时：

```bash
docker compose exec postgres psql -U resume -d resume -c 'CREATE DATABASE resume_test OWNER resume'
```

`pnpm test` 连接 `postgres://resume:resume@127.0.0.1:5432/resume_test`，会清空表。不要把 `DATABASE_URL` 指到这份测试库去存真实反馈。

环境变量写在 `resume-agent/.env`。进程里已经存在的变量不会被文件覆盖。

| 变量 | 默认 | 作用 |
| --- | --- | --- |
| `DEEPSEEK_API_KEY` | 空 | 对话密钥。pi-ai 的 deepseek 提供方读取它 |
| `DEEPSEEK_MODEL` | 自动选择 | 不填则在 pi-ai 的 deepseek 目录里选模型，见下文 |
| `EMBEDDING_BASE_URL` | `https://api.siliconflow.cn/v1` | OpenAI 兼容的 embeddings 根地址 |
| `EMBEDDING_MODEL` | `BAAI/bge-m3` | 向量模型名 |
| `EMBEDDING_API_KEY` | 空 | 向量接口密钥。检索和 `pnpm ingest` 需要它 |
| `EMBEDDING_DIMENSION` | `1024` | 必须与 `vector(1024)` 一致 |
| `DATABASE_URL` | 无，必填 | 例如 `postgres://resume:resume@127.0.0.1:5432/resume` |
| `PORT` | `8787` | 后端端口 |
| `COOKIE_SECURE` | `0` | 设为 `1` 时访客 cookie 加 `Secure` |
| `RESUME_DIR` | `data/resume` | 简历原文目录，相对仓库根由代码解析为绝对路径 |
| `PUBLIC_DIR` | `data/public` | 头像等静态文件，经 `/media` 提供 |
| `RATE_LIMIT_WINDOW_MS` | `60000` | 限流窗口 |
| `RATE_LIMIT_MAX` | `20` | 窗口内聊天、反馈各自允许的次数 |
| `CHAT_MOCK` | `0` | `1` 时 `/api/chat` 返回预设 SSE |
| `CHAT_MOCK_DELAY_MS` | `350` | 演示模式下工具结束和正文增量之前的等待，单位毫秒 |
| `MODEL_TIMEOUT_MS` | `90000` | 单次模型请求超时，至少 1000 |
| `CORS_ORIGIN` | `http://127.0.0.1:5174,http://localhost:5174` | 逗号分隔的前端来源 |
| `TRUST_PROXY` | `0` | `1` 时信任 `X-Forwarded-For` |

0.99.1 的 deepseek 目录里是 `deepseek-flash`（DeepSeek V4.1 Flash）和 `deepseek-v4-pro`（DeepSeek V4 Pro），两者 `reasoning` 都是 true。默认规则先找 `reasoning === false`，没有则在全部模型里选 id 或名字带 flash 的，因此默认是 `deepseek-flash`。Agent 的思考级别保持运行时默认的 off。指定其他 id 时设置 `DEEPSEEK_MODEL`，值必须出现在 `getBuiltinModels("deepseek")` 里。

## 如何替换成自己的简历

1. 编辑 `data/resume/profile.json`：姓名、`headline`、技能、联系方式、PDF 路径。换成真实内容后把 `example` 设为 `false`，「示例数据」标签会消失。
2. 替换 `data/public/` 里的头像和 PDF，或修改档案里的 `avatar`、`resumePdf`、`resumePdfFilename`。头像默认 `/media/avatar.svg`，PDF 默认 `/resume/example.pdf`。
3. 修改 `data/resume/entries.json`。每条字段为 `id`、`type`、`title`、`period`、`tech_stack`、`text`。`type` 只能是 `experience`、`project`、`skill`、`education`。
4. 也可以在 `data/resume/` 下另放 Markdown。`samples/`、`*.example.md` 和 `README.md` 会被跳过。frontmatter 示例：

```markdown
---
id: proj-harbor
type: project
title: 港湾协作平台
period: 2023.03 - 2024.01
tech_stack:
  - React
  - Node.js
---

这里写这个项目的全文。
```

5. 重新导入：

```bash
pnpm ingest
```

档案卡片、联系方式和按 id 读项目全文在改完文件后即可生效。混合检索要等导入完成。更换向量模型后如果维度不再是 1024，要先改迁移里的 `vector(1024)` 和 `VECTOR_DIMENSION`，再重新导入。

## 后续计划

- 登录，把 `visitors.user_id` 挂到已预留的 `users`。
- 主人后台，用来看点踩和整理简历，而不是只靠 `pnpm feedback:report`。
- 用真实简历评估检索：类型、技术栈和年份过滤是否召回了该召回的片段。

这些都还没有实现。进展记在 [CHANGELOG.md](CHANGELOG.md) 的「未发布」一节。
