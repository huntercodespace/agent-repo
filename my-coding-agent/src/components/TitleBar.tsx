import { Icon } from "./Icon";
import { PiLogo } from "./PiLogo";

function WindowControl({
  label,
  onClick,
  icon,
  danger = false,
}: {
  label: string;
  onClick: () => void;
  icon: string;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      onClick={onClick}
      className={`titlebar-no-drag flex h-10 w-11 items-center justify-center text-on-surface-variant transition-colors ${
        danger
          ? "hover:bg-[#c42b1c] hover:text-white"
          : "hover:bg-surface-container-high hover:text-on-surface"
      }`}
    >
      <Icon name={icon} className="text-[16px]" />
    </button>
  );
}

export function TitleBar() {
  const desktop = window.piDesktop;

  return (
    <header className="titlebar-drag fixed left-0 right-0 top-0 z-50 flex h-10 select-none items-center justify-between bg-surface-container-lowest pl-space-md">
      <div className="flex min-w-0 flex-1 items-center gap-space-md">
        <div
          className="flex items-center gap-space-sm"
          onDoubleClick={() => desktop?.toggleMaximize()}
        >
          <PiLogo className="h-4 w-auto object-contain" />
          <span className="font-code-sm text-code-sm font-medium text-on-surface-variant">pi-monorepo</span>
          <span className="font-code-sm text-code-sm text-outline">/</span>
          <span className="font-code-sm text-code-sm text-on-surface-variant">core</span>
          <span className="font-code-sm text-code-sm text-outline">/</span>
          <span className="font-code-sm text-code-sm font-semibold text-on-surface">agent-runtime</span>
          <a
            href="#/branch"
            title="切换分支"
            className="titlebar-no-drag ml-space-xs flex items-center gap-1 rounded bg-surface-container-high px-1.5 py-0.5 font-code-sm text-code-sm text-secondary transition-colors hover:bg-surface-bright"
          >
            <span>main</span>
            <span className="text-outline">⌥</span>
          </a>
        </div>
      </div>
      <div className="titlebar-no-drag flex shrink-0 items-center gap-space-xs pr-space-xs">
        <a
          href="#/onboarding"
          className="titlebar-no-drag flex h-7 items-center gap-1.5 rounded bg-surface-container px-space-sm font-label-sm text-label-sm text-on-surface transition-colors hover:bg-surface-container-high"
        >
          <Icon name="folder_open" className="text-[15px] text-on-surface-variant" />
          <span>打开文件夹</span>
        </a>
        <a
          href="#/diff"
          className="titlebar-no-drag flex h-7 items-center gap-1.5 rounded bg-surface-container px-space-sm font-label-sm text-label-sm text-on-surface transition-colors hover:bg-surface-container-high"
        >
          <Icon name="commit" className="text-[15px] text-tertiary" />
          <span>提交更改 (3)</span>
        </a>
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
      <div className="titlebar-no-drag ml-space-sm flex h-10 shrink-0 items-stretch">
        <WindowControl label="最小化" icon="minimize" onClick={() => desktop?.minimize()} />
        <WindowControl label="最大化" icon="crop_square" onClick={() => desktop?.toggleMaximize()} />
        <WindowControl label="关闭" icon="close" danger onClick={() => desktop?.close()} />
      </div>
    </header>
  );
}
