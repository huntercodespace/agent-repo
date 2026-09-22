import { Icon } from "./Icon";

export function Composer() {
  return (
    <div className="bg-surface p-space-md lg:p-space-lg">
      <div className="mx-auto flex max-w-5xl flex-col gap-space-md rounded-xl bg-surface-container-lowest p-space-md shadow-xl">
        <textarea
          className="w-full resize-none select-text bg-transparent font-body-md text-body-md text-on-surface outline-none placeholder:text-outline"
          placeholder="向 Pi 描述你的编码需求，支持输入 @ 引用文件或 # 关联 Issue..."
          rows={3}
          spellCheck={false}
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
              <span>Pi-Sonnet-3.5</span>
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
              className="flex h-8 items-center gap-1.5 rounded bg-primary px-space-md font-label-sm text-label-sm font-semibold text-on-primary shadow-sm transition-colors hover:bg-primary-container hover:text-on-primary-container"
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
