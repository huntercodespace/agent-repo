import type { ReactNode } from "react";
import { useRpc } from "../rpc/RpcProvider";
import { CredentialsPage } from "./CredentialsPage";

function workspaceName(cwd: string) {
  return cwd.split(/[\\/]/).filter(Boolean).at(-1) || cwd;
}

function PiMark() {
  return (
    <svg className="h-6 w-6 rounded-md shadow-inner" fill="none" viewBox="0 0 48 48" aria-hidden="true">
      <rect fill="#16181e" height="48" rx="10" stroke="#2a2e39" strokeWidth="1.5" width="48" />
      <path d="M14 18C14 16.8954 14.8954 16 16 16H32C33.1046 16 34 16.8954 34 18V19C34 20.1046 33.1046 21 32 21H16C14.8954 21 14 20.1046 14 19V18Z" fill="#7c82f6" />
      <path d="M18 20V32C18 33.1046 17.1046 34 16 34H15C13.8954 34 13 33.1046 13 32V20" stroke="#7c82f6" strokeLinecap="round" strokeWidth="2.5" />
      <path d="M28 20V29C28 31.7614 30.2386 34 33 34H34" stroke="#6366f1" strokeLinecap="round" strokeWidth="2.5" />
      <circle cx="28" cy="20" fill="#a5b4fc" r="1.5" />
    </svg>
  );
}

function WindowChromeButton({
  label,
  onClick,
  children,
  danger = false,
}: {
  label: string;
  onClick: () => void;
  children: ReactNode;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      className={`flex h-10 w-11 items-center justify-center text-pi-muted transition-colors ${
        danger ? "hover:bg-[#c42b1c] hover:text-white" : "hover:bg-pi-cardHover hover:text-pi-text"
      }`}
    >
      {children}
    </button>
  );
}

