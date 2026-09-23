import type { TranscriptBlock } from "../rpc/types";
import { Icon } from "./Icon";
import { MarkdownContent } from "./MarkdownContent";
import { groupTranscriptBlocks, type DisplayBlock } from "./groupTranscriptBlocks";

function AssistantBlock({ block }: { block: Extract<TranscriptBlock, { kind: "assistant" }> }) {
  return (
    <article className="flex items-start gap-space-md">
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary-container text-on-primary-container">
        <Icon name="smart_toy" fill className="text-[16px]" />
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-space-sm">
        <div className="flex items-center gap-space-sm">
          <span className="font-label-md text-label-md font-semibold text-on-surface">Pi Agent</span>
          {block.pending ? (
            <span className="inline-flex items-center gap-1 font-code-sm text-code-sm text-secondary">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-secondary" />
              流式输出
            </span>
          ) : null}
        </div>
        {block.text ? <MarkdownContent text={block.text} /> : block.pending ? <span>…</span> : null}
      </div>
    </article>
  );
}

function ToolGroup({ group }: { group: Extract<DisplayBlock, { kind: "tool_group" }> }) {
  const running = group.tools.some((tool) => tool.pending);
  const failed = group.tools.filter((tool) => tool.isError).length;
  return (
    <details className="group ml-10 min-w-0 rounded-lg border border-outline-variant/50 bg-surface-container-low text-on-surface-variant">
      <summary className="flex cursor-pointer list-none items-center gap-space-sm px-space-md py-space-sm hover:text-on-surface">
        <Icon name="chevron_right" className="shrink-0 text-[16px] transition-transform group-open:rotate-90" />
        <Icon name="terminal" className="shrink-0 text-[15px] text-secondary" />
        <span className="shrink-0 font-label-sm text-label-sm font-medium">执行过程 · {group.tools.length} 次工具调用</span>
        <span className="min-w-0 truncate font-code-sm text-code-sm text-outline">
          {group.tools.map((tool) => tool.name).join(" · ")}
        </span>
        <span className={`ml-auto shrink-0 font-code-sm text-code-sm ${failed ? "text-error" : running ? "text-secondary" : "text-tertiary"}`}>
          {running ? `运行中${failed ? ` · ${failed} 次失败` : ""}` : failed ? `${failed} 次失败` : "已完成"}
        </span>
      </summary>
      <div className="space-y-space-xs border-t border-outline-variant/50 p-space-sm">
        {group.tools.map((tool) => (
          <details key={tool.id} className="rounded bg-surface-container-lowest">
            <summary className="flex cursor-pointer list-none items-center gap-space-sm px-space-sm py-space-xs font-label-sm text-label-sm">
              <Icon name="chevron_right" className="text-[14px]" />
              <span className="min-w-0 truncate">{tool.name}</span>
              <span className={`ml-auto shrink-0 ${tool.isError ? "text-error" : tool.pending ? "text-secondary" : "text-tertiary"}`}>
                {tool.pending ? "运行中" : tool.isError ? "失败" : "完成"}
              </span>
            </summary>
            <div className="space-y-space-xs border-t border-outline-variant/30 p-space-sm">
              {tool.args ? (
                <pre className="max-h-48 select-text overflow-auto whitespace-pre-wrap break-all font-code-sm text-code-sm text-on-surface-variant">{tool.args}</pre>
              ) : null}
              {tool.output ? (
                <pre className="max-h-64 select-text overflow-auto whitespace-pre-wrap break-all rounded bg-surface-container p-space-sm font-code-sm text-code-sm text-on-surface">{tool.output}</pre>
              ) : null}
            </div>
          </details>
        ))}
      </div>
    </details>
  );
}

export function LiveTranscript({ blocks }: { blocks: TranscriptBlock[] }) {
  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-space-lg p-space-lg lg:p-space-xl">
      {groupTranscriptBlocks(blocks).map((block) => {
        if (block.kind === "user") {
          return (
            <article key={block.id} className="flex items-start gap-space-md">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-surface-container-highest text-primary">
                <Icon name="person" className="text-[16px]" />
              </div>
              <div className="min-w-0 flex-1">
                <span className="font-label-md text-label-md font-semibold text-on-surface">You</span>
                <div className="mt-space-xs select-text whitespace-pre-wrap rounded-xl bg-surface-container p-space-md font-body-md text-body-md text-on-surface shadow-sm">
                  {block.text}
                </div>
              </div>
            </article>
          );
        }
        if (block.kind === "tool_group") return <ToolGroup key={block.id} group={block} />;
        return <AssistantBlock key={block.id} block={block} />;
      })}
    </div>
  );
}
