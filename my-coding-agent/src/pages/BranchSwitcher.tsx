import { useMemo, useState } from "react";
import { Icon } from "../components/Icon";

interface BranchRow {
  name: string;
  meta: string;
  detail: string;
  scope: "current" | "local" | "remote";
}

const branches: BranchRow[] = [
  { name: "main", meta: "HEAD", detail: "当前", scope: "current" },
  { name: "feat/auth-race", meta: "14", detail: "3 小时前", scope: "local" },
  { name: "fix/sse-parser", meta: "2", detail: "刚刚", scope: "local" },
  { name: "chore/deps", meta: "", detail: "昨天", scope: "local" },
  { name: "origin/main", meta: "", detail: "跟踪 main", scope: "remote" },
  { name: "origin/feat/auth-race", meta: "", detail: "跟踪 feat/auth-race", scope: "remote" },
];

export function BranchSwitcher({
  dirty,
  onDirtyChange,
  onClose,
}: {
  dirty: boolean;
  onDirtyChange: (dirty: boolean) => void;
  onClose: () => void;
}) {
  const [query, setQuery] = useState("");
  const [notice, setNotice] = useState<string | null>(null);
  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return branches;
    return branches.filter((branch) => branch.name.toLowerCase().includes(needle));
  }, [query]);

  function choose(name: string) {
    if (dirty && name !== "main") {
      setNotice("工作区有未提交更改。可强制切换，或先暂存再切换。此为演示，分支仍停留在 main。");
      return;
    }
    setNotice(`已选中 ${name}。演示不会真正切换分支。`);
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-start justify-center bg-[#07090d]/70 px-space-lg pt-24" onClick={onClose}>
      <div
        role="dialog"
        aria-label="切换分支"
        className="w-full max-w-[440px] overflow-hidden rounded-xl border border-outline-variant/50 bg-surface-container-lowest shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between px-space-md py-space-sm">
          <div className="flex items-center gap-space-sm">
            <span className="font-label-md text-label-md font-semibold text-on-surface">切换分支</span>
            <span className="rounded bg-surface-container px-1.5 py-0.5 font-code-sm text-code-sm text-outline">GIT</span>
          </div>
          <button
            type="button"
            aria-label="关闭"
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded text-outline transition-colors hover:bg-surface-container hover:text-on-surface"
          >
            <Icon name="close" className="text-[18px]" />
          </button>
        </div>
        <div className="px-space-md pb-space-sm">
          <label className="flex h-8 items-center gap-space-xs rounded bg-surface-container px-space-sm text-on-surface-variant">
            <Icon name="search" className="text-[15px]" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="搜索分支或输入新分支名..."
              className="w-full bg-transparent font-body-sm text-body-sm text-on-surface outline-none placeholder:text-outline"
            />
          </label>
        </div>
        <div className="max-h-72 overflow-y-auto px-space-sm pb-space-sm">
          <Section title="当前分支 CURRENT" rows={filtered.filter((row) => row.scope === "current")} onChoose={choose} />
          <Section title="本地分支 LOCAL BRANCHES" rows={filtered.filter((row) => row.scope === "local")} onChoose={choose} />
          <Section title="远程分支 REMOTE BRANCHES" rows={filtered.filter((row) => row.scope === "remote")} onChoose={choose} />
        </div>
        {dirty ? (
          <div className="mx-space-sm mb-space-sm rounded-lg border border-error/40 bg-[#3a1618] px-space-md py-space-sm">
            <div className="flex items-center gap-space-xs font-label-sm text-label-sm font-semibold text-error">
              <Icon name="warning" className="text-[16px]" />
              <span>检测到 3 个未提交更改 (Dirty Worktree)</span>
            </div>
            <p className="mt-1 font-body-sm text-body-sm text-on-surface-variant">
              当前有未提交更改。强制切换会丢弃这些演示改动；暂存后切换会先把它们收起。
            </p>
            <div className="mt-space-sm flex items-center gap-space-xs">
              <button
                type="button"
                onClick={() => setNotice("已强制切换（演示）。状态栏分支仍显示 main。")}
                className="h-7 rounded bg-error-container px-space-sm font-label-xs text-label-xs text-on-error-container"
              >
                强制切换 (Force)
              </button>
              <button
                type="button"
                onClick={() => {
                  onDirtyChange(false);
                  setNotice("已暂存并切换（演示）。脏工作区横幅已收起。");
                }}
                className="h-7 rounded bg-surface-container px-space-sm font-label-xs text-label-xs text-on-surface"
              >
                暂存并切换 (Stash)
              </button>
            </div>
          </div>
        ) : null}
        {notice ? <p className="px-space-md pb-space-sm font-code-sm text-code-sm text-secondary">{notice}</p> : null}
        <div className="flex items-center justify-between border-t border-outline-variant/30 px-space-md py-space-sm">
          <button
            type="button"
            onClick={() => onDirtyChange(!dirty)}
            className="font-label-xs text-label-xs text-outline transition-colors hover:text-on-surface"
          >
            {dirty ? "演示：干净工作区" : "演示：脏工作区"}
          </button>
          <button
            type="button"
            onClick={() => setNotice(query.trim() ? `将创建分支 ${query.trim()}（演示）` : "输入新分支名后再创建")}
            className="flex items-center gap-1 font-label-sm text-label-sm text-on-surface-variant transition-colors hover:text-on-surface"
          >
            <Icon name="add" className="text-[15px]" />
            <span>创建分支</span>
          </button>
        </div>
      </div>
    </div>
  );
}

function Section({
  title,
  rows,
  onChoose,
}: {
  title: string;
  rows: BranchRow[];
  onChoose: (name: string) => void;
}) {
  if (rows.length === 0) return null;
  return (
    <div className="mb-space-xs">
      <div className="px-space-sm py-1 font-label-xs text-label-xs uppercase tracking-wider text-outline">{title}</div>
      {rows.map((row) => {
        const current = row.scope === "current";
        return (
          <button
            key={row.name}
            type="button"
            onClick={() => onChoose(row.name)}
            className={`flex w-full items-center justify-between rounded px-space-sm py-1.5 text-left transition-colors ${
              current ? "bg-surface-container-high text-on-surface" : "text-on-surface-variant hover:bg-surface-container hover:text-on-surface"
            }`}
          >
            <span className="flex min-w-0 items-center gap-space-sm">
              <Icon name="account_tree" className={`text-[15px] ${current ? "text-secondary" : "text-outline"}`} />
              <span className="truncate font-code-sm text-code-sm">{row.name}</span>
              {row.meta ? (
                <span className="rounded bg-surface-container px-1 py-0.5 font-label-xs text-[10px] text-outline">{row.meta}</span>
              ) : null}
            </span>
            <span className="flex items-center gap-space-xs font-label-xs text-label-xs text-outline">
              <span>{row.detail}</span>
              {current ? <Icon name="check" className="text-[14px] text-tertiary" /> : null}
            </span>
          </button>
        );
      })}
    </div>
  );
}
