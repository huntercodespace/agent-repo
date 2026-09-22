import { Icon } from "./Icon";

export function Inspector() {
  return (
    <aside className="flex w-full shrink-0 flex-col justify-between bg-surface-container-lowest lg:h-full lg:w-[340px]">
      <div className="flex min-h-0 flex-col">
        <div className="flex flex-col gap-0.5 overflow-y-auto p-space-sm font-code-sm text-code-sm">
          <div className="flex cursor-pointer items-center gap-1.5 px-space-sm py-1 font-medium text-on-surface">
            <Icon name="expand_more" className="text-[14px] text-outline" />
            <Icon name="folder" className="text-[15px] text-secondary" />
            <span>src/</span>
          </div>
          <div className="flex cursor-pointer items-center gap-1.5 py-1 pl-6 pr-space-sm font-medium text-on-surface">
            <Icon name="expand_more" className="text-[14px] text-outline" />
            <Icon name="folder" className="text-[15px] text-secondary" />
            <span>stream/</span>
          </div>
          <div className="flex cursor-pointer items-center justify-between rounded bg-surface-container py-1 pl-10 pr-space-sm text-on-surface">
            <div className="flex min-w-0 items-center gap-1.5">
              <Icon name="description" className="text-[14px] text-primary" />
              <span className="truncate">parser.ts</span>
            </div>
            <div className="flex shrink-0 items-center gap-1 font-label-xs text-label-xs">
              <span className="rounded bg-secondary/10 px-1 font-bold text-secondary">M</span>
              <span className="text-tertiary">+42</span>
              <span className="text-error">-18</span>
            </div>
          </div>
          <div className="flex cursor-pointer items-center justify-between rounded py-1 pl-10 pr-space-sm text-on-surface-variant transition-colors hover:bg-surface-container/40 hover:text-on-surface">
            <div className="flex min-w-0 items-center gap-1.5">
              <Icon name="description" className="text-[14px] text-primary" />
              <span className="truncate">buffer.ts</span>
            </div>
            <div className="flex shrink-0 items-center gap-1 font-label-xs text-label-xs">
              <span className="rounded bg-tertiary/10 px-1 font-bold text-tertiary">A</span>
              <span className="text-tertiary">+65</span>
            </div>
          </div>
          <div className="flex cursor-pointer items-center gap-1.5 rounded py-1 pl-6 pr-space-sm text-on-surface-variant transition-colors hover:text-on-surface">
            <Icon name="chevron_right" className="text-[14px] text-outline" />
            <Icon name="folder" className="text-[15px] text-outline" />
            <span>auth/</span>
          </div>
          <div className="flex cursor-pointer items-center gap-1.5 rounded py-1 pl-6 pr-space-sm text-on-surface-variant transition-colors hover:text-on-surface">
            <span className="w-3.5" />
            <Icon name="description" className="text-[14px] text-outline" />
            <span>index.ts</span>
          </div>
          <div className="mt-space-xs flex cursor-pointer items-center gap-1.5 px-space-sm py-1 font-medium text-on-surface">
            <Icon name="expand_more" className="text-[14px] text-outline" />
            <Icon name="folder" className="text-[15px] text-secondary" />
            <span>tests/</span>
          </div>
          <div className="flex cursor-pointer items-center justify-between rounded py-1 pl-6 pr-space-sm text-on-surface-variant transition-colors hover:bg-surface-container/40 hover:text-on-surface">
            <div className="flex min-w-0 items-center gap-1.5">
              <Icon name="science" className="text-[14px] text-tertiary" />
              <span className="truncate">stream_parser.test.ts</span>
            </div>
            <div className="flex shrink-0 items-center gap-1 font-label-xs text-label-xs">
              <span className="rounded bg-tertiary/10 px-1 font-bold text-tertiary">A</span>
              <span className="text-tertiary">+84</span>
            </div>
          </div>
          <div className="mt-space-xs flex cursor-pointer items-center gap-1.5 rounded px-space-sm py-1 text-on-surface-variant transition-colors hover:text-on-surface">
            <Icon name="settings" className="text-[14px] text-outline" />
            <span>package.json</span>
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-space-xs bg-surface-container-low p-space-sm">
        <div className="flex items-center justify-between font-label-xs text-label-xs font-semibold uppercase tracking-wider text-outline">
          <span className="flex items-center gap-1">
            <Icon name="check" className="text-[12px] text-tertiary" />
            Vitest Test Runner
          </span>
          <span>pid: 4091</span>
        </div>
        <div className="flex items-start gap-space-sm rounded bg-surface-container-lowest p-space-sm font-code-sm text-code-sm text-tertiary shadow-inner">
          <Icon name="task_alt" className="shrink-0 text-[15px] text-tertiary" />
          <div className="flex flex-col">
            <span className="font-medium text-tertiary">PASS tests/stream_parser.test.ts</span>
            <span className="text-[11px] text-on-surface-variant">18/18 passed · 0.42s run time · memory 18.2MB</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
