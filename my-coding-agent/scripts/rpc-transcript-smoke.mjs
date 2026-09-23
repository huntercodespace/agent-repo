import assert from "node:assert/strict";
import { applyRpcEvent, appendUserBlock, settleTranscript } from "../src/rpc/transcript.ts";

const user = appendUserBlock([], "ping");
assert.equal(user[0].kind, "user");
assert.equal(user[0].text, "ping");

let blocks = applyRpcEvent(user, { type: "message_start", role: "assistant" });
blocks = applyRpcEvent(blocks, {
  type: "message_update",
  deltaKind: "text_delta",
  contentIndex: 0,
  delta: "A",
});
blocks = applyRpcEvent(blocks, {
  type: "message_update",
  deltaKind: "text_delta",
  contentIndex: 1,
  delta: "B",
});
blocks = applyRpcEvent(blocks, {
  type: "message_update",
  deltaKind: "text_delta",
  contentIndex: 0,
  delta: "C",
});
blocks = applyRpcEvent(blocks, {
  type: "message_update",
  deltaKind: "thinking_delta",
  delta: "hmm",
});
blocks = applyRpcEvent(blocks, {
  type: "message_end",
  role: "assistant",
  text: "SHOULD NOT REPLACE",
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
assert.equal(blocks[1].text, "ACB");
assert.equal(blocks[1].pending, true);
assert.equal(blocks[2].kind, "tool");
assert.equal(blocks[2].output, "hi\n");
assert.equal(blocks[2].pending, false);

const settled = settleTranscript(blocks);
assert.equal(settled[1].pending, false);

const next = applyRpcEvent(settled, { type: "message_start", role: "assistant" });
const withDelta = applyRpcEvent(next, {
  type: "message_update",
  deltaKind: "text_delta",
  contentIndex: 0,
  delta: "next",
});
assert.equal(withDelta.filter((block) => block.kind === "assistant").length, 2);
assert.equal(withDelta.at(-1).text, "next");

const ignored = applyRpcEvent(withDelta, { type: "message_start", role: "user", text: "ping" });
assert.equal(ignored.length, withDelta.length);

console.log("rpc transcript smoke ok");
