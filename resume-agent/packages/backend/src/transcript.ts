import { randomUUID } from "node:crypto";
import type { AgentMessage } from "@earendil-works/pi-agent-core";

/** 与安装的 @earendil-works/pi-agent-core 版本对齐。升级库之后要另写数据迁移。 */
export const AGENT_FORMAT_VERSION = "pi-agent-core@0.99.1";

export interface UiDetails {
  toolCallId: string;
  toolName: string;
  label: string;
  isError: boolean;
  details: unknown;
}

export interface StoredRow {
  id: string;
  seq: number;
  formatVersion: string;
  agentMessage: AgentMessage;
  uiDetails: UiDetails | null;
}

export interface PublicToolStep {
  toolCallId: string;
  name: string;
  label: string;
  status: "pending" | "success" | "error";
  content?: string;
  details?: unknown;
}

export interface PublicMessage {
  id: string;
  role: "user" | "assistant";
  text: string;
  tools?: PublicToolStep[];
  rating?: "like" | "dislike" | null;
}

export function assertFormatVersions(rows: readonly StoredRow[]): void {
  for (const row of rows) {
    if (row.formatVersion !== AGENT_FORMAT_VERSION) {
      throw new Error(
        `这段对话是用 ${row.formatVersion} 保存的，当前助手只认识 ${AGENT_FORMAT_VERSION}。请新开一轮。`,
      );
    }
  }
}

export function messageText(message: AgentMessage): string {
  if (message.role === "user") {
    if (typeof message.content === "string") return message.content;
    return message.content
      .map((part) => (part.type === "text" ? part.text : ""))
      .filter(Boolean)
      .join("");
  }
  if (message.role === "assistant" || message.role === "toolResult") {
    return message.content
      .map((part) => (part.type === "text" ? part.text : ""))
      .filter(Boolean)
      .join("");
  }
  return "";
}

export function rowsFromAgentMessages(
  messages: readonly AgentMessage[],
  labels: ReadonlyMap<string, string>,
): StoredRow[] {
  return messages.map((message, seq) => ({
    id: randomUUID(),
    seq,
    formatVersion: AGENT_FORMAT_VERSION,
    agentMessage: message,
    uiDetails: uiDetailsFor(message, labels),
  }));
}

function uiDetailsFor(message: AgentMessage, labels: ReadonlyMap<string, string>): UiDetails | null {
  if (message.role !== "toolResult") return null;
  return {
    toolCallId: message.toolCallId,
    toolName: message.toolName,
    label: labels.get(message.toolName) ?? message.toolName,
    isError: Boolean(message.isError),
    details: message.details ?? null,
  };
}

/** 重新生成时，上下文停在最后一条用户问题上，丢掉这之后的助手回答和工具结果。 */
export function trimToLastUser(rows: readonly StoredRow[]): StoredRow[] | null {
  let lastUser = -1;
  rows.forEach((row, index) => {
    if (row.agentMessage.role === "user") lastUser = index;
  });
  if (lastUser < 0) return null;
  return rows.slice(0, lastUser + 1);
}

export function titleFromMessages(messages: readonly AgentMessage[]): string {
  const user = messages.find((message) => message.role === "user");
  if (!user) return "";
  const text = messageText(user).trim().replace(/\s+/g, " ");
  if (!text) return "";
  return text.length > 40 ? `${text.slice(0, 40)}…` : text;
}

export function lastAssistantId(rows: readonly StoredRow[]): string | null {
  for (let index = rows.length - 1; index >= 0; index -= 1) {
    const row = rows[index];
    if (row?.agentMessage.role === "assistant") return row.id;
  }
  return null;
}

export function projectMessages(
  rows: readonly StoredRow[],
  ratings: ReadonlyMap<string, "like" | "dislike">,
): PublicMessage[] {
  const out: PublicMessage[] = [];
  let assistant: PublicMessage | null = null;
  const flush = () => {
    if (!assistant) return;
    if (assistant.text || (assistant.tools && assistant.tools.length > 0)) out.push(assistant);
    assistant = null;
  };
  for (const row of rows) {
    const message = row.agentMessage;
    if (message.role === "system") continue;
    if (message.role === "user") {
      flush();
      out.push({ id: row.id, role: "user", text: messageText(message) });
      continue;
    }
    if (message.role !== "assistant" && message.role !== "toolResult") continue;
    if (!assistant) {
      assistant = {
        id: row.id,
        role: "assistant",
        text: "",
        tools: [],
        rating: ratings.get(row.id) ?? null,
      };
    }
    if (message.role === "assistant") {
      assistant.id = row.id;
      assistant.rating = ratings.get(row.id) ?? null;
      assistant.text += messageText(message);
      continue;
    }
    const details = row.uiDetails?.details ?? message.details;
    const content = messageText(message);
    const isError = row.uiDetails?.isError ?? message.isError;
    assistant.tools = [
      ...(assistant.tools ?? []),
      {
        toolCallId: row.uiDetails?.toolCallId ?? message.toolCallId,
        name: row.uiDetails?.toolName ?? message.toolName,
        label: row.uiDetails?.label ?? message.toolName,
        status: isError ? "error" : "success",
        ...(content ? { content } : {}),
        ...(details !== undefined && details !== null ? { details } : {}),
      },
    ];
  }
  flush();
  return out;
}

export function feedbackSource(
  rows: readonly StoredRow[],
  messageId: string,
): { question: string; answer: string; chunkIds: string[]; modelId: string } | null {
  const index = rows.findIndex((row) => row.id === messageId);
  const target = index >= 0 ? rows[index] : undefined;
  if (!target || target.agentMessage.role !== "assistant") return null;
  let userIndex = -1;
  for (let cursor = index; cursor >= 0; cursor -= 1) {
    if (rows[cursor]?.agentMessage.role === "user") {
      userIndex = cursor;
      break;
    }
  }
  if (userIndex < 0) return null;
  let end = index;
  for (let cursor = index + 1; cursor < rows.length; cursor += 1) {
    if (rows[cursor]?.agentMessage.role === "user") break;
    end = cursor;
  }
  const slice = rows.slice(userIndex, end + 1);
  const questionRow = slice[0];
  if (!questionRow) return null;
  const answer = slice
    .filter((row) => row.agentMessage.role === "assistant")
    .map((row) => messageText(row.agentMessage))
    .join("");
  const chunkIds: string[] = [];
  for (const row of slice) {
    if (row.agentMessage.role !== "toolResult") continue;
    chunkIds.push(...chunkIdsFrom(row.uiDetails?.details ?? row.agentMessage.details));
  }
  return {
    question: messageText(questionRow.agentMessage),
    answer,
    chunkIds,
    modelId: target.agentMessage.model,
  };
}

function chunkIdsFrom(details: unknown): string[] {
  if (!details || typeof details !== "object" || !("kind" in details) || details.kind !== "search") return [];
  if (!("items" in details) || !Array.isArray(details.items)) return [];
  return details.items
    .map((item) => {
      if (!item || typeof item !== "object" || !("id" in item) || typeof item.id !== "string") return "";
      return item.id;
    })
    .filter(Boolean);
}
