import type { Route } from "../router";
import { useRpc } from "../rpc/RpcProvider";
import { Icon } from "./Icon";
import { PiLogo } from "./PiLogo";

function workspaceName(cwd: string) {
  return cwd.split(/[\\/]/).filter(Boolean).at(-1) || cwd;
}

export function Sidebar({ route, bottomClass = "bottom-6" }: { route: Route; bottomClass?: string }) {
  const { status } = useRpc();
  const cwd = status.available ? status.cwd : "";

  return (
    <aside className={`fixed left-0 top-10 z-40 flex w-60 flex-col justify-between overflow-y-auto bg-surface-container-lowest ${bottomClass}`}>
      <div className="flex flex-col">
        <div className="flex h-12 items-center gap-space-sm bg-surface-container-lowest px-space-md">
          <PiLogo className="h-5 w-auto object-contain" />
          <span className="font-headline-sm text-headline-sm font-semibold tracking-tight text-on-surface">Pi</span>
        </div>
        <nav aria-label="工作区" className="flex flex-col gap-space-xs px-space-sm py-space-xs">
          <div className="px-space-sm pb-space-xs pt-space-sm font-label-xs text-label-xs font-semibold uppercase tracking-wider text-outline">
            当前工作区
          </div>
          {cwd ? (
            <a
              href="#/"
              title={cwd}
              aria-current={route === "workspace" ? "page" : undefined}
              className={route === "workspace"
                ? "flex items-center rounded bg-surface-container-high px-space-sm py-1.5 font-medium text-on-surface"
                : "flex items-center rounded px-space-sm py-1.5 font-body-sm text-body-sm text-on-surface-variant hover:bg-surface-container"}
            >
              <Icon name="folder" className="mr-2 text-[15px] text-on-surface-variant" />
              <span className="truncate">{workspaceName(cwd)}</span>
            </a>
          ) : (
            <p className="px-space-sm py-1.5 font-body-sm text-body-sm text-outline">尚未连接工作区</p>
          )}
          <p className="px-space-sm pt-space-md font-label-xs text-label-xs text-outline">暂无历史会话</p>
        </nav>
      </div>
      <nav aria-label="设置" className="bg-surface-container-lowest px-space-sm py-space-sm">
        <a
          href="#/settings"
          aria-current={route === "settings" || route === "credentials" ? "page" : undefined}
          className={route === "settings" || route === "credentials"
            ? "flex items-center rounded bg-surface-container-high px-space-sm py-1.5 font-medium text-on-surface"
            : "flex items-center rounded px-space-sm py-1.5 font-body-sm text-body-sm text-on-surface-variant hover:bg-surface-container"}
        >
          设置
        </a>
      </nav>
    </aside>
  );
}
