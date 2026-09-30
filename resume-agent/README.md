# 简历问答助手

访客（主要是招聘方）在网页里提问，助手用工具和检索回答简历里的内容。当前数据是虚构人物 **林知夏** 的示例，方便先把流程跑通。

界面是 React + Vite + antd 6 + Ant Design X。后端是独立的 Express 5 服务。对话由 `@earendil-works/pi-agent-core` 驱动，模型走 pi-ai 自带的 `deepseek` 提供方。简历片段和业务数据都在同一个 PostgreSQL 里，向量用 pgvector。向量来自任意 OpenAI 兼容的 `/v1/embeddings`。

## 目录

```text
resume-agent/
  docker-compose.yml    本地 Postgres（pgvector/pgvector）
  migrations/           node-pg-migrate 的 SQL 迁移
  data/resume/          简历原文（档案 JSON、条目 JSON、可选 Markdown）
  data/public/          头像和示例 PDF
  packages/retrieval/   切块、向量客户端、VectorStore（pgvector 实现）
  packages/backend/     工具、Agent、会话、反馈、SSE
  packages/frontend/    聊天页
```

## 准备

需要 Node.js 22 和 pnpm 10。

```bash
cd resume-agent
pnpm install
cp .env.example .env
```

在 `.env` 里填写：

| 变量 | 作用 |
| --- | --- |
| `DEEPSEEK_API_KEY` | 对话密钥。pi-ai 会自己读它，代码里不写死 |
| `DEEPSEEK_MODEL` | 可选。不填则自动选择，见下文 |
| `EMBEDDING_BASE_URL` | 默认 `https://api.siliconflow.cn/v1` |
| `EMBEDDING_MODEL` | 默认 `BAAI/bge-m3`（1024 维） |
| `EMBEDDING_API_KEY` | 向量接口密钥 |
| `EMBEDDING_DIMENSION` | 默认 `1024`，必须和迁移里的 `vector(1024)` 一致 |
| `DATABASE_URL` | Postgres 连接串 |
| `COOKIE_SECURE` | HTTPS 部署时设为 `1`，给访客 cookie 加 Secure |
| `PORT` | 后端端口，默认 `8787` |
| `RATE_LIMIT_WINDOW_MS` / `RATE_LIMIT_MAX` | 聊天和反馈接口各自按 IP 限流，默认 60 秒 20 次 |
| `CHAT_MOCK` | `1` 时不调用模型，返回预设对话，只适合本地看界面 |
| `CORS_ORIGIN` | 允许的前端来源 |
| `TRUST_PROXY` | 在反向代理后按转发头取 IP 时设为 `1` |

密钥只放在服务端。前端没有模型地址，也没有 API key。

## 换成自己的简历

1. 编辑 `data/resume/profile.json`：姓名、一句话介绍、技能标签、联系方式、PDF 路径。换成真实内容后把 `example` 设为 `false`，页面上的「示例数据」标签会消失。
2. 用 `data/public/` 里的头像和 PDF 替换示例文件，或改档案里的 `avatar`、`resumePdf`。
3. 改 `data/resume/entries.json`。每一条是一个片段，字段为 `id`、`type`、`title`、`period`、`tech_stack`、`text`。`type` 只能是 `experience`、`project`、`skill`、`education`。一条工作、一个项目、一组技能或一条教育经历各写一块，不要把整份简历塞进同一条。
4. 也可以在 `data/resume/` 下另放 Markdown（`samples/` 和 `*.example.md` 会被跳过）：

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

5. 重新导入索引：

```bash
pnpm ingest
```

导入在一个事务里清空并重写 `resume_chunks`。片段 `id` 沿用原文，不会重新生成。中途失败会回滚，旧数据还在。更换 `EMBEDDING_MODEL` 后如果维度不再是 1024，要先改迁移里的 `vector(1024)`，再重跑导入。档案卡片、联系方式和「查看详情」直接读原文，改完即可生效；混合检索要等导入之后才会更新。

## 常用命令

