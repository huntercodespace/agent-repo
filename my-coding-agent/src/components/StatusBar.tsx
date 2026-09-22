import { nextEngineState, type EngineState } from "../status";

const engineMeta: Record<
  EngineState,
  { label: string; hint?: string; chip: string; dot: string }
> = {
  idle: {
    label: "引擎 · RPC 空闲 · 已连接",
    chip: "bg-[#0e3b2e] text-[#6dffc8] shadow-[inset_0_0_0_1px_rgba(78,222,163,0.38)]",
    dot: "bg-[#4edea3]",
  },
  chatting: {
    label: "引擎 · RPC 对话中",
    hint: "每窗口独立进程",
    chip: "bg-[#142844] text-[#8ecbff] shadow-[inset_0_0_0_1px_rgba(56,189,248,0.4)]",
    dot: "bg-[#38bdf8]",
  },
  reconnecting: {
    label: "引擎 · RPC 重连中",
    hint: "每窗口独立进程",
    chip: "bg-[#3a2a10] text-[#ffc857] shadow-[inset_0_0_0_1px_rgba(245,158,11,0.45)]",
    dot: "animate-pulse bg-[#f59e0b]",
  },
  disconnected: {
    label: "引擎 · RPC 已断开",
    hint: "每窗口独立进程",
    chip: "bg-[#2c2426] text-[#f0c7c1] shadow-[inset_0_0_0_1px_rgba(255,180,171,0.32)]",
    dot: "bg-[#f43f5e]",
  },
};

interface StatusBarProps {
  engine: EngineState;
  sandboxEnabled: boolean;
  onEngineChange: (engine: EngineState) => void;
  onSandboxChange: (enabled: boolean) => void;
}

export function StatusBar({ engine, sandboxEnabled, onEngineChange, onSandboxChange }: StatusBarProps) {
  const engineChip = engineMeta[engine];

  return (
    <footer className="fixed bottom-0 left-0 right-0 z-50 flex h-8 select-none items-center justify-between bg-surface-container-lowest px-space-md font-code-sm text-[11px] text-on-surface-variant">
      <div className="flex min-w-0 items-center gap-space-sm">
        <span className="inline-flex h-5 shrink-0 items-center gap-1.5 rounded-full bg-surface-container px-2 text-on-surface">
          <span className="h-1.5 w-1.5 rounded-full bg-tertiary" />
          main
        </span>
        <button
          type="button"
          data-engine={engine}
          title="每窗口独立进程"
          onClick={() => onEngineChange(nextEngineState(engine))}
          className={`inline-flex max-w-full items-center gap-1.5 rounded-full px-2 text-left leading-none transition-colors ${engineChip.chip} ${engineChip.hint ? "h-[26px]" : "h-5"}`}
        >
          <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${engineChip.dot}`} />
          <span className="flex min-w-0 flex-col">
            <span className="truncate font-medium tracking-wide">{engineChip.label}</span>
            {engineChip.hint ? (
              <span className="truncate text-[9px] font-normal opacity-80">{engineChip.hint}</span>
            ) : null}
          </span>
        </button>
        <button
          type="button"
          data-sandbox={sandboxEnabled ? "on" : "off"}
          title={sandboxEnabled ? "终端命令已隔离。外网请求走白名单。" : "沙盒未启用"}
          onClick={() => onSandboxChange(!sandboxEnabled)}
          className={
            sandboxEnabled
              ? "inline-flex h-5 shrink-0 items-center gap-1.5 rounded-full bg-[#0b4a34] px-2 font-medium tracking-wide text-[#7dffc3] shadow-[inset_0_0_0_1px_rgba(16,185,129,0.55)]"
              : "inline-flex h-5 shrink-0 items-center gap-1.5 rounded-full bg-surface-container-high px-2 font-medium tracking-wide text-[#9a9aa8] shadow-[inset_0_0_0_1px_rgba(144,143,159,0.35)]"
          }
        >
          <span className={`h-1.5 w-1.5 rounded-full ${sandboxEnabled ? "bg-[#4edea3]" : "bg-[#6f6f7d]"}`} />
          {sandboxEnabled ? "沙盒 · 命令隔离" : "未启用"}
        </button>
      </div>
      <div className="flex shrink-0 items-center gap-space-md pl-space-md">
        <span className="text-tertiary">延迟 42ms</span>
        <span className="text-outline">4.2k / 128k (3.2%)</span>
        <span className="text-outline">UTF-8 · LF · TypeScript</span>
      </div>
    </footer>
  );
}
