import { Composer } from "../components/Composer";
import { Icon } from "../components/Icon";
import { Inspector } from "../components/Inspector";
import { MessageStream } from "../components/MessageStream";

export function WorkspacePage() {
  return (
    <main className="flex h-full min-h-0 w-full flex-col bg-surface lg:flex-row">
      <section className="flex min-h-0 min-w-0 flex-1 flex-col bg-surface">
        <div className="flex h-9 items-center justify-between bg-surface-container-low/60 px-space-lg backdrop-blur">
          <div className="flex items-center gap-space-sm font-code-sm text-code-sm">
            <span className="inline-flex items-center gap-1 text-secondary">
              <Icon name="terminal" className="text-[14px]" />
              <span>task://refactor-sse-parser</span>
            </span>
            <span className="text-outline">/</span>
            <span className="font-medium text-on-surface-variant">Session #0482</span>
            <span className="rounded bg-surface-container-high px-1.5 py-0.5 font-label-xs text-label-xs font-semibold uppercase tracking-wider text-tertiary">
              Active Run
            </span>
          </div>
          <div className="flex items-center gap-space-sm font-label-sm text-label-sm text-on-surface-variant">
            <span className="flex items-center gap-1">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-tertiary" />
              Agent Ready
            </span>
            <span className="text-outline">|</span>
            <span className="font-code-sm text-code-sm text-outline">PID: 39420</span>
          </div>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto">
          <MessageStream />
        </div>
        <Composer />
      </section>
      <Inspector />
    </main>
  );
}