```bash
docker compose up -d
pnpm migrate     # 建表。服务启动时也会再跑一次
pnpm ingest      # 切块、向量化，事务内重建片段
pnpm dev         # 同时启动后端 8787 和前端 5174
pnpm test        # 切块、pgvector 检索、工具、会话与反馈
pnpm feedback:report   # 打印最近的点踩
pnpm typecheck
pnpm lint
pnpm build       # 三个包都编译；之后可用 pnpm --filter @resume/backend start
```

开发时打开 <http://127.0.0.1:5174>。没有密钥、只想看界面时：

```bash
CHAT_MOCK=1 pnpm --filter @resume/backend dev
pnpm --filter @resume/frontend dev
```

演示模式会标明「回答是预设的」。演示回答也会写入数据库，刷新后卡片还在。

## 数据库

本地用 `docker compose up -d` 启动 `pgvector/pgvector:pg16`。第一次初始化时会顺带创建测试库 `resume_test`。已经有数据卷、库还没建的话：

```bash
docker compose exec postgres psql -U resume -d resume -c 'CREATE DATABASE resume_test OWNER resume'
```

`pnpm test` 连的是 `postgres://resume:resume@127.0.0.1:5432/resume_test`，会清空表，不要指到有真实反馈的库。

迁移工具是 [node-pg-migrate](https://github.com/salsita/node-pg-migrate)，SQL 在 `migrations/`。向量列、HNSW 索引和生成的 `tsvector` 用 SQL 写比较直接，已执行的版本记在 `pgmigrations`。

表：

| 表 | 内容 |
| --- | --- |
| `users` | 预留。现在没有登录 |
| `visitors` | 匿名访客。`user_id` 先空着，以后挂到 `users` |
| `sessions` | 某个访客的一轮对话，标题来自第一个问题 |
| `messages` | 每条 `AgentMessage` 原样放在 `agent_message`（jsonb），另有 `format_version`（当前 `pi-agent-core@0.99.1`）和 `ui_details`（卡片数据） |
| `feedback` | 点赞或点踩 |
| `resume_chunks` | 简历片段、结巴分词后的 `tsvector`、`vector(1024)` |

访客身份是服务端签发的 `resume_visitor` cookie（httpOnly）。没有登录。对话列表、搜索和继续都走接口，并且只返回这个访客自己的会话。浏览器传来的历史不会被采纳；会话 id 对不上这个访客时，聊天会新开一轮并返回新的 id。

中文全文检索不用 zhparser（托管 Postgres 常常装不了）。入库和查询时用 `@node-rs/jieba` 的搜索模式切词，把词写入 `search_tokens`，再交给 `to_tsvector('simple', ...)`。查询同样切词，拼成 OR 的 tsquery。向量走 HNSW（cosine）。两边各取一截候选，用 RRF（k = 60）合并，同时可以按 type、技术栈和年份过滤。

`VectorStore` 只有 `upsert`、`rebuild`、`delete`、`search`。换别的向量库时实现这一组即可。`rebuild` 在一个事务里删除再插入，id 用简历原文里的稳定 id。

升级 `@earendil-works/pi-agent-core` 之后，旧的 `format_version` 对不上，继续那一轮会提示新开对话，需要另写迁移转换 jsonb。

## 模型

提供方 id 是 `deepseek`。可选模型来自已安装的 `@earendil-works/pi-ai`，用 `getBuiltinModels("deepseek")` 读取，不在仓库里抄一份模型表。

0.99.1 的目录里是：

| id | 名称 | reasoning |
| --- | --- | --- |
| `deepseek-flash` | DeepSeek V4.1 Flash | true |
| `deepseek-v4-pro` | DeepSeek V4 Pro | true |

没有 `reasoning: false` 的条目。默认规则仍是：先找 `reasoning === false` 的模型，其中再偏好 id 或名字带 flash 的；若一个都没有，就在全部模型里选 flash。因此当前默认是 `deepseek/deepseek-flash`。Agent 的思考级别保持运行时默认的 off，简历问答靠检索和工具。要用另一个 id，设置 `DEEPSEEK_MODEL`。

## 工具

助手只有这四个工具。`content` 是给模型的短文本，`details` 是给界面卡片的结构。pi-ai 发给 DeepSeek 的工具结果只用 `content`，`details` 不会进模型上下文。

| 工具 | 界面状态 | 作用 |
| --- | --- | --- |
| `search_resume` | 正在查阅相关经历 | 向量加全文的混合检索，可按 type、tech_stack、年份过滤 |
| `get_project_detail` | 正在查阅项目详情 | 按 id 读项目全文，不走向量 |
| `download_resume` | 正在获取简历文件 | 返回 PDF 地址 |
| `get_contact` | 正在获取联系方式 | 返回邮箱、电话和主页 |

系统提示要求第三人称，只根据工具查到的内容回答；简历里没有的事情要直说，并建议用联系方式联系本人。

## SSE 协议

`POST /api/chat`，请求体 `{ "message": "…", "sessionId"?: "…", "regenerate"?: false }`，响应 `text/event-stream`。不接受 `history`。`sessionId` 必须属于当前访客，否则当作新会话。`regenerate: true` 时服务端丢掉最后一条助手回答，用库里的记录调用 `agent.continue()`（此时最后一条必须是用户消息）。客户端断开时服务端调用 `agent.abort()`。`agent.prompt()` 本身不接收 AbortSignal。

每一轮都会新建一个 Agent，把库里的 `AgentMessage` 放进 `initialState.messages`，再 `prompt()` 新问题。这样模型能看到之前的工具调用和工具结果。

每条消息是：

```text
event: <name>
data: <json>

```

| event | data | 何时发送 |
| --- | --- | --- |
| `session` | `{ sessionId }` | 开头。请记住它，下一轮原样传回 |
| `text_delta` | `{ delta }` | `message_update` 里 `assistantMessageEvent.type === "text_delta"` |
| `tool_start` | 见下，`status: "pending"` | `tool_execution_start`。这个事件没有 label，服务端按工具名查中文 label |
| `tool_progress` | 见下，`status: "pending"` | `tool_execution_update` |
| `tool_end` | 见下，`status: "success"` 或 `"error"` | `tool_execution_end` 的 `result` 与 `isError` |
| `error` | `{ message }` | 助手消息 `stopReason === "error"`，或服务端捕获的失败 |
| `done` | `{ reason: "agent_end", sessionId, messageId }` | 一轮已经写入数据库。`messageId` 是这条回答的 id，反馈接口用它 |

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

`args` 出现在开始时，`content` / `details` / `isError` 出现在结束时。`details.kind`：

- `search`：`items[]` 含 `id`、`type`、`title`、`period`、`tech_stack`、`snippet`。界面画引用标签；`type === "project"` 再画项目卡片。
- `project`：项目全文。`project_missing` 表示这个 id 不是项目。
- `download`：`url`、`filename`。
- `contact`：`email`、`phone`、`github`、`website`。

Ant Design X 的 ThoughtChain 状态是 `loading` / `success` / `error` / `abort`。这里的 `pending` 对应 `loading`，`success` 和 `error` 同名。步骤结束后从展开列表里拿掉，思维链收起。

未配置密钥时聊天接口返回 503，超限返回 429，上一轮还没结束返回 409，重新生成时找不到会话返回 404。这些是普通 JSON，不是 SSE。

`GET /api/sessions?q=` 列出当前访客的对话，可按标题或内容搜索。界面按今天、昨天、近 7 天、更早分组。`GET /api/sessions/:id` 取回消息、思维链和卡片。别人的会话返回 404。

`POST /api/feedback`，请求体 `{ sessionId, messageId, rating, reason?, comment? }`。`rating` 是 `like` 或 `dislike`。点踩的原因可以是 `信息不准确`、`没回答到点上`、`其他`，也可以留空。问题、回答、命中的片段 id 和模型 id 由服务端从这一轮记录里填写，不信浏览器。这个接口同样按 IP 限流。`pnpm feedback:report` 打印最近的点踩。

`GET /api/projects/:id` 走的是同一个 `get_project_detail`，给「查看详情」抽屉用，不会再开一轮模型。

回答下面有复制、重新生成、有用、没用。没用会在回答下方打开一个小层，原因和补充说明都可以跳过。
