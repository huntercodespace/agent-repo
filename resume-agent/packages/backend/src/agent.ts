import { Agent, type AgentMessage, type AgentTool, type StreamFn } from "@earendil-works/pi-agent-core";
import type { Api, AssistantMessage, Model } from "@earendil-works/pi-ai";
import { AssistantMessageEventStream } from "@earendil-works/pi-ai/utils/event-stream";
import { builtinModels } from "@earendil-works/pi-ai/providers/all";
import type { Profile } from "@resume/retrieval";
import { buildSystemPrompt } from "./prompt.js";

const models = builtinModels();

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

/** streamSimple 在缺少密钥时会同步抛错；Agent 要求 streamFn 自己把失败放进事件流。 */
function errorStream(model: Model<Api>, error: unknown): AssistantMessageEventStream {
  const stream = new AssistantMessageEventStream();
  const message: AssistantMessage = {
    role: "assistant",
    content: [],
    api: model.api,
    provider: model.provider,
    model: model.id,
    usage: emptyUsage(),
    stopReason: "error",
    errorMessage: error instanceof Error ? error.message : "模型请求失败",
    timestamp: Date.now(),
  };
  stream.push({ type: "error", reason: "error", error: message });
  return stream;
}

export function createStreamFn(): StreamFn {
  return (model, context, options) => {
    try {
      return models.streamSimple(model, context, options);
    } catch (error) {
      return errorStream(model, error);
    }
  };
}

export function createResumeAgent(options: {
  model: Model<Api>;
  profile: Profile;
  tools: AgentTool[];
  streamFn?: StreamFn;
  /** 来自数据库的原文。空数组表示新会话，由 Agent 自己写入系统提示。 */
  messages?: AgentMessage[];
}): Agent {
  const messages = options.messages ?? [];
  return new Agent({
    streamFn: options.streamFn ?? createStreamFn(),
    initialState: {
      systemPrompt: buildSystemPrompt(options.profile),
      model: options.model,
      tools: options.tools,
      ...(messages.length > 0 ? { messages } : {}),
      // 不设置 thinkingLevel。0.99.1 运行时默认是 off，类型里虽然没有 "off"。
    },
  });
}
