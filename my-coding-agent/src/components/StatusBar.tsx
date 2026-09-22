import { useEffect, useState, type ReactNode } from "react";
import {
  nextEngineState,
  nextSandboxState,
  type EngineState,
  type SandboxState,
} from "../status";
import { Icon } from "./Icon";

const engineChip: Record<EngineState, { node: ReactNode; latency: string; tokens: string; latencyClass: string }> = {
  idle: {
    latency: "延迟 18ms",
    tokens: "已消耗 4.2k tokens",
    latencyClass: "text-tertiary",
    node: (
      <>
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-tertiary opacity-40" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-tertiary" />
        </span>
        <span className="font-label-sm text-[11px] font-semibold text-on-surface">引擎 · RPC:</span>
        <span className="font-label-sm text-[11px] font-medium text-tertiary">空闲 · 已连接</span>
        <span className="rounded bg-surface-container-lowest px-1 py-0.5 font-code-sm text-[9px] uppercase tracking-wider text-outline">
          idle
        </span>
      </>
    ),
  },
  chatting: {
    latency: "延迟 32ms",
    tokens: "已消耗 8.9k tokens",
    latencyClass: "text-primary",
    node: (
      <>
        <Icon name="radio_button_checked" className="animate-pulse text-[15px] text-primary" />
        <span className="font-label-sm text-[11px] font-semibold text-on-surface">引擎 · RPC:</span>
        <span className="font-label-sm text-[11px] font-medium text-primary">对话中 (Streaming)</span>
        <span className="rounded bg-primary/25 px-1.5 py-0.5 font-code-sm text-[9px] font-semibold text-primary">
          4.2k tok/s
        </span>
      </>
    ),
  },
  reconnecting: {
    latency: "延迟 -- ms",
    tokens: "已消耗 4.2k tokens",
    latencyClass: "text-secondary",
    node: (
      <>
        <Icon name="sync" className="animate-spin text-[14px] text-secondary" />
        <span className="font-label-sm text-[11px] font-semibold text-on-surface">引擎 · RPC:</span>
        <span className="font-label-sm text-[11px] font-medium text-secondary">重连中 (尝试 2/5)</span>
        <span className="rounded bg-surface-container-lowest px-1 py-0.5 font-code-sm text-[9px] tracking-wider text-secondary">
          backoff
        </span>
      </>
    ),
  },
  disconnected: {
    latency: "延迟 N/A",
    tokens: "已消耗 4.2k tokens",
    latencyClass: "text-error",
    node: (
      <>
        <Icon name="cancel" className="text-[13px] text-error" />
        <span className="font-label-sm text-[11px] font-semibold text-on-surface">引擎 · RPC:</span>
        <span className="font-label-sm text-[11px] font-medium text-error">已断开 (退出码 137)</span>
      </>
    ),
  },
};

interface StatusBarProps {
  engine: EngineState;
  sandbox: SandboxState;
  onEngineChange: (engine: EngineState) => void;
  onSandboxChange: (sandbox: SandboxState) => void;
}

