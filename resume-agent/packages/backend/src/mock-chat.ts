import type { SseEvent } from "./sse.js";

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

function toolStart(name: string, label: string, args: Record<string, unknown>): SseEvent {
  return {
    event: "tool_start",
    data: { toolCallId: `mock-${name}`, name, label, status: "pending", args },
  };
}

function toolEnd(name: string, label: string, details: Record<string, unknown>, content: string): SseEvent {
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

/**
 * 本地界面预览用的预设对话，不调用模型。
 * 文案对应 data/resume 里的示例人物，方便在没有密钥时看卡片和思维链。
 */
export function buildMockEvents(message: string): SseEvent[] {
  if (/联系|电话|邮箱|微信/.test(message)) {
    return [
      toolStart("get_contact", "正在获取联系方式", {}),
      toolEnd(
        "get_contact",
        "正在获取联系方式",
        {
          kind: "contact",
          email: "lin.zhixia.example@example.com",
          phone: "+86 138-0000-0000",
          github: "https://github.com/example-lin-zhixia",
          website: "https://example.com/lin-zhixia",
        },
        "邮箱：lin.zhixia.example@example.com",
      ),
      ...deltas("简历里留下的联系方式是邮箱 lin.zhixia.example@example.com，电话 +86 138-0000-0000。这是示例数据里的联系方式。"),
      { event: "done", data: { reason: "agent_end" } },
    ];
  }
  if (/下载|pdf/i.test(message)) {
    return [
      toolStart("download_resume", "正在获取简历文件", {}),
      toolEnd(
        "download_resume",
        "正在获取简历文件",
        { kind: "download", url: "/resume/example.pdf", filename: "林知夏-简历-示例.pdf" },
        "简历 PDF：/resume/example.pdf",
      ),
      ...deltas("可以下载示例简历 PDF。换成真实文件后，这里会指向主人的简历。"),
      { event: "done", data: { reason: "agent_end" } },
    ];
  }
  return [
    toolStart("search_resume", "正在查阅相关经历", {
      query: message,
      type: "project",
      tech_stack: "React",
      period_from: "2023",
    }),
    toolEnd(
      "search_resume",
      "正在查阅相关经历",
      { kind: "search", items: [harbor, starmap] },
      "找到 2 条简历片段。",
    ),
    ...deltas(
      "2023 年之后，简历里和 React 相关的项目主要有两个。港湾协作平台（2023.03 - 2024.01）用了 React、TypeScript 和 Node.js。星图检索台（2024.06 - 2025.02）也是 React 加 Node.js。更早的票据归档小工具不是 React。",
    ),
    { event: "done", data: { reason: "agent_end" } },
  ];
}
