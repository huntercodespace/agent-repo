import { useMemo, useState } from "react";
import { refreshEnv, useCredentialBoard } from "../credentials/board";
import { CredentialCard } from "./CredentialCard";

export function CredentialsPage() {
  const board = useCredentialBoard();
  const flashModelId = board.providers.find((provider) => provider.id === "deepseek")?.flashModelId ?? null;
  const [query, setQuery] = useState("");
  const [detecting, setDetecting] = useState(false);
  const [detectNote, setDetectNote] = useState<string | null>(null);

  const counts = useMemo(() => {
    let stored = 0;
    let env = 0;
    let oauth = 0;
    let pending = 0;
    for (const provider of board.providers) {
      const status = board.statuses[provider.id]?.status;
      if (status === "stored") stored += 1;
      else if (status === "environment") env += 1;
      else if (status === "oauth") oauth += 1;
      else pending += 1;
    }
    return { stored, env, oauth, pending };
  }, [board.providers, board.statuses]);

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const rows = board.providers.filter((provider) => {
      if (!needle) return true;
      const haystack = [
        provider.name,
        provider.id,
        provider.authFlow,
        ...provider.models.map((model) => `${model.id} ${model.name}`),
      ].join(" ").toLowerCase();
      return haystack.includes(needle);
    });
    return rows.sort((a, b) => {
      const rank = (id: string) => (board.statuses[id]?.configured ? 0 : 1);
      const byState = rank(a.id) - rank(b.id);
      if (byState !== 0) return byState;
      return a.name.localeCompare(b.name);
    });
  }, [board.providers, board.statuses, query]);

  async function onDetect() {
    setDetecting(true);
    setDetectNote(null);
    try {
      const hits = await refreshEnv();
      const found = hits.filter((hit) => hit.envVars.length > 0);
      setDetectNote(found.length === 0
        ? "没有检测到已设置的环境变量。"
        : `已检测到 ${found.length} 个服务商的环境变量名。`);
    } catch (error) {
      setDetectNote(error instanceof Error ? error.message : "检测失败");
    } finally {
      setDetecting(false);
    }
  }

  return (
    <div className="flex h-full min-h-0 w-full bg-pi-bg text-pi-text">
      <nav aria-label="偏好设置导航" className="w-[230px] border-r border-pi-border bg-pi-bg flex flex-col justify-between flex-shrink-0 p-3 select-none">
        <div>
          <div className="px-2 py-1.5 mb-2">
            <div className="text-[10px] font-semibold tracking-wider text-pi-muted uppercase">偏好设置 DOMAINS</div>
            <div className="text-xs text-white font-medium mt-0.5">工作区环境配置</div>
          </div>
          <div className="space-y-1">
            <a href="#/settings" className="w-full flex items-center px-2.5 py-2 rounded text-pi-muted hover:bg-pi-card hover:text-pi-text text-xs">外观与主题 Appearance</a>
            <div className="w-full flex items-center justify-between px-2.5 py-2 rounded bg-pi-card border-l-2 border-pi-accent text-white">
              <div>
                <div className="text-xs font-semibold">模型凭据 Credentials</div>
                <div className="text-[10px] text-pi-accent">API Keys, OAuth, Env</div>
              </div>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-pi-accent/20 text-pi-accent font-semibold">
                {board.providers.length || "…"}
              </span>
            </div>
          </div>
        </div>
      </nav>
      <main className="flex-1 bg-pi-bg overflow-y-auto p-6 flex flex-col justify-between">
        <div className="space-y-5 max-w-[940px] mx-auto w-full">
          <div className="flex items-start justify-between border-b border-pi-border pb-4 gap-4">
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-base font-semibold text-white tracking-tight">模型凭据 Model Credentials</h1>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  pi-ai 注册表
                </span>
              </div>
              <p className="text-pi-muted text-xs mt-1.5 leading-relaxed max-w-2xl">
                服务商和模型来自 ModelRegistry / pi-ai，不是写死的厂商表。密钥经主进程 AuthStorage.modify 写入。DeepSeek 的 provider id 是 deepseek。保存 API Key 后 set_model 使用注册表解析出的 Flash{flashModelId ? `（deepseek/${flashModelId}）` : ""}。
              </p>
            </div>
            <button
              type="button"
              className="px-2.5 py-1.5 rounded bg-pi-card hover:bg-pi-cardHover border border-pi-border text-pi-muted hover:text-white text-xs font-mono shrink-0"
              onClick={() => void onDetect()}
              disabled={detecting || !board.available}
            >
              {detecting ? "检测中…" : "重新检测 ENV"}
            </button>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 rounded-lg bg-pi-card border border-pi-border">
              <div className="text-[10px] uppercase font-mono text-pi-muted">活跃服务商总计</div>
              <div className="text-sm font-semibold text-white mt-0.5">{board.providers.length} 家 Provider</div>
            </div>
            <div className="p-3 rounded-lg bg-pi-card border border-pi-border">
              <div className="text-[10px] uppercase font-mono text-pi-muted">来源分布</div>
              <div className="text-[11px] font-mono text-white mt-0.5">
                <span className="text-pi-accent">{counts.stored} 本地</span>
                {" · "}
                <span className="text-cyan-400">{counts.env} ENV</span>
                {" · "}
                <span className="text-emerald-400">{counts.oauth} OAuth</span>
                {" · "}
                <span className="text-amber-400">{counts.pending} 待配</span>
              </div>
            </div>
            <div className="p-3 rounded-lg bg-pi-card border border-pi-border">
              <div className="text-[10px] uppercase font-mono text-pi-muted">安全防护机制</div>
              <div className="text-[11px] font-mono text-emerald-400 mt-0.5">零明文 · 主进程 AuthStorage</div>
            </div>
          </div>

          <input
            className="w-full bg-[#0d1017] border border-pi-border rounded px-3 py-1.5 text-xs text-pi-text font-mono focus:border-pi-accent focus:outline-none"
            placeholder="搜索服务商或模型，例如 DeepSeek V4 Flash"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
          {detectNote ? <p className="text-[11px] font-mono text-pi-muted">{detectNote}</p> : null}
          {board.modelNote ? <p className="text-[11px] font-mono text-amber-300">{board.modelNote}</p> : null}
          {board.loadError ? <p className="text-[11px] text-rose-300">{board.loadError}</p> : null}
          {!board.loaded ? <p className="text-xs text-pi-muted">正在读取 pi-ai 服务商…</p> : null}
          {board.loaded && !board.available ? (
            <p className="text-xs text-pi-muted">
              凭据写入只在 Electron 窗口里进行。运行 <span className="font-mono">npm run dev</span> 后打开桌面壳，再在这里保存密钥。
            </p>
          ) : null}

          <div className="grid grid-cols-2 gap-3.5">
            {visible.map((provider) => (
              <CredentialCard
                key={provider.id}
                provider={provider}
                status={board.statuses[provider.id]}
                oauth={board.oauth[provider.id]}
              />
            ))}
          </div>

          <section aria-labelledby="security-rules-title" className="rounded-lg bg-pi-card/90 border border-pi-border p-4" data-purpose="credential-security-guarantees">
            <div className="flex items-center gap-2 mb-2.5">
              <h2 className="text-xs font-semibold text-white tracking-tight" id="security-rules-title">
                安全与凭据隔离规范 (Credential Security Guarantees)
              </h2>
              <span className="text-[10px] font-mono text-pi-muted">AuthStorage / Strict Local Bound</span>
            </div>
            <div className="grid grid-cols-3 gap-3 pt-1 text-xs">
              <div className="p-2.5 rounded bg-pi-surface/80 border border-pi-border/80 space-y-1">
                <div className="font-semibold text-white text-[11px]">零明文原则</div>
                <p className="text-[10px] text-pi-muted leading-relaxed">
                  保存之后界面只留掩码。回包是 mask、source、status，不带回 API Key。
                </p>
              </div>
              <div className="p-2.5 rounded bg-pi-surface/80 border border-pi-border/80 space-y-1">
                <div className="font-semibold text-white text-[11px]">明确三元来源</div>
                <p className="text-[10px] text-pi-muted leading-relaxed">
                  来源是本地 AuthStorage、环境变量（findEnvKeys）或 OAuth。密钥不写入 settings.json。
                </p>
              </div>
              <div className="p-2.5 rounded bg-pi-surface/80 border border-pi-border/80 space-y-1">
                <div className="font-semibold text-white text-[11px]">即时生效</div>
                <p className="text-[10px] text-pi-muted leading-relaxed">
                  校验通过后卡片变为已保存，工作区凭据门闩随之清除，不必重启窗口。
                </p>
              </div>
            </div>
          </section>
        </div>
        <div className="pt-4 border-t border-pi-border flex items-center justify-between mt-4">
          <div className="text-[11px] font-mono text-pi-muted">
            保存写入 ~/.pi/agent/auth.json 后，工作区会收到 credentials:status。
          </div>
        </div>
      </main>
    </div>
  );
}
