import { useEffect, useState } from "react";
import {
  nextEngineState,
  nextSandboxState,
  type EngineState,
  type SandboxState,
} from "../status";
import { Icon } from "./Icon";

const engineMeta: Record<
  EngineState,
  { label: string; hint?: string; chip: string; dot: string }
> = {
  idle: {
    label: "引擎·RPC 空闲·已连接",
    chip: "bg-[#0e3a2c] text-[#5ef0b4] shadow-[inset_0_0_0_1px_rgba(78,222,163,0.45)]",
    dot: "bg-[#3ee6a0]",
  },
  chatting: {
    label: "引擎·RPC 对话中",
    hint: "每窗口独立进程",
    chip: "bg-[#142844] text-[#8ecbff] shadow-[inset_0_0_0_1px_rgba(90,170,230,0.45)]",
    dot: "bg-[#5eb6f5]",
  },
  reconnecting: {
    label: "引擎·RPC 重连中",
    hint: "每窗口独立进程",
    chip: "bg-[#3a2c10] text-[#ffc857] shadow-[inset_0_0_0_1px_rgba(245,180,60,0.45)]",
    dot: "animate-pulse bg-[#f5b942]",
  },
  disconnected: {
    label: "引擎·RPC 已断开",
    hint: "每窗口独立进程",
    chip: "bg-[#2a2426] text-[#d9c4bf] shadow-[inset_0_0_0_1px_rgba(180,140,140,0.35)]",
    dot: "bg-[#e15b6a]",
  },
};

const sandboxMeta: Record<
  SandboxState,
  { label: string; chip: string; dot: string; badge: string; badgeClass: string; body: string }
> = {
  off: {
    label: "未启用",
    chip: "bg-[#2a2d33] text-[#9b9ba6] shadow-[inset_0_0_0_1px_rgba(150,150,160,0.28)]",
    dot: "bg-[#7d7d88]",
    badge: "未启用",
    badgeClass: "bg-[#2c3036] text-[#9b9ba6]",
    body: "启用后仅隔离终端命令，帮助降低命令风险；仍可改当前项目。会防范工作区外的文件操作，并限制随意联网。非绝对安全。",
  },
  enabling: {
    label: "正在启用",
    chip: "bg-[#1c3328] text-[#b7e7cf] shadow-[inset_0_0_0_1px_rgba(78,222,163,0.28)]",
    dot: "animate-pulse bg-[#8fd9b4]",
    badge: "正在启用",
    badgeClass: "bg-[#163028] text-[#b7e7cf]",
    body: "正在隔离终端命令。仍可改当前项目。启用后防范工作区外的文件操作，并限制随意联网。非绝对安全。",
  },
  on: {
    label: "沙盒·命令隔离",
    chip: "bg-[#0b5a3c] text-[#7dffc3] shadow-[inset_0_0_0_1px_rgba(80,255,180,0.55)]",
    dot: "bg-[#5dffb0]",
    badge: "已生效",
    badgeClass: "bg-[#123d2e] text-[#7dffc3]",
    body: "主要防范工作区外的文件操作，并限制随意联网；仍可改当前项目。当前仅隔离终端命令。帮助降低命令风险，非绝对安全。",
  },
};

interface StatusBarProps {
  engine: EngineState;
  sandbox: SandboxState;
  onEngineChange: (engine: EngineState) => void;
  onSandboxChange: (sandbox: SandboxState) => void;
}

export function StatusBar({ engine, sandbox, onEngineChange, onSandboxChange }: StatusBarProps) {
  const engineChip = engineMeta[engine];
  const sandboxChip = sandboxMeta[sandbox];
  const [hoveringSandbox, setHoveringSandbox] = useState(
    () => new URLSearchParams(window.location.search).get("policy") === "1",
  );

  useEffect(() => {
    if (sandbox !== "enabling") return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      event.preventDefault();
      onSandboxChange("off");
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [sandbox, onSandboxChange]);

  return (
    <footer className="fixed bottom-0 left-0 right-0 z-50 flex h-8 select-none items-center justify-between bg-surface-container-lowest px-3 font-label-xs text-[11px] text-on-surface-variant">
      <div className="flex min-w-0 items-center gap-1.5">
        <span className="inline-flex h-5 shrink-0 items-center gap-1.5 rounded-full bg-[#1a1e24] px-2 text-on-surface">
          <span className="h-1.5 w-1.5 rounded-full bg-[#3ee6a0]" />
          main
        </span>
        <button
          type="button"
          data-engine={engine}
          title="每窗口独立进程"
          onClick={() => onEngineChange(nextEngineState(engine))}
          className={`inline-flex max-w-full items-center gap-1.5 rounded-full px-2 text-left leading-none ${engineChip.chip} ${engineChip.hint ? "h-[26px]" : "h-5"}`}
        >
          <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${engineChip.dot}`} />
          <span className="flex min-w-0 flex-col justify-center">
            <span className="truncate font-medium">{engineChip.label}</span>
            {engineChip.hint ? (
              <span className="mt-0.5 truncate text-[9px] font-normal leading-none opacity-75">{engineChip.hint}</span>
            ) : null}
          </span>
        </button>
        <div
          className="relative shrink-0"
          onMouseEnter={() => setHoveringSandbox(true)}
          onMouseLeave={() => setHoveringSandbox(false)}
          onFocus={() => setHoveringSandbox(true)}
          onBlur={() => setHoveringSandbox(false)}
        >
          <button
            type="button"
            data-sandbox={sandbox}
            aria-describedby="sandbox-policy"
            onClick={() => onSandboxChange(nextSandboxState(sandbox))}
            onKeyDown={(event) => {
              if (event.key === "Escape" && sandbox === "enabling") {
                event.preventDefault();
                onSandboxChange("off");
              }
            }}
            className={`inline-flex h-5 items-center gap-1.5 rounded-full px-2 font-medium leading-none ${sandboxChip.chip}`}
          >
            <span className={`h-1.5 w-1.5 rounded-full ${sandboxChip.dot}`} />
            {sandboxChip.label}
          </button>
          {hoveringSandbox ? (
            <div
              id="sandbox-policy"
              role="tooltip"
              className="absolute bottom-[calc(100%+8px)] left-0 w-[380px] rounded-lg border border-[#1d6b4a] bg-[#101816] p-3 text-left shadow-[0_16px_36px_-8px_rgba(0,0,0,0.65)]"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-1.5 text-[13px] font-medium text-on-surface">
                  <Icon name="check_circle" className="text-[16px] text-[#5ef0b4]" />
                  <span>沙盒隔离策略</span>
                </div>
                <span className={`shrink-0 rounded px-1.5 py-0.5 text-[11px] font-medium ${sandboxChip.badgeClass}`}>
                  {sandboxChip.badge}
                </span>
              </div>
              <p className="mt-2 text-[12px] font-normal leading-5 text-[#c9d5ce]">{sandboxChip.body}</p>
              <div className="mt-2.5 flex flex-wrap gap-2 text-[11px] text-[#7dffc3]">
                <span className="rounded bg-[#0e2a22] px-2 py-1">终端命令：独立沙箱</span>
                <span className="rounded bg-[#0e2a22] px-2 py-1">外网请求：白名单拦截</span>
              </div>
            </div>
          ) : null}
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-4 pl-3">
        <Icon name="shield" className="text-[14px] text-[#8f9aa3]" />
        <span className="text-[#5ef0b4]">延迟 42ms</span>
        <span className="text-outline">4.2k / 128k (3.2%)</span>
        <span className="text-outline">UTF-8 · LF · TypeScript</span>
      </div>
    </footer>
  );
}
