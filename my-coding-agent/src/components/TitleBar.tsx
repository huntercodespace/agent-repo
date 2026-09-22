import { Icon } from "./Icon";
import { PiLogo } from "./PiLogo";

function TrafficLight({
  color,
  label,
  onClick,
}: {
  color: string;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      onClick={onClick}
      className="titlebar-no-drag h-3 w-3 rounded-full transition-opacity hover:opacity-80"
      style={{ backgroundColor: color }}
    />
  );
}

export function TitleBar() {
  const desktop = window.piDesktop;

  return (
    <header className="titlebar-drag fixed left-0 right-0 top-0 z-50 flex h-10 select-none items-center justify-between bg-surface-container-lowest px-space-md">
      <div className="flex items-center gap-space-md">
        <div className="titlebar-no-drag flex items-center gap-1.5 px-space-xs">
          <TrafficLight color="#ff5f56" label="关闭" onClick={() => desktop?.close()} />
          <TrafficLight color="#ffbd2e" label="最小化" onClick={() => desktop?.minimize()} />
          <TrafficLight color="#27c93f" label="最大化" onClick={() => desktop?.toggleMaximize()} />
        </div>
        <div
          className="flex items-center gap-space-sm pl-space-sm"
          onDoubleClick={() => desktop?.toggleMaximize()}
        >
          <PiLogo className="h-4 w-auto object-contain" />
          <span className="font-code-sm text-code-sm font-medium text-on-surface-variant">pi-monorepo</span>
          <span className="font-code-sm text-code-sm text-outline">/</span>
          <span className="font-code-sm text-code-sm text-on-surface-variant">core</span>
          <span className="font-code-sm text-code-sm text-outline">/</span>
          <span className="font-code-sm text-code-sm font-semibold text-on-surface">agent-runtime</span>
          <span className="ml-space-xs flex items-center gap-1 rounded bg-surface-container-high px-1.5 py-0.5 font-code-sm text-code-sm text-secondary">
            <span>main</span>
            <span className="text-outline">⌥</span>
          </span>
        </div>
      </div>
      <div className="titlebar-no-drag flex items-center gap-space-xs">
        <button
          type="button"
          className="flex h-7 items-center gap-1.5 rounded bg-surface-container px-space-sm font-label-sm text-label-sm text-on-surface transition-colors hover:bg-surface-container-high"
        >
          <Icon name="folder_open" className="text-[15px] text-on-surface-variant" />
          <span>打开文件夹</span>
        </button>
        <button
          type="button"
          className="flex h-7 items-center gap-1.5 rounded bg-surface-container px-space-sm font-label-sm text-label-sm text-on-surface transition-colors hover:bg-surface-container-high"
        >
          <Icon name="commit" className="text-[15px] text-tertiary" />
          <span>提交更改 (3)</span>
        </button>
        <button
          type="button"
          className="flex h-7 items-center gap-1.5 rounded bg-primary px-space-sm font-label-sm text-label-sm font-medium text-on-primary transition-colors hover:bg-primary-container hover:text-on-primary-container"
        >
          <Icon name="arrow_forward" className="text-[15px]" />
          <span>交接 Handoff</span>
        </button>
        <button
          type="button"
          title="分屏布局"
          className="flex h-7 w-7 items-center justify-center rounded bg-surface-container text-on-surface-variant transition-colors hover:bg-surface-container-high hover:text-on-surface"
        >
          <Icon name="splitscreen" className="text-[16px]" />
        </button>
        <div className="ml-space-xs flex h-7 w-7 items-center justify-center rounded-full bg-primary">
          <Icon name="person" className="text-[15px] text-on-primary" />
        </div>
      </div>
    </header>
  );
}
