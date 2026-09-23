import { useEffect, useState } from "react";
import { beginOAuth, clearProviderKey, endOAuth, modelChoiceLabel, saveProviderKey } from "../credentials/board";
import type { OAuthEvent, ProviderInfo, ProviderStatus } from "../credentials/types";

interface CredentialCardProps {
  provider: ProviderInfo;
  status: ProviderStatus | undefined;
  oauth: OAuthEvent | undefined;
}

function badge(status: ProviderStatus | undefined, saving: boolean, failed: boolean) {
  if (saving) return { label: "验证与保存中", tone: "accent" as const };
  if (failed) return { label: "保存失败请重试", tone: "rose" as const };
  if (status?.status === "oauth") return { label: "OAuth 已登录", tone: "ok" as const };
  if (status?.status === "environment") return { label: "来自环境变量", tone: "cyan" as const };
  if (status?.status === "stored") return { label: "来自本地", tone: "ok" as const };
  return { label: "未配置", tone: "amber" as const };
}

const toneClass = {
  accent: "bg-pi-accent/15 border-pi-accent/40 text-pi-accent",
  rose: "bg-rose-500/15 border-rose-500/40 text-rose-300",
  ok: "bg-emerald-500/15 border-emerald-500/40 text-emerald-300",
  cyan: "bg-cyan-500/15 border-cyan-500/40 text-cyan-300",
  amber: "bg-amber-500/10 border-amber-500/30 text-amber-300",
};

function subtitle(provider: ProviderInfo) {
  const flash = provider.models.find((model) => model.id === "deepseek-flash");
  if (flash) return `${modelChoiceLabel(provider.id, flash.id, flash.name)} · ${flash.id}`;
  const names = provider.models.slice(0, 2).map((model) => model.name);
  if (names.length === 0) return provider.id;
  const extra = provider.models.length > 2 ? ` · +${provider.models.length - 2}` : "";
  return `${names.join(" / ")}${extra}`;
}

