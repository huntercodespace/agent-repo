import type { RpcWireEvent, TranscriptBlock } from "./types";

function nextId(blocks: TranscriptBlock[], prefix: string) {
  return `${prefix}-${blocks.length + 1}`;
}

function patch(blocks: TranscriptBlock[], index: number, block: TranscriptBlock) {
  const next = blocks.slice();
  next[index] = block;
  return next;
}

function lastPendingAssistant(blocks: TranscriptBlock[]) {
  for (let index = blocks.length - 1; index >= 0; index -= 1) {
    const block = blocks[index];
    if (block.kind === "assistant" && block.pending) return index;
  }
  return -1;
}

function ensureAssistant(blocks: TranscriptBlock[]) {
  const index = lastPendingAssistant(blocks);
  if (index !== -1) return { blocks, index };
  const next = blocks.concat({
    id: nextId(blocks, "assistant"),
    kind: "assistant",
    text: "",
    thinking: "",
    pending: true,
  });
  return { blocks: next, index: next.length - 1 };
}

function findTool(blocks: TranscriptBlock[], toolCallId: string) {
  if (!toolCallId) return -1;
  for (let index = blocks.length - 1; index >= 0; index -= 1) {
    const block = blocks[index];
    if (block.kind === "tool" && block.toolCallId === toolCallId) return index;
  }
  return -1;
}

function settle(blocks: TranscriptBlock[]) {
  return blocks.map((block) => (block.kind === "user" || !block.pending ? block : { ...block, pending: false }));
}

/** Fold pi RPC stdout events into chat blocks. User echoes are ignored; the composer owns that bubble. */
export function applyRpcEvent(blocks: TranscriptBlock[], event: RpcWireEvent): TranscriptBlock[] {
  if (event.type === "message_start" || event.type === "message_end") {
    if (event.role && event.role !== "assistant") return blocks;
    const ensured = ensureAssistant(blocks);
    const current = ensured.blocks[ensured.index];
    if (current.kind !== "assistant") return blocks;
    if (event.type === "message_end" && event.text) {
      return patch(ensured.blocks, ensured.index, { ...current, text: event.text });
    }
    return ensured.blocks;
  }

  if (event.type === "message_update") {
    if (event.deltaKind !== "text_delta" && event.deltaKind !== "thinking_delta") return blocks;
    if (!event.delta) return blocks;
    const ensured = ensureAssistant(blocks);
    const current = ensured.blocks[ensured.index];
    if (current.kind !== "assistant") return blocks;
    if (event.deltaKind === "thinking_delta") {
      return patch(ensured.blocks, ensured.index, { ...current, thinking: current.thinking + event.delta });
    }
    return patch(ensured.blocks, ensured.index, { ...current, text: current.text + event.delta });
  }

  if (event.type === "tool_execution_start") {
    const toolCallId = event.toolCallId || nextId(blocks, "tool-call");
    return blocks.concat({
      id: nextId(blocks, "tool"),
      kind: "tool",
      toolCallId,
      name: event.toolName || "tool",
      args: event.argsPreview || "",
      output: "",
      pending: true,
      isError: false,
    });
  }

  if (event.type === "tool_execution_update" || event.type === "tool_execution_end") {
    const index = findTool(blocks, event.toolCallId || "");
    if (index === -1) return blocks;
    const current = blocks[index];
    if (current.kind !== "tool") return blocks;
    return patch(blocks, index, {
      ...current,
      output: event.outputPreview || current.output,
      pending: event.type !== "tool_execution_end",
      isError: event.type === "tool_execution_end" ? Boolean(event.isError) : current.isError,
    });
  }

  if (event.type === "agent_end" && !event.willRetry) return settle(blocks);
  if (event.type === "agent_settled") return settle(blocks);
  return blocks;
}

export function appendUserBlock(blocks: TranscriptBlock[], text: string): TranscriptBlock[] {
  return blocks.concat({ id: nextId(blocks, "user"), kind: "user", text });
}
