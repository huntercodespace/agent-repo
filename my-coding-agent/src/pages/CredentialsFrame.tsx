import type { ReactNode } from "react";
import { sessionGroups } from "../data/workspace";
import { CredentialsPage } from "./CredentialsPage";

function SessionGlyph({ kind }: { kind: string }) {
  const common = "h-3.5 w-3.5 shrink-0";
  if (kind === "bolt") {
    return (
      <svg className={`${common} text-pi-accent`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
      </svg>
    );
  }
  if (kind === "folder") {
    return (
      <svg className={`${common} text-pi-muted`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
        <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
      </svg>
    );
  }
  if (kind === "history") {
    return (
      <svg className={`${common} text-pi-muted`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
    );
  }
  return (
    <svg className={`${common} text-pi-muted`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
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
  return (
    <div className="flex h-screen flex-col overflow-hidden bg-pi-bg font-sans text-xs text-[#c9d1d9] antialiased selection:bg-pi-accent selection:text-white">
      <header className="flex h-10 shrink-0 select-none items-center justify-between border-b border-pi-border bg-pi-surface pl-3">
        <div className="flex min-w-0 flex-1 items-center gap-4">
          <div className="flex items-center gap-1.5 font-mono text-[11px] text-pi-muted">
            <a href="#/" className="transition-colors hover:text-pi-text">pi-monorepo</a>
            <span className="text-pi-border">/</span>
            <a href="#/" className="transition-colors hover:text-pi-text">core</a>
            <span className="text-pi-border">/</span>
            <span className="text-pi-text">agent-runtime</span>
            <a href="#/branch" className="ml-2 inline-flex items-center gap-1 rounded border border-pi-border bg-pi-card px-1.5 py-0.5 text-[10px] text-pi-muted">
              <svg className="h-3 w-3 text-pi-accent" fill="currentColor" viewBox="0 0 16 16" aria-hidden="true">
                <path fillRule="evenodd" d="M11.75 2.5a.75.75 0 100 1.5.75.75 0 000-1.5zm-2.25.75a2.25 2.25 0 113 2.122V6A2.5 2.5 0 0110 8.5H6a1 1 0 00-1 1v1.128a2.251 2.251 0 11-1.5 0V5.372a2.25 2.25 0 111.5 0v1.836A2.492 2.492 0 016 7h4a1 1 0 001-1v-.628A2.25 2.25 0 019.5 3.25zM4.25 12a.75.75 0 100 1.5.75.75 0 000-1.5zM3.5 3.25a.75.75 0 111.5 0 .75.75 0 01-1.5 0z" />
              </svg>
              <span>main</span>
            </a>
          </div>
        </div>
        <div className="flex items-center gap-2 pr-2 text-[11px]">
          <a href="#/onboarding" className="flex items-center gap-1.5 rounded border border-pi-border bg-pi-card px-2.5 py-1 text-pi-muted transition-colors hover:bg-pi-cardHover hover:text-pi-text">
            <span>打开文件夹</span>
          </a>
          <a href="#/diff" className="flex items-center gap-1.5 rounded border border-pi-border bg-pi-card px-2.5 py-1 text-pi-muted transition-colors hover:bg-pi-cardHover hover:text-pi-text">
            <span className="text-emerald-400">✓</span>
            <span>提交更改 (3)</span>
          </a>
          <button type="button" className="flex items-center gap-1.5 rounded bg-pi-accent px-3 py-1 font-medium text-white shadow-sm transition-colors hover:bg-pi-accentHover">
            <span>交接 Handoff</span>
          </button>
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
            <div className="mb-2 flex items-center justify-between border-b border-pi-border pb-3">
              <a href="#/" className="flex items-center gap-2">
                <PiMark />
                <span className="flex items-baseline gap-1.5">
                  <span className="text-sm font-bold tracking-tight text-white">Pi</span>
                  <span className="rounded border border-pi-border bg-pi-card px-1.5 py-0.5 font-mono text-[10px] text-pi-muted">v2.4.0</span>
                </span>
              </a>
              <span className="flex h-6 w-6 items-center justify-center rounded bg-pi-card text-pi-muted">+</span>
            </div>
            <div className="relative mb-3">
              <input
                readOnly
                type="text"
                placeholder="搜索会话与命令 ⌘K"
                className="w-full cursor-pointer rounded border border-pi-border bg-pi-card px-2.5 py-1.5 text-xs text-pi-muted hover:border-pi-borderLight focus:outline-none"
              />
            </div>
            <div className="space-y-4 text-xs">
              {sessionGroups.map((group) => (
                <div key={group.label}>
                  <div className="mb-1 px-1 text-[10px] font-semibold uppercase tracking-wider text-pi-muted">{group.label}</div>
                  <ul className="space-y-0.5">
                    {group.items.map((item) => (
                      <li key={item.id}>
                        <a
                          href={item.id === "auth-race-condition" ? "#/diff" : "#/"}
                          className="flex items-center gap-2 rounded px-2 py-1.5 text-pi-muted hover:bg-pi-card hover:text-pi-text"
                        >
                          <SessionGlyph kind={item.icon} />
                          <span className="truncate">{item.label}</span>
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
          <div className="space-y-1 border-t border-pi-border bg-pi-card/30 p-3">
            <a href="#workflows" className="flex items-center gap-2 rounded px-2 py-1.5 text-pi-muted hover:bg-pi-card hover:text-pi-text">
              <span>自动化工作流</span>
            </a>
            <a href="#plugins" className="flex items-center gap-2 rounded px-2 py-1.5 text-pi-muted hover:bg-pi-card hover:text-pi-text">
              <span>插件市场</span>
            </a>
            <a href="#/settings" className="flex items-center justify-between rounded border border-pi-border bg-pi-card px-2 py-1.5 font-medium text-white">
              <span>偏好设置</span>
              <span className="font-mono text-[10px] text-pi-muted">⌘,</span>
            </a>
            <div className="flex items-center justify-between px-1 pt-2 text-[11px] text-pi-muted">
              <span className="truncate font-mono">dev@company.io</span>
              <div className="h-2 w-2 rounded-full bg-emerald-400" />
            </div>
          </div>
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
