import { useState, type KeyboardEvent } from "react";
import { Icon } from "./Icon";

interface ComposerProps {
  modelLabel?: string | null;
  busy?: boolean;
  guide?: string | null;
  onSend?: (text: string) => void | boolean | Promise<void | boolean>;
}

export function Composer({ modelLabel, busy = false, guide, onSend }: ComposerProps) {
  const [text, setText] = useState("");
  const label = modelLabel || "Pi-Sonnet-3.5";

  async function send() {
    const trimmed = text.trim();
    if (!trimmed || busy || !onSend) return;
    const accepted = await onSend(trimmed);
    if (accepted !== false) setText("");
  }

  function onKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key !== "Enter" || event.shiftKey || event.nativeEvent.isComposing) return;
    event.preventDefault();
    send();
  }

  return (
    <div className="bg-surface p-space-md lg:p-space-lg">
      {guide ? (
        <div className="mx-auto mb-space-sm flex max-w-5xl flex-wrap items-center gap-space-sm rounded-lg bg-surface-container px-space-md py-space-sm font-body-sm text-body-sm text-on-surface">
          <span data-credential-gate="open">{guide}</span>
          <a href="#/credentials" className="font-medium text-primary hover:underline">
            打开凭据页
          </a>
        </div>
      ) : null}
      <div className="mx-auto flex max-w-5xl flex-col gap-space-md rounded-xl bg-surface-container-lowest p-space-md shadow-xl">
        <textarea
          className="w-full resize-none select-text bg-transparent font-body-md text-body-md text-on-surface outline-none placeholder:text-outline"
          placeholder="向 Pi 描述你的编码需求，支持输入 @ 引用文件或 # 关联 Issue..."
          rows={3}
          spellCheck={false}
          value={text}
          onChange={(event) => setText(event.target.value)}
          onKeyDown={onKeyDown}
        />
        <div className="flex flex-wrap items-center justify-between gap-space-sm pt-space-xs">
          <div className="flex flex-wrap items-center gap-space-xs">
            <button
              type="button"
              title="添加文件"
              className="flex h-8 w-8 items-center justify-center rounded bg-surface-container text-on-surface-variant transition-colors hover:bg-surface-container-high hover:text-on-surface"
            >
              <Icon name="attach_file" className="text-[18px]" />
            </button>
            <button
              type="button"
              className="flex h-8 items-center gap-1 rounded bg-surface-container px-space-sm font-label-sm text-label-sm text-on-surface transition-colors hover:bg-surface-container-high"
            >
              <Icon name="model_training" className="text-[15px] text-primary" />
              <span>{label}</span>
              <Icon name="expand_more" className="text-[14px] text-outline" />
            </button>
            <button
              type="button"
              className="flex h-8 items-center gap-1 rounded bg-surface-container px-space-sm font-label-sm text-label-sm text-on-surface transition-colors hover:bg-surface-container-high"
            >
              <Icon name="psychology" className="text-[15px] text-secondary" />
              <span>深入思考 High</span>
              <Icon name="expand_more" className="text-[14px] text-outline" />
            </button>
            <button
              type="button"
              className="flex h-8 items-center gap-1 rounded bg-surface-container px-space-sm font-label-sm text-label-sm text-tertiary transition-colors hover:bg-surface-container-high"
            >
              <Icon name="security" className="text-[15px]" />
              <span className="text-on-surface">沙盒读写 (安全模式)</span>
              <Icon name="expand_more" className="text-[14px] text-outline" />
            </button>
          </div>
          <div className="ml-auto flex items-center gap-space-md">
            <span className="font-code-sm text-code-sm text-outline">42 / 128k</span>
            <button
              type="button"
              disabled={busy}
              onClick={send}
              className="flex h-8 items-center gap-1.5 rounded bg-primary px-space-md font-label-sm text-label-sm font-semibold text-on-primary shadow-sm transition-colors hover:bg-primary-container hover:text-on-primary-container disabled:cursor-not-allowed disabled:opacity-50"
            >
              <span>发送</span>
              <Icon name="send" className="text-[16px]" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
