import logo from "../assets/pi-logo.png";

export function DiffPage() {
  return (
  <div className="flex h-full min-h-0 w-full overflow-hidden bg-surface text-on-surface">
    {/* Left/Center Canvas: Collaborative Autonomous Workflow */}
    <div className="flex-1 flex flex-col min-w-0 bg-surface relative">
      {/* Ambient Studio Spotlight */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-br from-primary-container/10 via-secondary-container/5 to-transparent rounded-full blur-3xl pointer-events-none">
      </div>
      {/* Agent Workstation Sub-Header Bar */}
      <div className="h-10 px-space-lg flex items-center justify-between bg-surface-container-low shadow-sm shrink-0 select-none">
        <div className="flex items-center gap-space-sm min-w-0">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-tertiary opacity-75">
            </span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-tertiary">
            </span>
          </span>
          <span className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant font-semibold">
            会话执行 Session #4092
          </span>
          <span className="text-outline-variant font-code-sm text-code-sm">
            /
          </span>
          <span className="font-headline-sm text-headline-sm text-on-surface truncate">
            Fix auth token race condition
          </span>
          <span className="px-1.5 py-0.5 rounded bg-surface-container-high text-on-surface-variant font-code-sm text-code-sm">
            Claude 3.5 Sonnet
          </span>
        </div>
        <div className="flex items-center gap-space-xs">
          <div className="flex items-center gap-1.5 px-space-sm py-1 rounded bg-surface-container text-on-surface-variant font-code-sm text-code-sm">
            <span className="material-symbols-outlined text-[14px] text-tertiary">
              memory
            </span>
            <span>
              8.4k Context
            </span>
          </div>
          <button className="h-7 w-7 rounded bg-surface-container hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface flex items-center justify-center transition-colors" title="展开至全屏" type="button">
            <span className="material-symbols-outlined text-[15px]">
              fullscreen
            </span>
          </button>
        </div>
      </div>
      {/* Scrollable Dialogue & Execution Canvas */}
      <div className="flex-1 overflow-y-auto px-space-xl py-space-lg flex flex-col gap-space-lg">
        {/* User Intent Block */}
        <div className="flex items-start gap-space-md max-w-3xl">
          <div className="w-8 h-8 rounded-full bg-surface-container-highest flex items-center justify-center shrink-0 shadow-md">
            <span className="material-symbols-outlined text-[16px] text-on-surface">
              person
            </span>
          </div>
          <div className="flex flex-col gap-space-xs flex-1">
            <div className="flex items-center gap-space-sm">
              <span className="font-label-sm text-label-sm text-on-surface font-semibold">
                Lead Architect
              </span>
              <span className="font-code-sm text-code-sm text-outline">
                14:28:05
              </span>
            </div>
            <div className="p-space-md rounded-xl bg-surface-container text-on-surface font-body-md text-body-md shadow-sm">
              修复鉴权 Token 并发刷新时的竞态死锁问题，确保多个异步请求等待同一刷新 Promise。
            </div>
          </div>
        </div>
        {/* Pi Agent Autonomous Execution Stream */}
        <div className="flex items-start gap-space-md max-w-3xl">
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shrink-0 shadow-lg shadow-primary/20">
            <img alt="Pi" className="h-4 w-4 object-contain brightness-0 invert" src={logo} />
          </div>
          <div className="flex flex-col gap-space-md flex-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-space-sm">
                <span className="font-label-sm text-label-sm text-primary font-semibold">
                  Pi Autonomous Agent
                </span>
                <span className="px-2 py-0.5 rounded-full bg-surface-container-high text-tertiary font-code-sm text-code-sm flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-tertiary">
                  </span>
                  执行已收敛 (Done)
                </span>
              </div>
              <span className="font-code-sm text-code-sm text-outline">
                用时 1.84s · 3 个文件修改
              </span>
            </div>
            {/* Agent Synthesis Card */}
            <div className="p-space-lg rounded-xl bg-surface-container text-on-surface shadow-md flex flex-col gap-space-md">
              <p className="font-body-md text-body-md text-on-surface leading-relaxed">
                已修复并发鉴权竞态。通过在
                <code className="px-1.5 py-0.5 rounded bg-surface-container-highest text-secondary font-code-sm text-code-sm">
                  TokenManager
                </code>
                 中引入 Singleton In-flight Refresh Promise 锁，避免了重复发送 
                <code className="px-1.5 py-0.5 rounded bg-surface-container-highest text-secondary font-code-sm text-code-sm">
                  refresh_token
                </code>
                请求导致的服务端 401 撤销。
              </p>
              {/* Diagnostic Telemetry Metric Card */}
              <div className="grid grid-cols-3 gap-space-sm pt-space-xs">
                <div className="p-space-sm rounded bg-surface-container-low flex flex-col">
                  <span className="font-label-xs text-label-xs text-outline uppercase">
                    并发测试请求
                  </span>
                  <span className="font-headline-sm text-headline-sm text-on-surface mt-0.5">
                    50 并发
                  </span>
                  <span className="font-code-sm text-code-sm text-tertiary mt-1">
                    ✓ 无 401 报错
                  </span>
                </div>
                <div className="p-space-sm rounded bg-surface-container-low flex flex-col">
                  <span className="font-label-xs text-label-xs text-outline uppercase">
                    刷新调用频次
                  </span>
                  <span className="font-headline-sm text-headline-sm text-on-surface mt-0.5">
                    1 次网络 IO
                  </span>
                  <span className="font-code-sm text-code-sm text-secondary mt-1">
                    49 次共享复用
                  </span>
                </div>
                <div className="p-space-sm rounded bg-surface-container-low flex flex-col">
                  <span className="font-label-xs text-label-xs text-outline uppercase">
                    回归测试套件
                  </span>
                  <span className="font-headline-sm text-headline-sm text-tertiary mt-0.5">
                    18 Passed
                  </span>
                  <span className="font-code-sm text-code-sm text-outline mt-1">
                    0 Regressions
                  </span>
                </div>
              </div>
              {/* Executed Toolchain Steps */}
              <div className="flex flex-col gap-1.5 pt-space-xs">
                <div className="flex items-center gap-space-sm text-on-surface-variant font-code-sm text-code-sm">
                  <span className="material-symbols-outlined text-[15px] text-tertiary">
                    check_circle
                  </span>
                  <span>
                    AST 依赖分析：确认所有出口点均绑定 interceptor Promise 排队队列
                  </span>
                </div>
                <div className="flex items-center gap-space-sm text-on-surface-variant font-code-sm text-code-sm">
                  <span className="material-symbols-outlined text-[15px] text-tertiary">
                    check_circle
                  </span>
                  <span>
                    单元测试构建：新增 
                    <span className="text-on-surface">
                      tests/auth_race.test.ts
                    </span>
                     模拟 50 个高并发下游调用
                  </span>
                </div>
              </div>
            </div>
            {/* Agent Action Handoff Strip */}
            <div className="flex items-center justify-between p-space-sm px-space-md rounded-lg bg-surface-container-low">
              <div className="flex items-center gap-space-sm">
                <span className="material-symbols-outlined text-[18px] text-primary">
                  rate_review
                </span>
                <span className="font-body-sm text-body-sm text-on-surface-variant">
                  补丁已生成，并在右侧控制台处于等待检视与暂存状态。
                </span>
              </div>
              <button className="h-7 px-space-sm rounded bg-surface-container-high hover:bg-surface-bright text-on-surface font-label-sm text-label-sm flex items-center gap-1 transition-colors" type="button">
                <span>
                  聚焦 Diff
                </span>
                <span className="material-symbols-outlined text-[14px]">
                  arrow_forward
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
      {/* Docked Bottom Composer */}
      <div className="p-space-md bg-surface-container-low shadow-lg shrink-0">
        <div className="max-w-4xl mx-auto flex flex-col gap-space-xs bg-surface-container rounded-xl p-space-sm shadow-inner">
          <div className="flex items-center justify-between px-space-xs">
            <div className="flex items-center gap-space-xs">
              <button className="h-6 px-2 rounded bg-surface-container-high hover:bg-surface-bright text-on-surface font-label-xs text-label-xs flex items-center gap-1 transition-colors" type="button">
                <span className="material-symbols-outlined text-[13px] text-secondary">
                  tune
                </span>
                <span>
                  Claude 3.5 Sonnet (高推理)
                </span>
                <span className="material-symbols-outlined text-[12px] text-outline">
                  expand_more
                </span>
              </button>
              <button className="h-6 px-2 rounded hover:bg-surface-container-high text-on-surface-variant font-label-xs text-label-xs flex items-center gap-1 transition-colors" type="button">
                <span className="material-symbols-outlined text-[13px]">
                  code_blocks
                </span>
                <span>
                  引用符号 (@)
                </span>
              </button>
            </div>
            <span className="font-code-sm text-code-sm text-outline">
              ⌘ + ↵ 发送
            </span>
          </div>
          <div className="flex items-center gap-space-sm px-space-xs">
            <input className="w-full bg-transparent text-on-surface placeholder-outline font-body-md text-body-md focus:outline-none py-1.5" placeholder="指示 Pi 继续调整鉴权机制或执行端到端测试..." type="text" />
            <button className="h-8 w-8 rounded-lg bg-primary text-on-primary hover:bg-primary-container hover:text-on-primary-container flex items-center justify-center shrink-0 transition-colors shadow-sm" type="button">
              <span className="material-symbols-outlined text-[17px]">
                arrow_upward
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
    {/* Right Unified Diff Review Panel (380px fixed width, surgical workbench style) */}
    <div className="w-[380px] shrink-0 bg-surface-container-lowest flex flex-col h-full shadow-2xl z-10">
      {/* Diff Review Toolbar — pane tabs live in TitleBar beside window controls */}
      <div className="px-space-md py-space-sm bg-surface-container-low flex flex-col gap-space-xs shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-space-xs">
            <span className="font-label-xs text-label-xs uppercase font-semibold tracking-wider text-outline">
              当前变更文件
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <button className="h-6 px-2 rounded bg-surface-container hover:bg-surface-container-high text-on-surface font-label-xs text-label-xs flex items-center gap-1 transition-colors" title="暂存所有变更" type="button">
              <span className="material-symbols-outlined text-[13px] text-tertiary">
                done_all
              </span>
              <span>
                暂存全部
              </span>
            </button>
            <button className="h-6 px-2 rounded bg-surface-container hover:bg-error-container text-on-surface hover:text-on-error-container font-label-xs text-label-xs flex items-center gap-1 transition-colors" title="还原所有改动" type="button">
              <span className="material-symbols-outlined text-[13px]">
                replay
              </span>
              <span>
                还原
              </span>
            </button>
          </div>
        </div>
        {/* File Selector Dropdown with Diff Badges */}
        <div className="flex items-center justify-between p-space-xs px-space-sm rounded bg-surface-container text-on-surface font-code-sm text-code-sm cursor-pointer hover:bg-surface-container-high transition-colors">
          <div className="flex items-center gap-1.5 truncate">
            <span className="material-symbols-outlined text-[15px] text-secondary">
              description
            </span>
            <span className="truncate text-on-surface font-medium">
              src/auth/token_manager.ts
            </span>
          </div>
          <div className="flex items-center gap-1 shrink-0 ml-2">
            <span className="px-1 py-0.2 rounded bg-tertiary-container/30 text-tertiary font-code-sm text-[11px] font-semibold">
              +28
            </span>
            <span className="px-1 py-0.2 rounded bg-error-container/40 text-error font-code-sm text-[11px] font-semibold">
              -12
            </span>
            <span className="material-symbols-outlined text-[14px] text-outline">
              unfold_more
            </span>
          </div>
        </div>
      </div>
      {/* Changed Files Compact Matrix */}
      <div className="px-space-md py-space-xs bg-surface-container-lowest flex flex-col gap-0.5 shrink-0 select-none">
        <div className="flex items-center justify-between py-1 px-space-xs rounded bg-surface-container-high text-on-surface font-code-sm text-code-sm group cursor-pointer">
          <div className="flex items-center gap-space-xs truncate">
            <input checked={true} className="rounded accent-primary w-3.5 h-3.5 cursor-pointer" type="checkbox" />
            <span className="truncate font-medium text-on-surface">
              src/auth/token_manager.ts
            </span>
          </div>
          <span className="text-tertiary shrink-0 text-[11px] font-code-sm font-semibold">
            +28 -12
          </span>
        </div>
        <div className="flex items-center justify-between py-1 px-space-xs rounded hover:bg-surface-container text-on-surface-variant hover:text-on-surface font-code-sm text-code-sm group cursor-pointer transition-colors">
          <div className="flex items-center gap-space-xs truncate">
            <input checked={true} className="rounded accent-primary w-3.5 h-3.5 cursor-pointer" type="checkbox" />
            <span className="truncate">
              src/auth/interceptor.ts
            </span>
          </div>
          <span className="text-tertiary shrink-0 text-[11px] font-code-sm">
            +6 -2
          </span>
        </div>
        <div className="flex items-center justify-between py-1 px-space-xs rounded hover:bg-surface-container text-on-surface-variant hover:text-on-surface font-code-sm text-code-sm group cursor-pointer transition-colors">
          <div className="flex items-center gap-space-xs truncate">
            <input className="rounded accent-primary w-3.5 h-3.5 cursor-pointer" type="checkbox" />
            <span className="truncate text-outline">
              tests/auth_race.test.ts
            </span>
          </div>
          <span className="text-tertiary shrink-0 text-[11px] font-code-sm">
            +45 -0
          </span>
        </div>
      </div>
      {/* Unified Diff Viewer (High precision micro-mechanical code viewer) */}
      <div className="flex-1 overflow-y-auto bg-surface font-code-sm text-code-sm flex flex-col select-text">
        <div className="flex items-center px-space-md py-1 bg-surface-container text-outline text-[11px] tracking-wider uppercase font-semibold shrink-0">
          <span>
            Hunk @@ -42,8 +42,12 @@ TokenManager
          </span>
        </div>
        {/* Line 42: Context */}
        <div className="flex items-center hover:bg-surface-container-low transition-colors leading-5 py-0.5">
          <div className="w-9 px-1 text-right text-outline select-none shrink-0 font-mono text-[11px]">
            42
          </div>
          <div className="w-4 text-center text-outline select-none shrink-0">
             
          </div>
          <div className="px-1 text-on-surface-variant font-code-sm whitespace-pre">
            {"  async getValidToken(): Promise<string> {"}
          </div>
        </div>
        {/* Line 43: Context */}
        <div className="flex items-center hover:bg-surface-container-low transition-colors leading-5 py-0.5">
          <div className="w-9 px-1 text-right text-outline select-none shrink-0 font-mono text-[11px]">
            43
          </div>
          <div className="w-4 text-center text-outline select-none shrink-0">
             
          </div>
          <div className="px-1 text-on-surface-variant font-code-sm whitespace-pre">
            {"    if (this.isExpired()) {"}
          </div>
        </div>
        {/* Line 44: Deletion (Red Line) */}
        <div className="flex items-center bg-error-container/20 text-on-error-container hover:bg-error-container/30 transition-colors leading-5 py-0.5">
          <div className="w-9 px-1 text-right text-error select-none shrink-0 font-mono text-[11px]">
            44
          </div>
          <div className="w-4 text-center text-error select-none shrink-0 font-bold">
            -
          </div>
          <div className="px-1 text-error font-code-sm whitespace-pre">
            {"      return await this.refreshTokenDirectly();"}
          </div>
        </div>
        {/* Line 44+: Addition (Green Line) */}
        <div className="flex items-center bg-tertiary-container/15 text-tertiary hover:bg-tertiary-container/25 transition-colors leading-5 py-0.5">
          <div className="w-9 px-1 text-right text-tertiary select-none shrink-0 font-mono text-[11px]">
            44
          </div>
          <div className="w-4 text-center text-tertiary select-none shrink-0 font-bold">
            +
          </div>
          <div className="px-1 text-tertiary font-code-sm whitespace-pre">
            {"      if (!this.refreshPromise) {"}
          </div>
        </div>
        {/* Line 45+: Addition (Green Line) */}
        <div className="flex items-center bg-tertiary-container/15 text-tertiary hover:bg-tertiary-container/25 transition-colors leading-5 py-0.5">
          <div className="w-9 px-1 text-right text-tertiary select-none shrink-0 font-mono text-[11px]">
            45
          </div>
          <div className="w-4 text-center text-tertiary select-none shrink-0 font-bold">
            +
          </div>
          <div className="px-1 text-tertiary font-code-sm whitespace-pre">
            {"        this.refreshPromise = this.refreshTokenDirectly()"}
          </div>
        </div>
        {/* Line 46+: Addition (Green Line) */}
        <div className="flex items-center bg-tertiary-container/15 text-tertiary hover:bg-tertiary-container/25 transition-colors leading-5 py-0.5">
          <div className="w-9 px-1 text-right text-tertiary select-none shrink-0 font-mono text-[11px]">
            46
          </div>
          <div className="w-4 text-center text-tertiary select-none shrink-0 font-bold">
            +
          </div>
          <div className="px-1 text-tertiary font-code-sm whitespace-pre">
            {"          .finally(() => { this.refreshPromise = null; });"}
          </div>
        </div>
        {/* Line 47+: Addition (Green Line) */}
        <div className="flex items-center bg-tertiary-container/15 text-tertiary hover:bg-tertiary-container/25 transition-colors leading-5 py-0.5">
          <div className="w-9 px-1 text-right text-tertiary select-none shrink-0 font-mono text-[11px]">
            47
          </div>
          <div className="w-4 text-center text-tertiary select-none shrink-0 font-bold">
            +
          </div>
          <div className="px-1 text-tertiary font-code-sm whitespace-pre">
            {"      }"}
          </div>
        </div>
        {/* Line 48+: Addition (Green Line) */}
        <div className="flex items-center bg-tertiary-container/15 text-tertiary hover:bg-tertiary-container/25 transition-colors leading-5 py-0.5">
          <div className="w-9 px-1 text-right text-tertiary select-none shrink-0 font-mono text-[11px]">
            48
          </div>
          <div className="w-4 text-center text-tertiary select-none shrink-0 font-bold">
            +
          </div>
          <div className="px-1 text-tertiary font-code-sm whitespace-pre">
            {"      return await this.refreshPromise;"}
          </div>
        </div>
        {/* Line 48 (Old Line 45): Context */}
        <div className="flex items-center hover:bg-surface-container-low transition-colors leading-5 py-0.5">
          <div className="w-9 px-1 text-right text-outline select-none shrink-0 font-mono text-[11px]">
            49
          </div>
          <div className="w-4 text-center text-outline select-none shrink-0">
             
          </div>
          <div className="px-1 text-on-surface-variant font-code-sm whitespace-pre">
            {"    }"}
          </div>
        </div>
        {/* Line 49 (Old Line 46): Context */}
        <div className="flex items-center hover:bg-surface-container-low transition-colors leading-5 py-0.5">
          <div className="w-9 px-1 text-right text-outline select-none shrink-0 font-mono text-[11px]">
            50
          </div>
          <div className="w-4 text-center text-outline select-none shrink-0">
             
          </div>
          <div className="px-1 text-on-surface-variant font-code-sm whitespace-pre">
            {"    return this.cachedToken;"}
          </div>
        </div>
        {/* Diff End Scrim */}
        <div className="flex items-center px-space-md py-space-sm text-outline text-[11px] gap-2 mt-auto bg-surface-container-lowest">
          <span className="material-symbols-outlined text-[13px] text-tertiary">
            check
          </span>
          <span>
            当前审查文件已比对完成 (无后续冲突)
          </span>
        </div>
      </div>
      {/* Diff Panel Bottom Footer & Git Workflow Actions */}
      <div className="p-space-md bg-surface-container-low shadow-xl flex flex-col gap-space-sm shrink-0">
        <div className="flex flex-col gap-1">
          <label className="font-label-xs text-label-xs uppercase tracking-wider text-outline font-semibold">
            提交说明 Commit Message
          </label>
          <div className="relative">
            <input className="w-full bg-surface-container px-space-sm py-1.5 rounded font-code-sm text-code-sm text-on-surface focus:outline-none focus:bg-surface-container-high transition-colors" type="text" value="fix(auth): prevent concurrent token refresh race condition" />
          </div>
        </div>
        <div className="flex flex-col gap-space-xs pt-1">
          <button className="w-full h-8 rounded bg-[#6366f1] hover:bg-[#4f46e5] text-white font-label-sm text-label-sm font-medium flex items-center justify-center gap-1.5 shadow-md transition-all active:scale-[0.99]" type="button">
            <span className="material-symbols-outlined text-[15px]">
              publish
            </span>
            <span>
              提交到分支 (Commit &amp; Push)
            </span>
          </button>
          <button className="w-full h-7 rounded bg-surface-container hover:bg-surface-container-high text-on-surface font-label-sm text-label-sm flex items-center justify-center gap-1.5 transition-colors" type="button">
            <span className="material-symbols-outlined text-[14px] text-secondary">
              merge_type
            </span>
            <span>
              创建 PR (Create Pull Request)
            </span>
          </button>
        </div>
      </div>
    </div>
  </div>
  );
}
