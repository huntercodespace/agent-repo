import { useEffect, useRef } from "react";
import { Composer } from "../components/Composer";
import { Icon } from "../components/Icon";
import { Inspector } from "../components/Inspector";
import { LiveTranscript } from "../components/LiveTranscript";
import { MessageStream } from "../components/MessageStream";
import { useRpc } from "../rpc/RpcProvider";

function basename(cwd: string) {
  const parts = cwd.split(/[\\/]/).filter(Boolean);
  return parts[parts.length - 1] || cwd;
}

export function WorkspacePage() {
  const rpc = useRpc();
  const { hydrated } = rpc;
  const scroller = useRef<HTMLDivElement>(null);
  const live = rpc.status.available;
  const readyLabel =
    !live ? "Agent Ready"
    : rpc.status.engine === "chatting" ? "对话中"
    : rpc.status.engine === "reconnecting" ? "重连中"
    : rpc.status.engine === "disconnected" ? "未连接"
    : "Agent Ready";
  const pid = live ? (rpc.status.pid ? String(rpc.status.pid) : "—") : "39420";
  const credentialGuide = live && hydrated && !rpc.status.credentials.configured
    ? "模型凭据未配置。API 密钥只留在主进程 AuthStorage（~/.pi/agent/auth.json）或环境变量里，不会进入这个窗口。"
    : null;
  const guide = credentialGuide
    || rpc.notice
    || (live && hydrated && rpc.status.engine === "disconnected" ? rpc.status.detail : null);

  useEffect(() => {
    const node = scroller.current;
    if (!node || rpc.blocks.length === 0) return;
    node.scrollTo({ top: node.scrollHeight });
  }, [rpc.blocks]);

  return (
    <main className="flex h-full min-h-0 w-full flex-col bg-surface lg:flex-row">
      <section className="flex min-h-0 min-w-0 flex-1 flex-col bg-surface">
        <div className="flex h-9 items-center justify-between bg-surface-container-low/60 px-space-lg backdrop-blur">
          <div className="flex items-center gap-space-sm font-code-sm text-code-sm">
            <span className="inline-flex items-center gap-1 text-secondary">
              <Icon name="terminal" className="text-[14px]" />
              <span title={live ? rpc.status.cwd : undefined}>
                {live ? `project://${basename(rpc.status.cwd)}` : "task://refactor-sse-parser"}
              </span>
            </span>
            <span className="text-outline">/</span>
            <span className="font-medium text-on-surface-variant">Session #0482</span>
            <span className="rounded bg-surface-container-high px-1.5 py-0.5 font-label-xs text-label-xs font-semibold uppercase tracking-wider text-tertiary">
              Active Run
            </span>
          </div>
          <div className="flex items-center gap-space-sm font-label-sm text-label-sm text-on-surface-variant">
            {live && rpc.status.credentials.configured ? (
              <span className="font-code-sm text-code-sm text-outline" title="主进程 AuthStorage，仅掩码">
                凭据 {rpc.status.credentials.providerId} · {rpc.status.credentials.mask}
              </span>
            ) : null}
            <span className="flex items-center gap-1">
              <span className={`h-1.5 w-1.5 rounded-full bg-tertiary ${rpc.status.engine === "disconnected" && live ? "" : "animate-pulse"}`} />
              {readyLabel}
            </span>
            <span className="text-outline">|</span>
            <span className="font-code-sm text-code-sm text-outline">PID: {pid}</span>
          </div>
        </div>
        <div ref={scroller} className="min-h-0 flex-1 overflow-y-auto">
          {live && rpc.blocks.length === 0 ? (
            <p className="mx-auto max-w-5xl px-space-lg pt-space-lg font-body-sm text-body-sm text-on-surface-variant">
              发送一条需求后，助手回复和工具输出会从 Pi RPC 流式出现在这里。
            </p>
          ) : null}
          {rpc.blocks.length > 0 ? <LiveTranscript blocks={rpc.blocks} /> : null}
          {rpc.blocks.length > 0 ? (
            <details className="mx-auto mb-space-lg max-w-5xl px-space-lg">
              <summary className="cursor-pointer font-label-sm text-label-sm text-outline">示例会话</summary>
              <MessageStream />
            </details>
          ) : (
            <MessageStream />
          )}
        </div>
        <Composer
          modelLabel={live ? rpc.status.modelLabel : null}
          busy={live && (rpc.status.engine === "chatting" || rpc.status.engine === "reconnecting")}
          guide={guide}
          onSend={(text) => rpc.sendPrompt(text)}
        />
      </section>
      <Inspector />
    </main>
  );
}
