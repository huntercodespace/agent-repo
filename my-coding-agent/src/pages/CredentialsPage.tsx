export function CredentialsPage() {
  return (
    <div className="flex h-full min-h-0 w-full bg-pi-bg text-pi-text">
      {/* BEGIN: SettingsNavColumn (~230px) */}
      <nav aria-label="偏好设置导航" className="w-[230px] border-r border-pi-border bg-pi-bg flex flex-col justify-between flex-shrink-0 p-3 select-none">
        <div>
          {/* Settings Header Info */}
          <div className="px-2 py-1.5 mb-2">
            <div className="text-[10px] font-semibold tracking-wider text-pi-muted uppercase">
              偏好设置 DOMAINS
            </div>
            <div className="text-xs text-white font-medium flex items-center gap-1.5 mt-0.5">
              <span>
                工作区环境配置
              </span>
            </div>
          </div>
          {/* Domains List */}
          <div className="space-y-1">
            {/* 通用 General */}
            <button className="w-full flex items-center justify-between px-2.5 py-2 rounded text-pi-muted hover:bg-pi-card hover:text-pi-text transition-colors text-left group">
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-pi-muted group-hover:text-pi-text" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="3">
                  </circle>
                  <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z">
                  </path>
                </svg>
                <div className="leading-tight">
                  <div className="text-xs">
                    通用 General
                  </div>
                  <div className="text-[10px] text-pi-muted">
                    Telemetry, Updates
                  </div>
                </div>
              </div>
            </button>
            {/* 外观与主题 Appearance */}
            <button className="w-full flex items-center justify-between px-2.5 py-2 rounded text-pi-muted hover:bg-pi-card hover:text-pi-text transition-colors text-left group">
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-pi-muted group-hover:text-pi-text" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10">
                  </circle>
                  <path d="M12 2a10 10 0 0 0 0 20v-20z">
                  </path>
                </svg>
                <div className="leading-tight">
                  <div className="text-xs">
                    外观与主题 Appearance
                  </div>
                  <div className="text-[10px] text-pi-muted">
                    Theme, Typography
                  </div>
                </div>
              </div>
            </button>
            {/* 模型与计算 Models & Inference */}
            <button className="w-full flex items-center justify-between px-2.5 py-2 rounded text-pi-muted hover:bg-pi-card hover:text-pi-text transition-colors text-left group">
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-pi-muted group-hover:text-pi-text" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M18 8h1a4 4 0 0 1 0 8h-1">
                  </path>
                  <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z">
                  </path>
                  <line x1="6" x2="6" y1="1" y2="4">
                  </line>
                  <line x1="10" x2="10" y1="1" y2="4">
                  </line>
                  <line x1="14" x2="14" y1="1" y2="4">
                  </line>
                </svg>
                <div className="leading-tight">
                  <div className="text-xs">
                    模型与计算 Models
                  </div>
                  <div className="text-[10px] text-pi-muted">
                    Routing, Fallbacks
                  </div>
                </div>
              </div>
            </button>
            {/* ACTIVE ITEM: 模型凭据 Model Credentials */}
            <button className="w-full flex items-center justify-between px-2.5 py-2 rounded bg-pi-card border-l-2 border-pi-accent text-white shadow-sm text-left">
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-pi-accent" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <rect height="11" rx="2" ry="2" width="18" x="3" y="11">
                  </rect>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4">
                  </path>
                </svg>
                <div className="leading-tight">
                  <div className="text-xs font-semibold text-white">
                    模型凭据 Credentials
                  </div>
                  <div className="text-[10px] text-pi-accent">
                    API Keys, OAuth, Env
                  </div>
                </div>
              </div>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-pi-accent/20 text-pi-accent font-semibold">
                6
              </span>
            </button>
            {/* 权限与安全沙箱 Permissions */}
            <button className="w-full flex items-center justify-between px-2.5 py-2 rounded text-pi-muted hover:bg-pi-card hover:text-pi-text transition-colors text-left group">
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-pi-muted group-hover:text-pi-text" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z">
                  </path>
                </svg>
                <div className="leading-tight">
                  <div className="text-xs">
                    权限与沙箱 Permissions
                  </div>
                  <div className="text-[10px] text-pi-muted">
                    Terminal, File Guards
                  </div>
                </div>
              </div>
            </button>
            {/* 快捷键 Keybindings */}
            <button className="w-full flex items-center justify-between px-2.5 py-2 rounded text-pi-muted hover:bg-pi-card hover:text-pi-text transition-colors text-left group">
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-pi-muted group-hover:text-pi-text" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <rect height="16" rx="2" ry="2" width="20" x="2" y="4">
                  </rect>
                  <path d="M6 8h.001M10 8h.001M14 8h.001M18 8h.001M8 12h.001M12 12h.001M16 12h.001M7 16h10">
                  </path>
                </svg>
                <div className="leading-tight">
                  <div className="text-xs">
                    快捷键 Keybindings
                  </div>
                  <div className="text-[10px] text-pi-muted">
                    Vim, Custom Hotkeys
                  </div>
                </div>
              </div>
            </button>
            {/* 扩展与 MCP 服务 Plugins & MCP */}
            <button className="w-full flex items-center justify-between px-2.5 py-2 rounded text-pi-muted hover:bg-pi-card hover:text-pi-text transition-colors text-left group">
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-pi-muted group-hover:text-pi-text" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <circle cx="18" cy="18" r="3">
                  </circle>
                  <circle cx="6" cy="6" r="3">
                  </circle>
                  <path d="M13 6h3a2 2 0 0 1 2 2v7">
                  </path>
                  <line x1="6" x2="6" y1="9" y2="21">
                  </line>
                </svg>
                <div className="leading-tight">
                  <div className="text-xs">
                    扩展与 MCP Plugins
                  </div>
                  <div className="text-[10px] text-pi-muted">
                    Model Context Protocol
                  </div>
                </div>
              </div>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400">
                3 Active
              </span>
            </button>
          </div>
        </div>
        {/* Keychain Status Card at bottom */}
        <div className="p-2.5 rounded-lg bg-pi-card/80 border border-pi-border">
          <div className="flex items-center gap-2 text-pi-accent text-xs font-semibold mb-1">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z">
              </path>
            </svg>
            <span>
              AuthStorage 保护状态
            </span>
          </div>
          <div className="text-[10px] text-pi-muted leading-relaxed font-mono">
            AES-256 GCM 隔离保护
            <br />
            宿主硬件密钥环：
            <span className="text-emerald-400">
              就绪
            </span>
          </div>
        </div>
      </nav>
      {/* END: SettingsNavColumn */}
      {/* BEGIN: MainWorkspaceContent (Credentials Dashboard) */}
      <main className="flex-1 bg-pi-bg overflow-y-auto p-6 flex flex-col justify-between">
        <div className="space-y-5 max-w-[940px] mx-auto w-full">
          {/* Page Header & Top Config Context */}
          <div className="flex items-start justify-between border-b border-pi-border pb-4">
            <div>
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-pi-accent/15 border border-pi-accent/30 flex items-center justify-center text-pi-accent">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <rect height="11" rx="2" ry="2" width="18" x="3" y="11">
                    </rect>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4">
                    </path>
                  </svg>
                </div>
                <h1 className="text-base font-semibold text-white tracking-tight">
                  模型凭据 Model Credentials
                </h1>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400">
                  </span>
                  系统凭据链就绪
                </span>
              </div>
              <p className="text-pi-muted text-xs mt-1.5 leading-relaxed max-w-2xl">
                安全管理各推理大模型的 API 密钥、环境变量与 OAuth 访问授权。所有密钥通过系统安全凭据链 (AuthStorage) 本地加密存储，绝不经过 Pi 云端服务器。
              </p>
            </div>
            {/* Top Action Buttons */}
            <div className="flex items-center gap-2">
              <button className="px-2.5 py-1.5 rounded bg-pi-card hover:bg-pi-cardHover border border-pi-border text-pi-muted hover:text-white transition-colors flex items-center gap-1.5 text-xs font-mono">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <polyline points="23 4 23 10 17 10">
                  </polyline>
                  <polyline points="1 20 1 14 7 14">
                  </polyline>
                  <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15">
                  </path>
                </svg>
                <span>
                  重新检测 ENV
                </span>
              </button>
              <button className="px-2.5 py-1.5 rounded bg-pi-card hover:bg-pi-cardHover border border-pi-border text-pi-muted hover:text-white transition-colors flex items-center gap-1.5 text-xs">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4">
                  </path>
                  <polyline points="7 10 12 15 17 10">
                  </polyline>
                  <line x1="12" x2="12" y1="15" y2="3">
                  </line>
                </svg>
                <span>
                  导出加密配置
                </span>
              </button>
            </div>
          </div>
          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 rounded-lg bg-pi-card border border-pi-border flex items-center justify-between">
              <div>
                <div className="text-[10px] uppercase font-mono text-pi-muted">
                  活跃服务商总计
                </div>
                <div className="text-sm font-semibold text-white mt-0.5">
                  6 家 Provider
                </div>
              </div>
              <div className="w-8 h-8 rounded-full bg-pi-accent/10 border border-pi-accent/30 flex items-center justify-center text-pi-accent font-mono font-bold">
                6
              </div>
            </div>
            <div className="p-3 rounded-lg bg-pi-card border border-pi-border flex items-center justify-between">
              <div>
                <div className="text-[10px] uppercase font-mono text-pi-muted">
                  来源分布
                </div>
                <div className="text-[11px] font-mono text-white mt-0.5">
                  <span className="text-pi-accent">
                    2 本地
                  </span>
                   · 
                  <span className="text-cyan-400">
                    2 ENV
                  </span>
                   · 
                  <span className="text-emerald-400">
                    1 OAuth
                  </span>
                   · 
                  <span className="text-amber-400">
                    1 待配
                  </span>
                </div>
              </div>
              <div className="w-8 h-8 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <polyline points="20 6 9 17 4 12">
                  </polyline>
                </svg>
              </div>
            </div>
            <div className="p-3 rounded-lg bg-pi-card border border-pi-border flex items-center justify-between">
              <div>
                <div className="text-[10px] uppercase font-mono text-pi-muted">
                  安全防护机制
                </div>
                <div className="text-[11px] font-mono text-emerald-400 mt-0.5">
                  零明文 · 硬件安全密钥环
                </div>
              </div>
              <div className="w-8 h-8 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z">
                  </path>
                </svg>
              </div>
            </div>
          </div>
          {/* BEGIN: CredentialsGrid (6 States) */}
          <div className="grid grid-cols-2 gap-3.5">
            {/* STATE 1: 未配置 (Unconfigured) - Anthropic Claude */}
            <div className="p-4 rounded-lg bg-pi-card border border-pi-border flex flex-col justify-between hover:border-pi-borderLight transition-all" data-purpose="credential-card-unconfigured">
              <div>
                {/* Card Header */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded bg-[#d97706]/10 border border-[#d97706]/30 flex items-center justify-center text-[#d97706] font-bold text-xs">
                      A
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-white">
                        Anthropic
                      </div>
                      <div className="text-[10px] text-pi-muted font-mono">
                        Claude 3.7 Sonnet / Claude 3.5 Haiku
                      </div>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-amber-500/10 border border-amber-500/30 text-amber-300">
                    未配置
                  </span>
                </div>
                {/* Input form */}
                <div className="space-y-2">
                  <label className="block text-[11px] text-pi-muted font-mono">
                    API KEY 或 OAUTH TOKEN
                  </label>
                  <div className="relative">
                    <input className="w-full bg-[#0d1017] border border-pi-border rounded px-3 py-1.5 text-xs text-pi-text placeholder-pi-muted/50 focus:border-pi-accent focus:ring-1 focus:ring-pi-accent focus:outline-none font-mono" placeholder="sk-ant-api03-••••••••••••" type="password" />
                    <div className="absolute right-2.5 top-2 text-pi-muted/60">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24">
                          <line x1="1" x2="23" y1="1" y2="23">
                          </line>
                        </path>
                      </svg>
                    </div>
                  </div>
                  <p className="text-[10px] text-pi-muted">
                    密钥仅保存在本地 AuthStorage，永不离开此设备。
                  </p>
                </div>
              </div>
              {/* Card Actions */}
              <div className="mt-4 pt-3 border-t border-pi-border flex items-center justify-between">
                <button className="text-[11px] text-pi-accent hover:underline flex items-center gap-1 font-medium">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M15 3h6v6">
                    </path>
                    <path d="M10 14L21 3">
                    </path>
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6">
                    </path>
                  </svg>
                  <span>
                    使用 Claude OAuth 登录
                  </span>
                </button>
                <button className="px-3 py-1 rounded bg-pi-accent hover:bg-pi-accentHover text-white text-[11px] font-medium transition-colors shadow-sm">
                  保存密钥
                </button>
              </div>
            </div>
            {/* STATE 2: 录入中 (Input in Progress / Loading) - OpenRouter */}
            <div className="p-4 rounded-lg bg-pi-card border border-pi-accent/50 glow-subtle flex flex-col justify-between transition-all" data-purpose="credential-card-loading">
              <div>
                {/* Card Header */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 font-bold text-xs">
                      OR
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-white">
                        OpenRouter
                      </div>
                      <div className="text-[10px] text-pi-muted font-mono">
                        Universal Multi-Model Gateway
                      </div>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-pi-accent/15 border border-pi-accent/40 text-pi-accent flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-pi-accent animate-pulse">
                    </span>
                    验证与保存中...
                  </span>
                </div>
                {/* Input form with active state */}
                <div className="space-y-2">
                  <label className="block text-[11px] text-pi-muted font-mono">
                    API KEY (sk-or-v1-••••)
                  </label>
                  <div className="relative">
                    <input className="w-full bg-[#0d1017] border border-pi-accent rounded px-3 py-1.5 text-xs text-white font-mono tracking-wider focus:outline-none" readOnly={true} type="password" value="sk-or-v1-abcdef0123456789deadbeef" />
                    <div className="absolute right-2.5 top-2">
                      <svg className="animate-spin w-3.5 h-3.5 text-pi-accent" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4">
                        </circle>
                        <path className="opacity-75" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" fill="currentColor">
                        </path>
                      </svg>
                    </div>
                  </div>
                  <p className="text-[10px] text-pi-accent/80 font-mono">
                    正在向 api.openrouter.ai 发起低延迟握手校验与权限范围查询...
                  </p>
                </div>
              </div>
              {/* Card Actions */}
              <div className="mt-4 pt-3 border-t border-pi-border flex items-center justify-between">
                <button className="text-[11px] text-pi-muted hover:text-pi-text transition-colors">
                  取消
                </button>
                <button className="px-3 py-1 rounded bg-pi-accent/50 text-white/70 text-[11px] font-medium cursor-not-allowed flex items-center gap-1.5" disabled={true}>
                  <svg className="animate-spin w-3 h-3" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4">
                    </circle>
                    <path className="opacity-75" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" fill="currentColor">
                    </path>
                  </svg>
                  <span>
                    正在校验密钥...
                  </span>
                </button>
              </div>
            </div>
            {/* STATE 3: 已保存 · 来自本地 (Saved Local) - OpenAI */}
            <div className="p-4 rounded-lg bg-pi-card border border-pi-border hover:border-pi-borderLight flex flex-col justify-between transition-all" data-purpose="credential-card-saved-local">
              <div>
                {/* Card Header */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold text-xs">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5">
                        </path>
                      </svg>
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-white">
                        OpenAI
                      </div>
                      <div className="text-[10px] text-pi-muted font-mono">
                        GPT-4o, GPT-4.5, o3-mini
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400">
                      </span>
                      已保存
                    </span>
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-pi-accent/15 border border-pi-accent/30 text-pi-accent">
                      来自本地
                    </span>
                  </div>
                </div>
                {/* Key Display (Never Full Key) */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-[11px] font-mono text-pi-muted">
                    <span>
                      当前指纹 (FINGERPRINT)
                    </span>
                    <span className="text-[10px]">
                      更新于 3 天前
                    </span>
                  </div>
                  <div className="flex items-center justify-between bg-[#0d1017] border border-pi-border rounded px-3 py-1.5">
                    <span className="font-mono text-xs text-emerald-400 tracking-wider">
                      ••••••••••••••••sk-9a7f
                    </span>
                    <button className="text-pi-muted hover:text-white p-0.5" title="复制指纹">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <rect height="13" rx="2" ry="2" width="13" x="9" y="9">
                        </rect>
                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1">
                        </path>
                      </svg>
                    </button>
                  </div>
                  <p className="text-[10px] text-pi-muted font-mono flex items-center gap-1 mt-1">
                    <svg className="w-3 h-3 text-emerald-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z">
                      </path>
                    </svg>
                    <span>
                      存储于系统 Keychain / AuthStorage (AES-256)
                    </span>
                  </p>
                </div>
              </div>
              {/* Card Actions */}
              <div className="mt-4 pt-3 border-t border-pi-border flex items-center justify-between">
                <button className="text-[11px] text-rose-400/80 hover:text-rose-400 font-mono transition-colors">
                  清除 (Clear)
                </button>
                <button className="px-2.5 py-1 rounded bg-pi-card hover:bg-pi-cardHover border border-pi-border text-white text-[11px] font-medium transition-colors">
                  更新密钥
                </button>
              </div>
            </div>
            {/* STATE 4: 来自环境变量 (Environment Variable) - Google Gemini */}
            <div className="p-4 rounded-lg bg-pi-card border border-pi-border hover:border-pi-borderLight flex flex-col justify-between transition-all" data-purpose="credential-card-env-var">
              <div>
                {/* Card Header */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 font-bold text-xs">
                      G
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-white">
                        Google DeepMind
                      </div>
                      <div className="text-[10px] text-pi-muted font-mono">
                        Gemini 2.5 Pro / Flash 2.0
                      </div>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-500/15 border border-cyan-500/40 text-cyan-300 flex items-center gap-1">
                    <span className="font-bold">
                      $
                    </span>
                    来自环境变量
                  </span>
                </div>
                {/* Read-only Masked Key */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-[11px] font-mono text-pi-muted">
                    <span>
                      环境变量键名 (SYSTEM ENV)
                    </span>
                    <span className="text-cyan-400 text-[10px] flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400">
                      </span>
                      已注入进程
                    </span>
                  </div>
                  <div className="flex items-center justify-between bg-[#0d1017] border border-cyan-900/40 rounded px-3 py-1.5 input-disabled-stripes">
                    <span className="font-mono text-xs text-cyan-300 tracking-wide">
                      $GEMINI_API_KEY (••••••e3b1)
                    </span>
                    <svg className="w-3.5 h-3.5 text-pi-muted" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <rect height="11" rx="2" ry="2" width="18" x="3" y="11">
                      </rect>
                      <path d="M7 11V7a5 5 0 0 1 10 0v4">
                      </path>
                    </svg>
                  </div>
                  <p className="text-[10px] text-pi-muted leading-tight mt-1">
                    检测到系统环境变量已生效。如需覆盖，请保存本地 AuthStorage 密钥。
                  </p>
                </div>
              </div>
              {/* Card Actions */}
              <div className="mt-4 pt-3 border-t border-pi-border flex items-center justify-between">
                <span className="text-[10px] text-pi-muted font-mono">
                  只读模式 (Shell ENV)
                </span>
                <button className="px-2.5 py-1 rounded bg-pi-card hover:bg-pi-cardHover border border-pi-border text-white text-[11px] font-medium transition-colors">
                  覆盖为本地密钥 (Override)
                </button>
              </div>
            </div>
            {/* STATE 5: OAuth 已登录 (OAuth Connected) - GitHub Copilot */}
            <div className="p-4 rounded-lg bg-pi-card border border-pi-border hover:border-pi-borderLight flex flex-col justify-between transition-all" data-purpose="credential-card-oauth-connected">
              <div>
                {/* Card Header */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded bg-white/10 border border-white/20 flex items-center justify-center text-white font-bold text-xs">
                      <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                        <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z">
                        </path>
                      </svg>
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-white">
                        GitHub Copilot / Codex
                      </div>
                      <div className="text-[10px] text-pi-muted font-mono">
                        Enterprise Auth Bridge
                      </div>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 flex items-center gap-1">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <polyline points="20 6 9 17 4 12">
                      </polyline>
                    </svg>
                    OAuth 已登录
                  </span>
                </div>
                {/* Account & Organization Information */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2.5 p-2 rounded bg-[#0d1017] border border-pi-border">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-pi-accent to-purple-500 flex items-center justify-center text-[10px] text-white font-mono font-bold">
                      AD
                    </div>
                    <div className="flex-1 leading-tight">
                      <div className="text-xs font-mono text-white">
                        alex.d••••@octocat.dev
                      </div>
                      <div className="text-[10px] text-pi-muted">
                        组织组织节点: Corp-Sandbox-Prod
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-pi-muted font-mono px-1">
                    <span>
                      Token 自动续期中
                    </span>
                    <span>
                      有效期至 2025-04-12
                    </span>
                  </div>
                </div>
              </div>
              {/* Card Actions */}
              <div className="mt-4 pt-3 border-t border-pi-border flex items-center justify-between">
                <button className="text-[11px] text-pi-accent hover:underline">
                  刷新授权状态
                </button>
                <button className="px-2.5 py-1 rounded bg-pi-card hover:bg-pi-cardHover border border-pi-border text-rose-300 hover:text-rose-200 text-[11px] font-medium transition-colors">
                  退出登录 (Sign Out)
                </button>
              </div>
            </div>
            {/* STATE 6: 保存失败可重试 (Save Failed / Retryable) - Custom OpenAI-Compatible */}
            <div className="p-4 rounded-lg bg-pi-card border border-rose-500/40 flex flex-col justify-between transition-all" data-purpose="credential-card-failed">
              <div>
                {/* Card Header */}
                <div className="flex items-center justify-between mb-2.5">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 font-bold text-xs">
                      C
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-white">
                        自定义端点 (DeepSeek / vLLM)
                      </div>
                      <div className="text-[10px] text-pi-muted font-mono">
                        OpenAI-Compatible Gateway
                      </div>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-rose-500/15 border border-rose-500/40 text-rose-300 flex items-center gap-1">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <circle cx="12" cy="12" r="10">
                      </circle>
                      <line x1="12" x2="12" y1="8" y2="12">
                      </line>
                      <line x1="12" x2="12.01" y1="16" y2="16">
                      </line>
                    </svg>
                    校验失败
                  </span>
                </div>
                {/* Error Message Banner */}
                <div className="mb-2.5 p-2 rounded bg-rose-950/40 border border-rose-800/40 text-rose-300 text-[11px] flex items-start gap-2">
                  <svg className="w-3.5 h-3.5 text-rose-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10">
                    </circle>
                    <line x1="12" x2="12" y1="8" y2="12">
                    </line>
                    <line x1="12" x2="12.01" y1="16" y2="16">
                    </line>
                  </svg>
                  <div className="leading-tight">
                    <span className="font-semibold">
                      保存失败，请重试：
                    </span>
                    <span className="font-mono text-[10px] block text-rose-300/80 mt-0.5">
                      连接 https://api.deepseek.com/v1 超时 (ETIMEDOUT 5000ms)，未产生本地保存。
                    </span>
                  </div>
                </div>
                {/* Input Field (Retains Masked Input, Never Plaintext) */}
                <div className="space-y-1">
                  <div className="relative">
                    <input className="w-full bg-[#0d1017] border border-rose-500/40 rounded px-3 py-1.5 text-xs text-pi-text font-mono tracking-wider focus:outline-none" readOnly={true} type="password" value="sk-dsk-demo-key-123489d2" />
                    <span className="absolute right-2.5 top-2 text-[10px] font-mono text-pi-muted">
                      ••••••••89d2
                    </span>
                  </div>
                </div>
              </div>
              {/* Card Actions */}
              <div className="mt-3 pt-3 border-t border-pi-border flex items-center justify-between">
                <button className="text-[11px] text-pi-muted hover:text-white transition-colors">
                  检查代理设置
                </button>
                <div className="flex items-center gap-2">
                  <button className="px-2.5 py-1 rounded bg-pi-card hover:bg-pi-cardHover border border-pi-border text-pi-muted hover:text-white text-[11px] transition-colors">
                    放弃
                  </button>
                  <button className="px-3 py-1 rounded bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 text-rose-200 text-[11px] font-medium transition-colors flex items-center gap-1">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <polyline points="23 4 23 10 17 10">
                      </polyline>
                      <polyline points="1 20 1 14 7 14">
                      </polyline>
                      <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15">
                      </path>
                    </svg>
                    <span>
                      重试保存 (Retry)
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </div>
          {/* END: CredentialsGrid */}
          {/* BEGIN: SecurityGuaranteesCard */}
          <section aria-labelledby="security-rules-title" className="rounded-lg bg-pi-card/90 border border-pi-border p-4" data-purpose="credential-security-guarantees">
            <div className="flex items-center gap-2 mb-2.5">
              <svg className="w-4 h-4 text-pi-accent" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z">
                </path>
              </svg>
              <h2 className="text-xs font-semibold text-white tracking-tight" id="security-rules-title">
                Pi 安全与凭据隔离规范 (Credential Security Guarantees)
              </h2>
              <span className="text-[10px] font-mono text-pi-muted">
                AES-256-GCM / Strict Local Bound
              </span>
            </div>
            <div className="grid grid-cols-3 gap-3 pt-1 text-xs">
              <div className="p-2.5 rounded bg-pi-surface/80 border border-pi-border/80 space-y-1">
                <div className="flex items-center gap-1.5 font-semibold text-white text-[11px]">
                  <span>
                    🛡️ 零明文原则
                  </span>
                </div>
                <p className="text-[10px] text-pi-muted leading-relaxed">
                  界面与日志中绝不展示完整 API Key，仅保留末 4 位校验指纹，防止录屏与肩窥泄露。
                </p>
              </div>
              <div className="p-2.5 rounded bg-pi-surface/80 border border-pi-border/80 space-y-1">
                <div className="flex items-center gap-1.5 font-semibold text-white text-[11px]">
                  <span>
                    🗂️ 明确三元来源
                  </span>
                </div>
                <p className="text-[10px] text-pi-muted leading-relaxed">
                  凭据来源严格限定为 [本地 AuthStorage]、[系统环境变量 ENV] 或 [OAuth 授权]，来源优先级明确互不污染。
                </p>
              </div>
              <div className="p-2.5 rounded bg-pi-surface/80 border border-pi-border/80 space-y-1">
                <div className="flex items-center gap-1.5 font-semibold text-white text-[11px]">
                  <span>
                    ⚡ 即时生效与状态流转
                  </span>
                </div>
                <p className="text-[10px] text-pi-muted leading-relaxed">
                  录入校验成功后立即原子化转为「已保存 · 来自本地」，支持运行时热重载，无需重启开发台。
                </p>
              </div>
            </div>
          </section>
          {/* END: SecurityGuaranteesCard */}
        </div>
        {/* Sticky Bottom Save & Sync Controller */}
        <div className="pt-4 border-t border-pi-border flex items-center justify-between mt-4">
          <div className="flex items-center gap-2 text-[11px] font-mono text-pi-muted">
            <span className="w-2 h-2 rounded-full bg-emerald-400">
            </span>
            <span className="text-white">
              已自动保存 (Auto-saved)
            </span>
            <span className="text-pi-border">
              |
            </span>
            <span>
              变更已实时热载至 active runtime
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button className="px-3 py-1.5 rounded bg-pi-card hover:bg-pi-cardHover border border-pi-border text-pi-muted hover:text-white text-xs transition-colors flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8">
                </path>
                <path d="M21 3v5h-5">
                </path>
                <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16">
                </path>
                <path d="M8 16H3v5">
                </path>
              </svg>
              <span>
                重置为默认值 (Restore Defaults)
              </span>
            </button>
            <button className="px-3.5 py-1.5 rounded bg-pi-accent hover:bg-pi-accentHover text-white text-xs font-medium transition-colors shadow-sm flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <polyline points="20 6 9 17 4 12">
                </polyline>
              </svg>
              <span>
                同步到远程团队策略
              </span>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
