import { type Agent, type AgentMessage, type AgentTool, type StreamFn } from "@earendil-works/pi-agent-core";
import type { Api, Model } from "@earendil-works/pi-ai";
import type { Profile } from "@resume/retrieval";
import { createResumeAgent } from "./agent.js";
import type { BusinessStore, LoadedSession } from "./business-store.js";
import { buildMockAnswer } from "./mock-chat.js";
import { mapAgentEvent, type SseEvent } from "./sse.js";
import {
  assertFormatVersions,
  lastAssistantId,
  messageText,
  rowsFromAgentMessages,
  titleFromMessages,
  trimToLastUser,
} from "./transcript.js";

function userMessage(text: string): AgentMessage {
  return { role: "user", content: text, timestamp: Date.now() };
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * 用数据库里的 AgentMessage 开一个新 Agent。
 * 不读取浏览器传来的历史。重新生成时上下文停在最后一条用户消息，然后 continue()。
 */
export async function streamChat(options: {
  business: BusinessStore;
  visitorId: string;
  session: LoadedSession;
  message: string;
  regenerate: boolean;
  mock: boolean;
  mockDelayMs: number;
  model: Model<Api>;
  profile: Profile;
  tools: AgentTool[];
  labels: ReadonlyMap<string, string>;
  streamFn?: StreamFn;
  emit: (event: SseEvent) => void;
  isClosed: () => boolean;
  onAgent?: (agent: Agent) => void;
}): Promise<boolean> {
  assertFormatVersions(options.session.rows);
  const base = options.regenerate ? trimToLastUser(options.session.rows) : options.session.rows;
  if (options.regenerate) {
    if (!base) throw new Error("没有可以重新生成的问题。");
  }
  const history = base ?? [];
  const question = options.regenerate ? messageText(history[history.length - 1]!.agentMessage) : options.message;
  if (!question.trim()) throw new Error("没有可以发送的问题。");

  if (options.mock) {
    const answer = buildMockAnswer(question, options.model);
    for (const event of answer.events) {
      if (options.isClosed()) return false;
      if (options.mockDelayMs > 0 && (event.event === "tool_end" || event.event === "text_delta")) {
        await sleep(options.mockDelayMs);
      }
      options.emit(event);
    }
    if (options.isClosed()) return false;
    const next = options.regenerate
      ? [...history.map((row) => row.agentMessage), ...answer.messages]
      : [...history.map((row) => row.agentMessage), userMessage(question), ...answer.messages];
    return save(options, next, options.session.title);
  }

  const agent = createResumeAgent({
    model: options.model,
    profile: options.profile,
    tools: options.tools,
    ...(options.streamFn ? { streamFn: options.streamFn } : {}),
    messages: history.map((row) => row.agentMessage),
  });
  options.onAgent?.(agent);
  const unsubscribe = agent.subscribe((event) => {
    const mapped = mapAgentEvent(event, options.labels);
    if (!mapped || mapped.event === "done") return;
    options.emit(mapped);
  });
  try {
    if (options.regenerate) await agent.continue();
    else await agent.prompt(question);
  } finally {
    unsubscribe();
  }
  if (options.isClosed()) return false;
  return save(options, agent.state.messages, options.session.title);
}

async function save(
  options: {
    business: BusinessStore;
    visitorId: string;
    session: LoadedSession;
    labels: ReadonlyMap<string, string>;
    emit: (event: SseEvent) => void;
  },
  messages: readonly AgentMessage[],
  existingTitle: string,
): Promise<boolean> {
  const rows = rowsFromAgentMessages(messages, options.labels);
  const title = existingTitle.trim() || titleFromMessages(messages);
  await options.business.saveTranscript({
    visitorId: options.visitorId,
    sessionId: options.session.id,
    rows,
    title,
  });
  options.emit({
    event: "done",
    data: {
      reason: "agent_end",
      sessionId: options.session.id,
      messageId: lastAssistantId(rows),
    },
  });
  return true;
}
