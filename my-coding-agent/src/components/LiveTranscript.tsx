import type { TranscriptBlock } from "../rpc/types";
import { Icon } from "./Icon";

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
        {block.thinking ? (
          <details className="rounded-xl bg-surface-container-low shadow-sm">
            <summary className="cursor-pointer list-none px-space-md py-space-sm font-label-sm text-label-sm text-on-surface-variant">
              思考过程
            </summary>
            <p className="select-text whitespace-pre-wrap px-space-md pb-space-md font-code-sm text-code-sm text-on-surface/90">
              {block.thinking}
            </p>
          </details>
        ) : null}
        <div className="select-text whitespace-pre-wrap font-body-md text-body-md leading-relaxed text-on-surface">
          {block.text || (block.pending ? "…" : "")}
        </div>
      </div>
    </article>
  );
}

function ToolBlock({ block }: { block: Extract<TranscriptBlock, { kind: "tool" }> }) {
  return (
    <article className="flex items-start gap-space-md">
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-surface-container-high text-secondary">
        <Icon name="terminal" className="text-[16px]" />
      </div>
      <div className="min-w-0 flex-1 rounded-xl bg-surface-container-low p-space-md shadow-sm">
        <div className="flex items-center justify-between gap-space-sm">
          <span className="font-label-sm text-label-sm font-medium text-on-surface">工具 · {block.name}</span>
          <span className={`font-code-sm text-code-sm ${block.isError ? "text-error" : "text-tertiary"}`}>
            {block.pending ? "运行中" : block.isError ? "失败" : "完成"}
          </span>
        </div>
        {block.args ? (
          <pre className="mt-space-xs select-text overflow-x-auto whitespace-pre-wrap font-code-sm text-code-sm text-on-surface-variant">
            {block.args}
          </pre>
        ) : null}
        {block.output ? (
          <pre className="mt-space-xs select-text overflow-x-auto whitespace-pre-wrap rounded bg-surface-container-lowest p-space-sm font-code-sm text-code-sm text-on-surface">
            {block.output}
          </pre>
        ) : null}
      </div>
    </article>
  );
}

export function LiveTranscript({ blocks }: { blocks: TranscriptBlock[] }) {
  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-space-lg p-space-lg lg:p-space-xl">
      {blocks.map((block) => {
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
        if (block.kind === "tool") return <ToolBlock key={block.id} block={block} />;
        return <AssistantBlock key={block.id} block={block} />;
      })}
    </div>
  );
}
