import type { ChatMessage, SessionSummary } from "./types";

export type SessionGroup = "今天" | "昨天" | "近 7 天" | "更早";

export function groupSessions(items: SessionSummary[], now = new Date()): Array<{ label: SessionGroup; items: SessionSummary[] }> {
  const startToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const startYesterday = startToday - 86_400_000;
  const startWeek = startToday - 7 * 86_400_000;
  const buckets: Record<SessionGroup, SessionSummary[]> = {
    今天: [],
    昨天: [],
    "近 7 天": [],
    更早: [],
  };
  for (const item of items) {
    const time = new Date(item.updatedAt).getTime();
    if (time >= startToday) buckets.今天.push(item);
    else if (time >= startYesterday) buckets.昨天.push(item);
    else if (time >= startWeek) buckets["近 7 天"].push(item);
    else buckets.更早.push(item);
  }
  return (["今天", "昨天", "近 7 天", "更早"] as const)
    .filter((label) => buckets[label].length > 0)
    .map((label) => ({ label, items: buckets[label] }));
}

export async function fetchSessions(query: string): Promise<SessionSummary[]> {
  const response = await fetch(`/api/sessions?q=${encodeURIComponent(query)}`);
  const body = (await response.json()) as { sessions?: SessionSummary[]; message?: string };
  if (!response.ok) throw new Error(body.message || "没有读到对话列表");
  return body.sessions ?? [];
}

export async function fetchSession(id: string): Promise<{ id: string; title: string; messages: ChatMessage[] }> {
  const response = await fetch(`/api/sessions/${encodeURIComponent(id)}`);
  const body = (await response.json()) as { id?: string; title?: string; messages?: ChatMessage[]; message?: string };
  if (!response.ok || !body.id || !body.messages) throw new Error(body.message || "没有找到这轮对话");
  return {
    id: body.id,
    title: body.title || "未命名对话",
    messages: body.messages.map((message) => ({ ...message, saved: message.role === "assistant" })),
  };
}
