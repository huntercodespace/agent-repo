function Mark({
  children,
  className,
}: {
  children: string;
  className: string;
}) {
  return (
    <span
      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg font-label-sm text-label-sm font-semibold ${className}`}
    >
      {children}
    </span>
  );
}

function Badge({ children, className }: { children: string; className: string }) {
  return (
    <span className={`rounded-full px-2 py-0.5 font-label-xs text-label-xs font-semibold ${className}`}>
      {children}
    </span>
  );
}

function Field({ value, placeholder }: { value?: string; placeholder?: string }) {
  return (
    <div className="flex h-9 items-center rounded-lg bg-surface-container-lowest px-space-sm font-code-sm text-code-sm">
      {value ? (
        <span className="truncate text-on-surface">{value}</span>
      ) : (
        <span className="truncate text-outline">{placeholder}</span>
      )}
    </div>
  );
}

export function CredentialsPage() {
  return (
    <div className="h-full overflow-y-auto bg-surface">
      <div className="flex items-end justify-between gap-space-md px-space-xl pb-space-md pt-space-lg">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-space-sm">
            <h1 className="font-headline-sm text-headline-sm font-semibold text-on-surface">模型凭据</h1>
            <span className="rounded bg-surface-container px-1.5 py-0.5 font-code-sm text-code-sm text-on-surface-variant">
              6 家 Provider
            </span>
          </div>
          <p className="font-body-sm text-body-sm text-on-surface-variant">
            六种静态状态：未配置、输入校验中、已保存到本地、来自环境变量、OAuth 已登录、保存失败可重试。密钥为占位符。
          </p>
        </div>
        <a
          href="#/settings"
          className="flex h-8 items-center rounded bg-surface-container px-space-md font-label-sm text-label-sm text-on-surface transition-colors hover:bg-surface-container-high"
        >
          返回偏好设置
        </a>
      </div>
      <div className="grid grid-cols-1 gap-space-md px-space-xl pb-space-xl lg:grid-cols-2 xl:grid-cols-3">
        <article className="flex flex-col gap-space-sm rounded-xl border border-outline-variant/40 bg-surface-container-low p-space-md">
          <header className="flex items-start justify-between gap-space-sm">
            <div className="flex items-center gap-space-sm">
              <Mark className="bg-[#c96442] text-white">A</Mark>
              <div className="flex flex-col">
                <span className="font-label-md text-label-md font-semibold text-on-surface">Anthropic</span>
                <span className="font-code-sm text-code-sm text-outline">Claude 3.7 Sonnet / Claude 3.5 Haiku</span>
              </div>
            </div>
            <Badge className="bg-surface-container-high text-on-surface-variant">未配置</Badge>
          </header>
          <span className="font-label-xs text-label-xs uppercase tracking-wider text-outline">API KEY 或 OAUTH TOKEN</span>
          <Field placeholder="sk-ant-api03-..." />
          <p className="font-code-sm text-code-sm text-outline">密钥仅保存在本地，永不离开此设备。</p>
          <div className="mt-auto flex items-center gap-space-xs pt-space-xs">
            <button
              type="button"
              className="h-8 flex-1 rounded bg-surface-container font-label-sm text-label-sm text-on-surface transition-colors hover:bg-surface-container-high"
            >
              使用 Claude OAuth 登录
            </button>
            <button
              type="button"
              className="h-8 flex-1 rounded bg-primary font-label-sm text-label-sm font-medium text-on-primary transition-colors hover:bg-primary-container"
            >
              保存密钥
            </button>
          </div>
        </article>

        <article className="flex flex-col gap-space-sm rounded-xl border border-secondary/40 bg-surface-container-low p-space-md">
          <header className="flex items-start justify-between gap-space-sm">
            <div className="flex items-center gap-space-sm">
              <Mark className="bg-[#5b4dff] text-white">OR</Mark>
              <div className="flex flex-col">
                <span className="font-label-md text-label-md font-semibold text-on-surface">OpenRouter</span>
                <span className="font-code-sm text-code-sm text-outline">Universal Multi-Model Gateway</span>
              </div>
            </div>
            <Badge className="bg-secondary-container/20 text-secondary">验证与保存中</Badge>
          </header>
          <span className="font-label-xs text-label-xs uppercase tracking-wider text-outline">API KEY</span>
          <Field value="••••••••••••••••••••" />
          <p className="font-code-sm text-code-sm text-secondary">
            正在向 api.openrouter.ai 发起低延迟握手校验与权限范围检查…
          </p>
          <div className="mt-auto flex items-center gap-space-xs pt-space-xs">
            <button
              type="button"
              className="h-8 flex-1 rounded bg-surface-container font-label-sm text-label-sm text-on-surface transition-colors hover:bg-surface-container-high"
            >
              取消
            </button>
            <button
              type="button"
              className="h-8 flex-1 cursor-default rounded bg-surface-container-high font-label-sm text-label-sm text-outline"
            >
              正在校验密钥…
            </button>
          </div>
        </article>

        <article className="flex flex-col gap-space-sm rounded-xl border border-tertiary/35 bg-surface-container-low p-space-md">
          <header className="flex items-start justify-between gap-space-sm">
            <div className="flex items-center gap-space-sm">
              <Mark className="bg-[#10a37f] text-white">OA</Mark>
              <div className="flex flex-col">
                <span className="font-label-md text-label-md font-semibold text-on-surface">OpenAI</span>
                <span className="font-code-sm text-code-sm text-outline">GPT-4o、GPT-4.5、o3-mini</span>
              </div>
            </div>
            <div className="flex flex-col items-end gap-1">
              <Badge className="bg-tertiary-container/25 text-tertiary">已保存</Badge>
              <Badge className="bg-surface-container-high text-on-surface-variant">完全本地</Badge>
            </div>
          </header>
          <div className="flex items-center justify-between font-label-xs text-label-xs uppercase tracking-wider text-outline">
            <span>当前指纹 FINGERPRINT</span>
            <span className="normal-case tracking-normal">更新于 3 天前</span>
          </div>
          <Field value="sk-••••••••••••9a7f" />
          <p className="font-code-sm text-code-sm text-outline">存储于系统 Keychain / 本地保险箱（AES-256）</p>
          <div className="mt-auto flex items-center gap-space-xs pt-space-xs">
            <button
              type="button"
              className="h-8 flex-1 rounded bg-surface-container font-label-sm text-label-sm text-on-surface transition-colors hover:bg-surface-container-high"
            >
              清除 (Clear)
            </button>
            <button
              type="button"
              className="h-8 flex-1 rounded bg-surface-container-high font-label-sm text-label-sm text-on-surface transition-colors hover:bg-surface-bright"
            >
              更新密钥
            </button>
          </div>
        </article>

        <article className="flex flex-col gap-space-sm rounded-xl border border-secondary/30 bg-surface-container-low p-space-md">
          <header className="flex items-start justify-between gap-space-sm">
            <div className="flex items-center gap-space-sm">
              <Mark className="bg-[#4285f4] text-white">G</Mark>
              <div className="flex flex-col">
                <span className="font-label-md text-label-md font-semibold text-on-surface">Google DeepMind</span>
                <span className="font-code-sm text-code-sm text-outline">Gemini 2.5 Pro / Flash 2.0</span>
              </div>
            </div>
            <Badge className="bg-secondary-container/20 text-secondary">来自环境变量</Badge>
          </header>
          <span className="font-label-xs text-label-xs uppercase tracking-wider text-outline">环境变量名 SYSTEM ENV</span>
          <Field value="$GEMINI_API_KEY (••••••••e3b1)" />
          <p className="font-code-sm text-code-sm text-outline">检测到环境变量已注入。如需覆盖，请写入本地密钥。</p>
          <div className="mt-auto flex items-center gap-space-xs pt-space-xs">
            <button
              type="button"
              className="h-8 flex-1 cursor-default rounded bg-surface-container font-label-sm text-label-sm text-outline"
            >
              只读模式 (SHELL ENV)
            </button>
            <button
              type="button"
              className="h-8 flex-1 rounded bg-surface-container-high font-label-sm text-label-sm text-on-surface transition-colors hover:bg-surface-bright"
            >
              覆盖为本地密钥
            </button>
          </div>
        </article>

        <article className="flex flex-col gap-space-sm rounded-xl border border-primary/30 bg-surface-container-low p-space-md">
          <header className="flex items-start justify-between gap-space-sm">
            <div className="flex items-center gap-space-sm">
              <Mark className="bg-[#6e40c9] text-white">GH</Mark>
              <div className="flex flex-col">
                <span className="font-label-md text-label-md font-semibold text-on-surface">GitHub Copilot / Codex</span>
                <span className="font-code-sm text-code-sm text-outline">Enterprise Auth Bridge</span>
              </div>
            </div>
            <Badge className="bg-primary/15 text-primary">OAuth 已登录</Badge>
          </header>
          <div className="flex items-center gap-space-sm rounded-lg bg-surface-container-lowest px-space-sm py-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#6e40c9] font-label-xs text-label-xs text-white">
              a
            </span>
            <div className="flex min-w-0 flex-col">
              <span className="truncate font-code-sm text-code-sm text-on-surface">alex.d••••@octocat.dev</span>
              <span className="font-code-sm text-code-sm text-outline">组织节点 Corp-Sandbox-Dev</span>
            </div>
          </div>
          <div className="flex items-center justify-between font-code-sm text-code-sm text-on-surface-variant">
            <span>Token 自动续期中</span>
            <span>有效期至 2025-04-12</span>
          </div>
        </article>

        <article className="flex flex-col gap-space-sm rounded-xl border border-error/70 bg-[#2a1618] p-space-md">
          <header className="flex items-start justify-between gap-space-sm">
            <div className="flex items-center gap-space-sm">
              <Mark className="bg-error-container text-error">DS</Mark>
              <div className="flex flex-col">
                <span className="font-label-md text-label-md font-semibold text-on-surface">自定义端点 DeepSeek / vLLM</span>
                <span className="font-code-sm text-code-sm text-outline">OpenAI-Compatible Gateway</span>
              </div>
            </div>
            <Badge className="bg-error-container text-error">校验失败</Badge>
          </header>
          <p className="font-label-sm text-label-sm font-semibold text-error">保存失败，请重试</p>
          <Field value="••••••••••••••••" />
          <p className="font-code-sm text-code-sm text-error">
            连接 https://api.deepseek.com/v1 超时（ETIMEDOUT 30000ms）。生产密钥未保存。
          </p>
          <div className="mt-auto pt-space-xs">
            <button
              type="button"
              className="h-8 w-full rounded bg-error-container font-label-sm text-label-sm font-medium text-on-error-container transition-colors hover:bg-error hover:text-on-error"
            >
              重试保存 (Retry)
            </button>
          </div>
        </article>
      </div>
    </div>
  );
}
