/**
 * Tiny JSONL stand-in for `pi --mode rpc`.
 *
 * Smoke the shell without an API key:
 *   PI_CLI=scripts/pi-rpc-fixture.mjs npm run dev
 *
 * Records are split on `\n` only. This file does not use Node readline.
 */
import { StringDecoder } from "node:string_decoder";

const decoder = new StringDecoder("utf8");
let buffer = "";

function write(value) {
  process.stdout.write(`${JSON.stringify(value)}\n`);
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function handle(line) {
  if (!line) return;
  let command;
  try {
    command = JSON.parse(line);
  } catch {
    write({ type: "response", command: "parse", success: false, error: "Failed to parse command" });
    return;
  }
  const id = command.id;
  if (command.type === "get_state") {
    write({
      id,
      type: "response",
      command: "get_state",
      success: true,
      data: {
        model: { provider: "fixture", id: "fixture-small", name: "Fixture" },
        thinkingLevel: "off",
        isStreaming: false,
        messageCount: 0,
      },
    });
    return;
  }
  if (command.type === "prompt") {
    write({ id, type: "response", command: "prompt", success: true });
    write({ type: "agent_start" });
    write({ type: "message_start", message: { role: "assistant", content: [] } });
    const text = "pong — fixture stream";
    for (const chunk of text) {
      write({
        type: "message_update",
        assistantMessageEvent: { type: "text_delta", delta: chunk },
      });
      await sleep(12);
    }
    write({
      type: "tool_execution_start",
      toolCallId: "call_fixture",
      toolName: "bash",
      args: { command: "echo fixture" },
    });
    write({
      type: "tool_execution_end",
      toolCallId: "call_fixture",
      toolName: "bash",
      isError: false,
      result: { content: [{ type: "text", text: "fixture\n" }] },
    });
    write({
      type: "message_end",
      message: { role: "assistant", content: [{ type: "text", text }] },
    });
    write({ type: "agent_end", messages: [], willRetry: false });
    write({ type: "agent_settled" });
    return;
  }
  write({ id, type: "response", command: command.type || "unknown", success: true });
}

function takeLines(chunk, onLine) {
  buffer += typeof chunk === "string" ? chunk : decoder.write(chunk);
  while (true) {
    const newline = buffer.indexOf("\n");
    if (newline === -1) return;
    let line = buffer.slice(0, newline);
    buffer = buffer.slice(newline + 1);
    if (line.endsWith("\r")) line = line.slice(0, -1);
    onLine(line);
  }
}

process.stdin.on("data", (chunk) => {
  takeLines(chunk, (line) => {
    void handle(line);
  });
});

process.stdin.on("end", () => {
  buffer += decoder.end();
  if (buffer.length > 0) void handle(buffer.endsWith("\r") ? buffer.slice(0, -1) : buffer);
});
