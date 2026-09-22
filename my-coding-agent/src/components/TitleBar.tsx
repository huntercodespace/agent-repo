import { Icon } from "./Icon";
import { PiLogo } from "./PiLogo";

export type RightRailTab = "files" | "terminal" | "diff";

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
      className={`titlebar-no-drag flex h-10 w-11 shrink-0 items-center justify-center text-on-surface-variant transition-colors ${
        danger
          ? "hover:bg-[#c42b1c] hover:text-white"
          : "hover:bg-surface-container-high hover:text-on-surface"
      }`}
    >
      <Icon name={icon} className="text-[16px]" />
    </button>
  );
}

function RightRailTabs({ active }: { active: RightRailTab }) {
  const tabClass = (id: RightRailTab) =>
    `titlebar-no-drag flex h-8 shrink-0 items-center gap-1 rounded px-space-sm font-label-sm text-label-sm transition-colors ${
      active === id
        ? "bg-surface-container font-medium text-on-surface shadow-sm"
        : "text-on-surface-variant hover:bg-surface-container/50 hover:text-on-surface"
    }`;

  return (
    <div className="titlebar-no-drag flex items-center gap-0.5 px-space-xs">
      <a href="#/" className={tabClass("files")} title="文件树 Files">
        <Icon name="folder_open" className={`text-[15px] ${active === "files" ? "text-secondary" : ""}`} />
        <span>文件树</span>
      </a>
      <button type="button" className={tabClass("terminal")} title="终端 Terminal">
        <Icon name="terminal" className="text-[15px]" />
        <span>终端</span>
      </button>
      <a href="#/diff" className={tabClass("diff")} title="变更审查 Diff">
        <Icon name="difference" className={`text-[15px] ${active === "diff" ? "text-tertiary" : ""}`} />
        <span>变更审查</span>
      </a>
    </div>
  );
}

function WindowControls({ desktop }: { desktop?: Window["piDesktop"] }) {
  return (
    <div className="titlebar-no-drag flex h-10 shrink-0 items-stretch border-l border-surface-container-high/40">
      <WindowControl label="最小化" icon="minimize" onClick={() => desktop?.minimize()} />
      <WindowControl label="最大化" icon="crop_square" onClick={() => desktop?.toggleMaximize()} />
      <WindowControl label="关闭" icon="close" danger onClick={() => desktop?.close()} />
    </div>
  );
}

export function TitleBar({ rightRail }: { rightRail?: RightRailTab | null }) {
  const desktop = window.piDesktop;

  return (
    <header className="titlebar-drag fixed left-0 right-0 top-0 z-50 flex h-10 select-none items-center bg-surface-container-lowest pl-space-md">
      <div className="flex min-w-0 flex-1 items-center gap-space-md">
        <div
          className="flex min-w-0 items-center gap-space-sm"
          onDoubleClick={() => desktop?.toggleMaximize()}
        >
          <PiLogo className="h-4 w-auto shrink-0 object-contain" />
          <span className="truncate font-code-sm text-code-sm font-medium text-on-surface-variant">pi-monorepo</span>
          <span className="font-code-sm text-code-sm text-outline">/</span>
          <span className="truncate font-code-sm text-code-sm text-on-surface-variant">core</span>
          <span className="font-code-sm text-code-sm text-outline">/</span>
          <span className="truncate font-code-sm text-code-sm font-semibold text-on-surface">agent-runtime</span>
          <a
            href="#/branch"
            title="切换分支"
            className="titlebar-no-drag ml-space-xs flex shrink-0 items-center gap-1 rounded bg-surface-container-high px-1.5 py-0.5 font-code-sm text-code-sm text-secondary transition-colors hover:bg-surface-bright"
          >
            <span>main</span>
            <span className="text-outline">⌥</span>
          </a>
        </div>
      </div>
      <div className="titlebar-no-drag flex shrink-0 items-center gap-space-xs px-space-xs">
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
      {rightRail ? (
        <div className="flex h-10 shrink-0 items-stretch">
          <RightRailTabs active={rightRail} />
          <WindowControls desktop={desktop} />
        </div>
      ) : (
        <div className="ml-space-sm">
          <WindowControls desktop={desktop} />
        </div>
      )}
    </header>
  );
}
