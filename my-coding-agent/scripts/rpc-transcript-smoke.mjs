import assert from "node:assert/strict";
import { applyRpcEvent, appendUserBlock } from "../src/rpc/transcript.ts";

const user = appendUserBlock([], "ping");
assert.equal(user[0].kind, "user");
assert.equal(user[0].text, "ping");

let blocks = applyRpcEvent(user, {
  type: "message_update",
  deltaKind: "text_delta",
  delta: "pon",
});
blocks = applyRpcEvent(blocks, {
  type: "message_update",
  deltaKind: "text_delta",
  delta: "g",
});
blocks = applyRpcEvent(blocks, {
  type: "message_update",
  deltaKind: "thinking_delta",
  delta: "hmm",
});
blocks = applyRpcEvent(blocks, {
  type: "tool_execution_start",
  toolCallId: "call_1",
  toolName: "bash",
  argsPreview: "{\"command\":\"echo hi\"}",
});
blocks = applyRpcEvent(blocks, {
  type: "tool_execution_end",
  toolCallId: "call_1",
  toolName: "bash",
  outputPreview: "hi\n",
  isError: false,
});
blocks = applyRpcEvent(blocks, { type: "agent_end", willRetry: false });

assert.equal(blocks.length, 3);
assert.equal(blocks[1].kind, "assistant");
assert.equal(blocks[1].text, "pong");
assert.equal(blocks[1].thinking, "hmm");
assert.equal(blocks[1].pending, false);
assert.equal(blocks[2].kind, "tool");
assert.equal(blocks[2].output, "hi\n");
assert.equal(blocks[2].pending, false);

const ignored = applyRpcEvent(blocks, { type: "message_start", role: "user", text: "ping" });
assert.equal(ignored.length, blocks.length);

console.log("rpc transcript smoke ok");
