import type { AgentMessage } from "@earendil-works/pi-agent-core";
import type { Api, AssistantMessage } from "@earendil-works/pi-ai";
import type { SseEvent } from "./sse.js";

type Json = string | number | boolean | null | Json[] | { [key: string]: Json };

const harbor = {
  id: "proj-harbor",
  type: "project" as const,
  title: "港湾协作平台",
  period: "2023.03 - 2024.01",
  tech_stack: ["React", "TypeScript", "Node.js"],
  snippet: "示例项目。星河科技的团队协作看板，2023 年之后较完整的 React 项目。",
};

const starmap = {
  id: "proj-starmap",
  type: "project" as const,
  title: "星图检索台",
  period: "2024.06 - 2025.02",
  tech_stack: ["React", "Node.js", "TypeScript"],
  snippet: "示例项目。云栖实验室的内部检索台，2024 年之后的 React 项目。",
};

interface ModelRef {
  api: Api;
  provider: string;
  id: string;
}

function emptyUsage(): AssistantMessage["usage"] {
  return {
    input: 0,
    output: 0,
    cacheRead: 0,
    cacheWrite: 0,
    totalTokens: 0,
    cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0, total: 0 },
  };
}

function toolStart(name: string, label: string, args: { [key: string]: Json }): SseEvent {
  return {
    event: "tool_start",
    data: { toolCallId: `mock-${name}`, name, label, status: "pending", args },
  };
}

function toolEnd(name: string, label: string, details: { [key: string]: Json }, content: string): SseEvent {
  return {
    event: "tool_end",
    data: {
      toolCallId: `mock-${name}`,
      name,
      label,
      status: "success",
      isError: false,
      content,
      details,
    },
  };
}

function deltas(text: string): SseEvent[] {
  const parts = text.split(/(?<=。)/);
  return parts.filter(Boolean).map((delta) => ({ event: "text_delta", data: { delta } }));
}

function assistantMessage(model: ModelRef, content: AssistantMessage["content"], stopReason: AssistantMessage["stopReason"]): AssistantMessage {
  return {
    role: "assistant",
    content,
    api: model.api,
    provider: model.provider,
    model: model.id,
    usage: emptyUsage(),
    stopReason,
    timestamp: Date.now(),
  };
}

function toolMessages(
  model: ModelRef,
  name: string,
  args: { [key: string]: Json },
  details: { [key: string]: Json },
  content: string,
): AgentMessage[] {
  return [
    assistantMessage(
      model,
      [{ type: "toolCall", id: `mock-${name}`, name, arguments: args }],
      "toolUse",
    ),
    {
      role: "toolResult",
      toolCallId: `mock-${name}`,
      toolName: name,
      content: [{ type: "text", text: content }],
      details,
      isError: false,
      timestamp: Date.now(),
    },
  ];
}

export interface MockAnswer {
  events: SseEvent[];
  /** 不含用户问题。调用方把用户消息接在前面，重新生成时则接到已有问题上。 */
  messages: AgentMessage[];
}

/**
 * 本地界面预览用的预设对话，不调用模型。
 * 文案对应 data/resume 里的示例人物。返回的消息会写进数据库，刷新后卡片还在。
 */
export function buildMockAnswer(message: string, model: ModelRef): MockAnswer {
  if (/联系|电话|邮箱|微信/.test(message)) {
    const details = {
      kind: "contact",
      email: "lin.zhixia.example@example.com",
      phone: "+86 138-0000-0000",
      github: "https://github.com/example-lin-zhixia",
      website: "https://example.com/lin-zhixia",
    };
    const content = "邮箱：lin.zhixia.example@example.com";
    const text = "简历里留下的联系方式是邮箱 lin.zhixia.example@example.com，电话 +86 138-0000-0000。这是示例数据里的联系方式。";
    return {
      events: [
        toolStart("get_contact", "正在获取联系方式", {}),
        toolEnd("get_contact", "正在获取联系方式", details, content),
        ...deltas(text),
      ],
      messages: [
        ...toolMessages(model, "get_contact", {}, details, content),
        assistantMessage(model, [{ type: "text", text }], "stop"),
      ],
    };
  }
  if (/下载|pdf/i.test(message)) {
    const details = { kind: "download", url: "/resume/example.pdf", filename: "林知夏-简历-示例.pdf" };
    const content = "简历 PDF：/resume/example.pdf";
    const text = "可以下载示例简历 PDF。换成真实文件后，这里会指向主人的简历。";
    return {
      events: [
        toolStart("download_resume", "正在获取简历文件", {}),
        toolEnd("download_resume", "正在获取简历文件", details, content),
        ...deltas(text),
      ],
      messages: [
        ...toolMessages(model, "download_resume", {}, details, content),
        assistantMessage(model, [{ type: "text", text }], "stop"),
      ],
    };
  }
  const args = { query: message, type: "project", tech_stack: "React", period_from: "2023" };
  const details = { kind: "search", items: [harbor, starmap] };
  const content = "找到 2 条简历片段。";
  const text =
    "2023 年之后，简历里和 React 相关的项目主要有两个。港湾协作平台（2023.03 - 2024.01）用了 React、TypeScript 和 Node.js。星图检索台（2024.06 - 2025.02）也是 React 加 Node.js。更早的票据归档小工具不是 React。";
  return {
    events: [
      toolStart("search_resume", "正在查阅相关经历", args),
      toolEnd("search_resume", "正在查阅相关经历", details, content),
      ...deltas(text),
    ],
    messages: [
      ...toolMessages(model, "search_resume", args, details, content),
      assistantMessage(model, [{ type: "text", text }], "stop"),
    ],
  };
}

export function buildMockEvents(message: string): SseEvent[] {
  return [
    ...buildMockAnswer(message, { api: "openai-completions", provider: "deepseek", id: "deepseek-flash" }).events,
    { event: "done", data: { reason: "agent_end" } },
  ];
}