export function StatusBar({ engine, sandbox, onEngineChange, onSandboxChange }: StatusBarProps) {
  const current = engineChip[engine];
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
    <footer className="fixed bottom-0 left-0 right-0 z-50 flex h-9 select-none items-center justify-between bg-[#111318] px-space-md font-label-sm text-[11px] text-on-surface-variant">
      <div className="flex min-w-0 items-center gap-space-xs">
        <a
          href="#/branch"
          title="切换分支"
          className="group flex h-6 items-center gap-1.5 rounded bg-surface-container px-2 font-code-sm text-[12px] text-on-surface transition-colors hover:bg-surface-container-high"
        >
          <Icon name="fork_left" className="text-[14px] text-on-surface-variant group-hover:text-primary" />
          <span className="font-medium">main*</span>
          <Icon name="expand_more" className="text-[12px] text-outline" />
        </a>
        <button
          type="button"
          data-engine={engine}
          title="每窗口独立进程"
          onClick={() => onEngineChange(nextEngineState(engine))}
          className={`flex h-6 items-center gap-2 rounded px-2.5 shadow-sm transition-colors ${
            engine === "chatting"
              ? "bg-primary/20 shadow-[0_0_12px_rgba(127,133,249,0.25)] hover:bg-primary/25"
              : "bg-surface-container-high hover:bg-surface-bright"
          }`}
        >
          {current.node}
          {engine === "disconnected" ? (
            <span
              role="presentation"
              onClick={(event) => {
                event.stopPropagation();
                onEngineChange("idle");
              }}
              className="ml-1 flex items-center gap-1 rounded bg-surface-bright px-1.5 py-0.5 font-label-xs text-[10px] text-on-surface transition-colors hover:bg-primary hover:text-on-primary"
            >
              <Icon name="refresh" className="text-[11px]" />
              重新连接 (R)
            </span>
          ) : null}
        </button>
        <div
          className="relative"
          onMouseEnter={() => setHoveringSandbox(true)}
          onMouseLeave={() => setHoveringSandbox(false)}
        >
          <button
            type="button"
            data-sandbox={sandbox}
            onClick={() => onSandboxChange(nextSandboxState(sandbox))}
            className="flex h-6 items-center gap-1.5 rounded bg-surface-container-low px-2 transition-colors hover:bg-surface-container"
          >
            <Icon
              name="shield_with_heart"
              className={`text-[13px] ${sandbox === "on" ? "text-tertiary" : "text-outline"}`}
            />
            <span className={`font-label-sm text-[11px] ${sandbox === "on" ? "text-tertiary" : "text-on-surface-variant"}`}>
              {sandbox === "on" ? "沙箱 · 命令隔离" : sandbox === "enabling" ? "沙箱 · 正在启用" : "沙箱 · 未启用"}
            </span>
          </button>
          {hoveringSandbox ? (
            sandbox === "on" ? (
              <div className="absolute bottom-8 left-0 z-50 w-80 rounded-lg border border-tertiary/40 bg-surface-container-high/95 p-space-md shadow-2xl backdrop-blur-md">
                <div className="mb-2 flex items-center justify-between border-b border-outline-variant/30 pb-1.5">
                  <div className="flex items-center gap-1.5">
                    <Icon name="shield_with_heart" className="text-[18px] text-tertiary" />
                    <span className="font-headline-sm text-[13px] font-semibold text-on-surface">沙盒隔离策略</span>
                  </div>
                  <span className="rounded border border-tertiary/30 bg-tertiary/10 px-1.5 py-0.5 font-label-xs text-tertiary">
                    已生效
                  </span>
                </div>
                <p className="font-body-sm text-[12px] leading-relaxed text-on-surface">
                  主要防范工作区外的文件操作，并限制随意联网；仍可修改当前项目。当前仅隔离终端命令。帮助降低命令风险，非绝对安全。
                </p>
                <div className="mt-2 flex items-center justify-between border-t border-outline-variant/20 pt-2 font-label-xs text-outline">
                  <span className="flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-tertiary" />
                    终端命令：独立沙箱
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-secondary" />
                    外网请求：白名单拦截
                  </span>
                </div>
              </div>
            ) : (
              <div className="absolute bottom-8 left-0 z-50 flex w-60 flex-col rounded-lg bg-surface-container-highest p-2 shadow-xl">
                <span className="mb-1 font-label-xs font-semibold text-on-surface">
                  {sandbox === "enabling" ? "正在启用" : "宿主直通模式 (Host Direct)"}
                </span>
                <span className="font-body-sm text-[11px] text-on-surface-variant">
                  {sandbox === "enabling"
                    ? "正在隔离终端命令。取消后仍为灰色未启用，没有失败弹窗。"
                    : "脚本直接执行于当前开发机操作系统环境，未封装在轻量隔离中。"}
                </span>
              </div>
            )
          ) : null}
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-space-md font-code-sm text-[11px]">
        <a href="#/status" className={`flex items-center gap-1 hover:text-on-surface ${current.latencyClass}`}>
          <Icon name="speed" className="text-[13px]" />
          <span>{current.latency}</span>
        </a>
        <span className="flex items-center gap-1">
          <Icon name="data_usage" className="text-[13px] text-primary" />
          <span>{current.tokens}</span>
        </span>
        <span>UTF-8</span>
        <span>LF</span>
        <a href="#/engine" className="hover:text-on-surface" title="引擎状态">
          TypeScript
        </a>
      </div>
    </footer>
  );
}
