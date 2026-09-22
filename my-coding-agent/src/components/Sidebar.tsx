import { activeSessionId, sessionGroups } from "../data/workspace";
import { Icon } from "./Icon";
import { PiLogo } from "./PiLogo";

export function Sidebar() {
  return (
    <aside className="fixed bottom-8 left-0 top-10 z-40 flex w-60 flex-col justify-between overflow-y-auto bg-surface-container-lowest">
      <div className="flex flex-col">
        <div className="flex h-12 items-center justify-between bg-surface-container-lowest px-space-md">
          <div className="flex items-center gap-space-sm">
            <PiLogo className="h-5 w-auto object-contain" />
            <span className="font-headline-sm text-headline-sm font-semibold tracking-tight text-on-surface">
              Pi
            </span>
            <span className="rounded bg-surface-container px-1.5 py-0.5 font-code-sm text-code-sm font-medium text-on-surface-variant">
              v2.4.0
            </span>
          </div>
          <button
            type="button"
            title="新建会话"
            className="flex h-6 w-6 items-center justify-center rounded bg-surface-container text-on-surface-variant transition-colors hover:bg-surface-container-high hover:text-on-surface"
          >
            <Icon name="add" className="text-[16px]" />
          </button>
        </div>
        <div className="px-space-md py-space-xs">
          <div className="flex h-7 w-full items-center gap-space-xs rounded bg-surface-container px-space-sm text-on-surface-variant">
            <Icon name="search" className="text-[14px]" />
            <span className="truncate font-label-sm text-label-sm">搜索会话与命令</span>
            <span className="ml-auto font-code-sm text-code-sm text-outline">⌘K</span>
          </div>
        </div>
        <nav className="flex flex-col gap-space-xs px-space-sm py-space-xs">
          {sessionGroups.map((group, index) => (
            <div key={group.label} className="contents">
              <div
                className={`px-space-sm pb-space-xs font-label-xs text-label-xs font-semibold uppercase tracking-wider text-outline ${index === 0 ? "pt-space-sm" : "pt-space-md"}`}
              >
                {group.label}
              </div>
              {group.items.map((item) => {
                const active = item.id === activeSessionId;
                return (
                  <a
                    key={item.id}
                    href={`#${item.id}`}
                    aria-current={active ? "page" : undefined}
                    className={
                      active
                        ? "group flex items-center rounded bg-surface-container-high px-space-sm py-1.5 font-medium text-on-surface transition-colors"
                        : "group flex items-center rounded px-space-sm py-1.5 font-body-sm text-body-sm text-on-surface-variant transition-colors hover:bg-surface-container hover:text-on-surface"
                    }
                  >
                    <Icon name={item.icon} className={`mr-2 text-[15px] ${item.iconClass}`} />
                    <span className="truncate">{item.label}</span>
                  </a>
                );
              })}
            </div>
          ))}
        </nav>
      </div>
      <div className="flex flex-col gap-0.5 bg-surface-container-lowest px-space-sm py-space-sm">
        <a
          href="#workflows"
          className="flex items-center rounded px-space-sm py-1.5 font-body-sm text-body-sm text-on-surface-variant transition-colors hover:bg-surface-container hover:text-on-surface"
        >
          <Icon name="account_tree" className="mr-2 text-[16px] text-on-surface-variant" />
          <span>自动化工作流</span>
        </a>
        <a
          href="#plugins"
          className="flex items-center rounded px-space-sm py-1.5 font-body-sm text-body-sm text-on-surface-variant transition-colors hover:bg-surface-container hover:text-on-surface"
        >
          <Icon name="extension" className="mr-2 text-[16px] text-on-surface-variant" />
          <span>插件市场</span>
        </a>
        <a
          href="#settings"
          className="flex items-center justify-between rounded px-space-sm py-1.5 font-body-sm text-body-sm text-on-surface-variant transition-colors hover:bg-surface-container hover:text-on-surface"
        >
          <span>设置</span>
          <span className="font-code-sm text-code-sm text-outline">⌘,</span>
        </a>
        <div className="flex items-center justify-between px-space-sm pt-space-xs font-label-xs text-label-xs text-outline">
          <span className="truncate">dev@company.io</span>
          <div className="h-1.5 w-1.5 rounded-full bg-tertiary" />
        </div>
      </div>
    </aside>
  );
}