export function CredentialsFrame() {
  const desktop = window.piDesktop;
  const { status, workspaceState, addWorkspace, switchWorkspace, workspaceBusy } = useRpc();
  const cwd = status.available ? status.cwd : "";
  const paths = workspaceState.paths.length ? workspaceState.paths : cwd ? [cwd] : [];
  return (
    <div className="flex h-screen flex-col overflow-hidden bg-pi-bg font-sans text-xs text-[#c9d1d9] antialiased selection:bg-pi-accent selection:text-white">
      <header className="flex h-10 shrink-0 select-none items-center justify-between border-b border-pi-border bg-pi-surface pl-3">
        <div className="flex min-w-0 flex-1 items-center gap-4 text-[11px]">
          <button type="button" disabled={workspaceBusy} onClick={() => void addWorkspace()} className="flex items-center gap-1.5 rounded border border-pi-border bg-pi-card px-2.5 py-1 text-pi-muted transition-colors hover:bg-pi-cardHover hover:text-pi-text disabled:cursor-not-allowed disabled:opacity-50">
            <span>打开文件夹</span>
          </button>
          <a href="#/diff" className="flex items-center gap-1.5 rounded border border-pi-border bg-pi-card px-2.5 py-1 text-pi-muted transition-colors hover:bg-pi-cardHover hover:text-pi-text">
            <span className="text-emerald-400">✓</span>
            <span>提交更改 (3)</span>
          </a>
          <a href="#/branch" className="inline-flex items-center gap-1 rounded border border-pi-border bg-pi-card px-1.5 py-0.5 font-mono text-[10px] text-pi-muted">
            <svg className="h-3 w-3 text-pi-accent" fill="currentColor" viewBox="0 0 16 16" aria-hidden="true">
              <path fillRule="evenodd" d="M11.75 2.5a.75.75 0 100 1.5.75.75 0 000-1.5zm-2.25.75a2.25 2.25 0 113 2.122V6A2.5 2.5 0 0110 8.5H6a1 1 0 00-1 1v1.128a2.251 2.251 0 11-1.5 0V5.372a2.25 2.25 0 111.5 0v1.836A2.492 2.492 0 016 7h4a1 1 0 001-1v-.628A2.25 2.25 0 019.5 3.25zM4.25 12a.75.75 0 100 1.5.75.75 0 000-1.5zM3.5 3.25a.75.75 0 111.5 0 .75.75 0 01-1.5 0z" />
            </svg>
            <span>main</span>
          </a>
        </div>
        <div className="ml-2 flex h-10 shrink-0 items-stretch">
          <WindowChromeButton label="最小化" onClick={() => desktop?.minimize()}>
            <svg className="h-3 w-3" viewBox="0 0 12 12" fill="none" aria-hidden="true">
              <path d="M2 6h8" stroke="currentColor" strokeWidth="1.2" />
            </svg>
          </WindowChromeButton>
          <WindowChromeButton label="最大化" onClick={() => desktop?.toggleMaximize()}>
            <svg className="h-3 w-3" viewBox="0 0 12 12" fill="none" aria-hidden="true">
              <rect x="2.25" y="2.25" width="7.5" height="7.5" stroke="currentColor" strokeWidth="1.2" />
            </svg>
          </WindowChromeButton>
          <WindowChromeButton label="关闭" danger onClick={() => desktop?.close()}>
            <svg className="h-3 w-3" viewBox="0 0 12 12" fill="none" aria-hidden="true">
              <path d="M3 3l6 6M9 3L3 9" stroke="currentColor" strokeWidth="1.2" />
            </svg>
          </WindowChromeButton>
        </div>
      </header>
      <div className="flex min-h-0 flex-1 overflow-hidden">
        <aside className="flex w-60 shrink-0 flex-col justify-between border-r border-pi-border bg-pi-surface">
          <div className="p-3">
            <a href="#/" className="flex items-center gap-2 border-b border-pi-border pb-3">
              <PiMark />
              <span className="text-sm font-bold tracking-tight text-white">Pi</span>
            </a>
            <nav aria-label="工作区" className="pt-4 text-xs">
              <div className="mb-1 px-1 text-[10px] font-semibold uppercase tracking-wider text-pi-muted">工作区</div>
              {paths.length ? (
                paths.map((workspacePath) => (
                  <button
                    key={workspacePath}
                    type="button"
                    title={workspacePath}
                    disabled={workspaceBusy || (workspacePath !== cwd && (!cwd || status.engine === "chatting"))}
                    onClick={() => void switchWorkspace(workspacePath)}
                    className={`flex w-full items-center rounded px-2 py-1.5 text-left hover:bg-pi-card disabled:cursor-not-allowed disabled:opacity-50 ${workspacePath === cwd ? "bg-pi-card text-pi-text" : "text-pi-muted"}`}
                  >
                    <span className="truncate">{workspaceName(workspacePath)}</span>
                  </button>
                ))
              ) : (
                <p className="px-2 py-1.5 text-pi-muted">尚未连接工作区</p>
              )}
            </nav>
          </div>
          <nav aria-label="设置" className="border-t border-pi-border bg-pi-card/30 p-3">
            <a href="#/settings" className="flex items-center rounded px-2 py-1.5 font-medium text-pi-text hover:bg-pi-card">
              偏好设置
            </a>
          </nav>
        </aside>
        <CredentialsPage />
      </div>
      <footer className="flex h-6 shrink-0 select-none items-center justify-between border-t border-pi-border bg-pi-surface px-3 font-mono text-[10px] text-pi-muted">
        <div className="flex items-center gap-3">
          <a href="#/branch" className="flex items-center gap-1 text-white">
            <span className="text-pi-accent">Git:</span> main <span className="text-emerald-400">✓</span>
          </a>
          <span className="text-pi-border">|</span>
          <span>Pi Engine: v2.4 (Ready)</span>
          <span className="text-pi-border">|</span>
          <span className="flex items-center gap-1 text-pi-accent">凭据存储: 本地 AuthStorage 就绪</span>
          <span className="text-pi-border">|</span>
          <span>延迟: 18ms</span>
        </div>
        <div className="flex items-center gap-3">
          <span>已消耗 4.2k tokens</span>
          <span className="text-pi-border">|</span>
          <span className="flex items-center gap-1 text-emerald-400">安全隔离: 100% 宿主密态存储</span>
        </div>
      </footer>
    </div>
  );
}