export function CredentialCard({ provider, status, oauth }: CredentialCardProps) {
  const [draft, setDraft] = useState("");
  const [saving, setSaving] = useState(false);
  const [failed, setFailed] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [oauthBusy, setOauthBusy] = useState(false);

  useEffect(() => {
    if (status?.status === "stored" || status?.status === "oauth") {
      setDraft("");
      setFailed(false);
      setError(null);
      setSaving(false);
      setEditing(false);
    }
  }, [status?.status, status?.mask]);

  const state = badge(status, saving || oauthBusy, failed);
  const showInput = provider.apiKey && !provider.multiStep && (
    editing || failed || (status?.status !== "stored" && status?.status !== "environment" && status?.status !== "oauth")
  );
  const border = saving || oauthBusy
    ? "border-pi-accent/50 glow-subtle"
    : failed
      ? "border-rose-500/40"
      : "border-pi-border hover:border-pi-borderLight";

  async function onSave() {
    setSaving(true);
    setFailed(false);
    setError(null);
    try {
      const result = await saveProviderKey(provider.id, draft);
      if (result.status === "error") {
        setFailed(true);
        setError(result.message || "保存失败，请重试");
      } else {
        setDraft("");
        setFailed(false);
        setError(null);
        setEditing(false);
      }
    } catch (cause) {
      setFailed(true);
      setError(cause instanceof Error ? cause.message : "保存失败，请重试");
    } finally {
      setSaving(false);
    }
  }

  async function onClear() {
    setSaving(true);
    try {
      await clearProviderKey(provider.id);
      setDraft("");
      setFailed(false);
      setError(null);
      setEditing(false);
    } finally {
      setSaving(false);
    }
  }

  async function onOAuth() {
    setOauthBusy(true);
    setFailed(false);
    setError(null);
    try {
      const result = await beginOAuth(provider.id);
      if (result.status === "error") {
        setFailed(true);
        setError(result.message || "OAuth 登录失败");
      }
    } catch (cause) {
      setFailed(true);
      setError(cause instanceof Error ? cause.message : "OAuth 登录失败");
    } finally {
      setOauthBusy(false);
    }
  }

  return (
    <div
      className={`p-4 rounded-lg bg-pi-card border ${border} flex flex-col justify-between transition-all`}
      data-purpose="credential-card"
      data-provider={provider.id}
      data-credential-status={failed ? "error" : saving || oauthBusy ? "saving" : status?.status || "unconfigured"}
    >
      <div>
        <div className="flex items-center justify-between mb-3 gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-7 h-7 rounded bg-pi-accent/10 border border-pi-accent/30 flex items-center justify-center text-pi-accent font-bold text-[10px] shrink-0">
              {provider.name.slice(0, 2).toUpperCase()}
            </div>
            <div className="min-w-0">
              <div className="text-xs font-semibold text-white truncate">{provider.name}</div>
              <div className="text-[10px] text-pi-muted font-mono truncate">{subtitle(provider)}</div>
            </div>
          </div>
          <span className={`px-2 py-0.5 rounded text-[10px] font-mono border shrink-0 ${toneClass[state.tone]}`}>
            {state.label}
          </span>
        </div>

        {provider.multiStep ? (
          <p className="text-[11px] text-pi-muted leading-relaxed">
            多步登录（authFlow: multi-step）这一页先不实现。Bedrock / Vertex / Cloudflare 这类需要选择配置方式或额外字段，卡片保持不可用。
          </p>
        ) : null}

        {status?.status === "stored" && !editing && !failed ? (
          <div className="space-y-1.5">
            <div className="text-[11px] font-mono text-pi-muted">当前指纹 (FINGERPRINT)</div>
            <div className="flex items-center justify-between bg-[#0d1017] border border-pi-border rounded px-3 py-1.5">
              <span className="font-mono text-xs text-emerald-400 tracking-wider">{status.mask}</span>
            </div>
            <p className="text-[10px] text-pi-muted font-mono">存储于本地 AuthStorage（~/.pi/agent/auth.json）</p>
          </div>
        ) : null}

        {status?.status === "environment" && !editing && !failed ? (
          <div className="space-y-1.5">
            <div className="text-[11px] font-mono text-pi-muted">环境变量键名 (SYSTEM ENV)</div>
            <div className="flex items-center justify-between bg-[#0d1017] border border-cyan-900/40 rounded px-3 py-1.5 input-disabled-stripes">
              <span className="font-mono text-xs text-cyan-300 tracking-wide">${status.mask}</span>
            </div>
            <p className="text-[10px] text-pi-muted leading-tight">检测到环境变量已生效。保存本地密钥会覆盖它。</p>
          </div>
        ) : null}

        {status?.status === "oauth" && !failed ? (
          <div className="space-y-1.5">
            <div className="flex items-center justify-between bg-[#0d1017] border border-pi-border rounded px-3 py-1.5">
              <span className="font-mono text-xs text-emerald-300">{status.mask}</span>
            </div>
            <p className="text-[10px] text-pi-muted">令牌只留在主进程 AuthStorage，界面不显示 access token。</p>
          </div>
        ) : null}

        {showInput && !provider.multiStep ? (
          <div className="space-y-2 mt-2">
            <label className="block text-[11px] text-pi-muted font-mono" htmlFor={`key-${provider.id}`}>
              API KEY
            </label>
            <input
              id={`key-${provider.id}`}
              className={`w-full bg-[#0d1017] border rounded px-3 py-1.5 text-xs text-pi-text font-mono focus:outline-none ${failed ? "border-rose-500/40" : "border-pi-border focus:border-pi-accent"}`}
              placeholder="只在保存时发到主进程"
              type="password"
              autoComplete="off"
              value={draft}
              disabled={saving}
              onChange={(event) => setDraft(event.target.value)}
            />
            <p className="text-[10px] text-pi-muted">密钥仅保存在本地 AuthStorage，不会进入渲染进程的回包。</p>
          </div>
        ) : null}

        {failed && error ? (
          <div className="mt-2 p-2 rounded bg-rose-950/40 border border-rose-800/40 text-rose-300 text-[11px]">
            <span className="font-semibold">保存失败，请重试：</span>
            <span className="font-mono text-[10px] block text-rose-300/80 mt-0.5">{error}</span>
          </div>
        ) : null}

        {oauth && (oauth.phase === "opened" || oauth.phase === "waiting" || oauth.phase === "error") ? (
          <p className="mt-2 text-[10px] font-mono text-pi-accent/90 break-all">
            {oauth.message}
            {oauth.userCode ? ` · ${oauth.userCode}` : ""}
            {oauth.url ? ` · ${oauth.url}` : ""}
          </p>
        ) : null}
      </div>

      <div className="mt-4 pt-3 border-t border-pi-border flex items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          {provider.oauth && !provider.multiStep ? (
            status?.status === "oauth" ? (
              <button type="button" className="text-[11px] text-rose-300 hover:text-rose-200" onClick={() => void endOAuth(provider.id)} disabled={oauthBusy}>
                退出登录 (Sign Out)
              </button>
            ) : (
              <button type="button" className="text-[11px] text-pi-accent hover:underline" onClick={() => void onOAuth()} disabled={oauthBusy || saving}>
                {provider.oauthOnly ? "OAuth 登录" : "使用 OAuth 登录"}
              </button>
            )
          ) : (
            <span className="text-[10px] text-pi-muted font-mono">{provider.id}</span>
          )}
          {status?.status === "stored" && !editing ? (
            <button type="button" className="text-[11px] text-rose-400/80 hover:text-rose-400 font-mono" onClick={() => void onClear()}>
              清除 (Clear)
            </button>
          ) : null}
        </div>
        <div className="flex items-center gap-2">
          {provider.apiKey && status?.status === "stored" && !editing && !failed ? (
            <button type="button" className="px-2.5 py-1 rounded bg-pi-card hover:bg-pi-cardHover border border-pi-border text-white text-[11px]" onClick={() => setEditing(true)}>
              更新密钥
            </button>
          ) : null}
          {provider.apiKey && status?.status === "environment" && !editing && !failed ? (
            <button type="button" className="px-2.5 py-1 rounded bg-pi-card hover:bg-pi-cardHover border border-pi-border text-white text-[11px]" onClick={() => setEditing(true)}>
              覆盖为本地密钥
            </button>
          ) : null}
          {showInput && !provider.multiStep ? (
            <button
              type="button"
              className="px-3 py-1 rounded bg-pi-accent hover:bg-pi-accentHover text-white text-[11px] font-medium disabled:opacity-50"
              disabled={saving || draft.trim() === ""}
              onClick={() => void onSave()}
            >
              {saving ? "正在校验密钥..." : failed ? "重试保存" : "保存密钥"}
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
