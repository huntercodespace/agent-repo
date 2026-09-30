import type { AgentTool } from "@earendil-works/pi-agent-core";
import type { Profile, ResumeChunk, SearchQuery } from "@resume/retrieval";
import { Type, type TSchema } from "typebox";

function defineTool<T extends TSchema>(tool: AgentTool<T>): AgentTool {
  return tool;
}

export interface ResumeLookup {
  search(query: SearchQuery): Promise<ResumeChunk[]>;
  getById(id: string): Promise<ResumeChunk | null>;
  getProfile(): Profile;
}

const chunkType = Type.Union([
  Type.Literal("experience"),
  Type.Literal("project"),
  Type.Literal("skill"),
  Type.Literal("education"),
]);

function snippet(value: string): string {
  const flat = value.replace(/\s+/g, " ").trim();
  return flat.length > 140 ? `${flat.slice(0, 140)}…` : flat;
}

function summaryLine(chunk: ResumeChunk): string {
  const stack = chunk.tech_stack.length ? `，技术栈：${chunk.tech_stack.join("、")}` : "";
  const period = chunk.period ? `（${chunk.period}）` : "";
  return `- [${chunk.type}] ${chunk.title}${period}${stack}：${snippet(chunk.text)}`;
}

export function createResumeTools(lookup: ResumeLookup): AgentTool[] {
  const searchResume = defineTool({
    name: "search_resume",
    label: "正在查阅相关经历",
    description: "在简历里混合检索经历、项目、技能组或教育背景。可按类型、技术栈和年份过滤。",
    parameters: Type.Object({
      query: Type.String({ description: "检索词，例如技术、项目名或时间" }),
      type: Type.Optional(chunkType),
      tech_stack: Type.Optional(Type.String({ description: "可选，按一项技术过滤，例如 React" })),
      period_from: Type.Optional(Type.String({ description: "可选，只保留该年及之后仍相关的条目，例如 2023" })),
      period_to: Type.Optional(Type.String({ description: "可选，只保留该年及之前已经开始的条目，例如 2024" })),
    }),
    execute: async (_toolCallId, params) => {
      const periodFrom = params.period_from ? Number(params.period_from) : undefined;
      const periodTo = params.period_to ? Number(params.period_to) : undefined;
      if (params.period_from && !Number.isInteger(periodFrom)) {
        throw new Error("period_from 必须是年份");
      }
      if (params.period_to && !Number.isInteger(periodTo)) {
        throw new Error("period_to 必须是年份");
      }
      const hits = await lookup.search({
        query: params.query,
        ...(params.type ? { type: params.type } : {}),
        ...(params.tech_stack ? { techStack: params.tech_stack } : {}),
        ...(periodFrom !== undefined ? { periodFrom } : {}),
        ...(periodTo !== undefined ? { periodTo } : {}),
      });
      const content = hits.length
        ? `找到 ${hits.length} 条简历片段：\n${hits.map(summaryLine).join("\n")}\n请只根据这些片段回答。`
        : `简历中没有检索到与「${params.query}」相关的内容。`;
      return {
        content: [{ type: "text", text: content }],
        details: {
          kind: "search",
          items: hits.map((chunk) => ({
            id: chunk.id,
            type: chunk.type,
            title: chunk.title,
            period: chunk.period,
            tech_stack: chunk.tech_stack,
            snippet: snippet(chunk.text),
          })),
        },
      };
    },
  });

  const getProjectDetail = defineTool({
    name: "get_project_detail",
    label: "正在查阅项目详情",
    description: "按 id 直接读取一个项目的全文，不做向量检索。id 来自 search_resume 的结果。",
    parameters: Type.Object({
      id: Type.String({ description: "项目 id，例如 proj-harbor" }),
    }),
    execute: async (_toolCallId, params) => {
      const chunk = await lookup.getById(params.id);
      if (!chunk || chunk.type !== "project") {
        return {
          content: [{ type: "text", text: `简历中没有 id 为 ${params.id} 的项目。` }],
          details: { kind: "project_missing", id: params.id },
        };
      }
      const stack = chunk.tech_stack.length ? chunk.tech_stack.join("、") : "未写技术栈";
      return {
        content: [
          {
            type: "text",
            text: `项目：${chunk.title}\n时间：${chunk.period || "未写时间"}\n技术栈：${stack}\n${chunk.text}`,
          },
        ],
        details: {
          kind: "project",
          id: chunk.id,
          title: chunk.title,
          period: chunk.period,
          tech_stack: chunk.tech_stack,
          text: chunk.text,
        },
      };
    },
  });

  const downloadResume = defineTool({
    name: "download_resume",
    label: "正在获取简历文件",
    description: "返回简历 PDF 的下载地址。",
    parameters: Type.Object({}),
    execute: async () => {
      const profile = lookup.getProfile();
      if (!profile.resumePdf) throw new Error("简历里没有 PDF 地址");
      return {
        content: [{ type: "text", text: `简历 PDF：${profile.resumePdf}` }],
        details: {
          kind: "download",
          url: profile.resumePdf,
          filename: profile.resumePdfFilename,
        },
      };
    },
  });

  const getContact = defineTool({
    name: "get_contact",
    label: "正在获取联系方式",
    description: "返回简历里写明的邮箱、电话和主页。没有的字段会空着，不要编造。",
    parameters: Type.Object({}),
    execute: async () => {
      const contact = lookup.getProfile().contact;
      const lines = [
        contact.email ? `邮箱：${contact.email}` : "",
        contact.phone ? `电话：${contact.phone}` : "",
        contact.github ? `GitHub：${contact.github}` : "",
        contact.website ? `网站：${contact.website}` : "",
      ].filter(Boolean);
      return {
        content: [{ type: "text", text: lines.join("\n") || "简历里没有留下联系方式。" }],
        details: { kind: "contact", ...contact },
      };
    },
  });

  return [searchResume, getProjectDetail, downloadResume, getContact];
}

export function toolLabelMap(tools: AgentTool[]): Map<string, string> {
  return new Map(tools.map((tool) => [tool.name, tool.label]));
}

/** 步骤结束后换成完成态。进行中的文案仍用各工具自己的 label。 */
const DONE_LABEL: Record<string, string> = {
  search_resume: "已查阅相关经历",
  get_project_detail: "已获取项目详情",
  download_resume: "已获取简历文件",
  get_contact: "已获取联系方式",
};

export function doneToolLabel(name: string): string | undefined {
  return DONE_LABEL[name];
}
