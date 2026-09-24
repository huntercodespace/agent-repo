import { useCallback, useEffect, useRef, useState } from "react";
import { useRpc } from "../rpc/RpcProvider";
import type { GitFile, GitStatus } from "../git/types";
import { Icon } from "../components/Icon";

function fileLabel(file: GitFile) {
  if (file.index === "?" && file.worktree === "?") return "未跟踪";
  if (file.index === "D" || file.worktree === "D") return "已删除";
  if (file.index === "A") return "新增";
  if (file.index === "R" || file.worktree === "R") return "重命名";
  return "已修改";
}

function diffTone(line: string) {
  if (line.startsWith("+") && !line.startsWith("+++")) return "bg-tertiary-container/15 text-tertiary";
  if (line.startsWith("-") && !line.startsWith("---")) return "bg-error-container/20 text-error";
  if (line.startsWith("@@")) return "bg-surface-container text-secondary";
  return "text-on-surface-variant";
}

export function DiffPage() {
  const { status: engine } = useRpc();
  const [git, setGit] = useState<GitStatus | null>(null);
  const [selectedPath, setSelectedPath] = useState<string | null>(null);
  const [diff, setDiff] = useState<{ cwd: string; path: string; text: string } | null>(null);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [pushing, setPushing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const requestId = useRef(0);
  const cwdRef = useRef(engine.cwd);
  cwdRef.current = engine.cwd;

  const refresh = useCallback(async () => {
    const request = ++requestId.current;
    const cwd = cwdRef.current;
    const desktop = window.piDesktop;
    if (!desktop?.getGitStatus) {
      setGit({ ok: false, message: "请在 Electron 桌面应用中打开工作区", branch: "", files: [] });
      return;
    }
    setLoading(true);
    try {
      const result = await desktop.getGitStatus();
      if (request !== requestId.current || cwd !== cwdRef.current) return;
      setGit(result);
      setSelectedPath((current) => result.files.some((file) => file.path === current) ? current : result.files[0]?.path ?? null);
      if (!result.ok) setError(result.message || "读取 Git 状态失败");
      else setError("");
      window.dispatchEvent(new Event("git:changed"));
    } catch (cause) {
      if (request === requestId.current && cwd === cwdRef.current) setError(cause instanceof Error ? cause.message : "读取 Git 状态失败");
    } finally {
      if (request === requestId.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
    const onFocus = () => void refresh();
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [engine.cwd, refresh]);

  useEffect(() => {
    if (!selectedPath || !window.piDesktop?.getGitDiff) {
      setDiff(null);
      return;
    }
    let active = true;
    const cwd = engine.cwd;
    const path = selectedPath;
    void window.piDesktop.getGitDiff(path).then((result) => {
      if (active) setDiff({ cwd, path, text: result.ok ? result.text || "没有可显示的文本差异" : result.message || "读取差异失败" });
    }).catch((cause) => {
      if (active) setDiff({ cwd, path, text: cause instanceof Error ? cause.message : "读取差异失败" });
    });
    return () => { active = false; };
  }, [engine.cwd, selectedPath, git]);

  const stage = async (filePath: string | null, selected: boolean) => {
    const desktop = window.piDesktop;
    if (!desktop) return;
    requestId.current += 1;
    const cwd = cwdRef.current;
    setLoading(false);
    setBusy(true);
    setError("");
    setSuccess("");
    try {
      const result = await desktop.stageGitFile(filePath, selected);
      if (cwd !== cwdRef.current) return;
      if (!result.ok) throw new Error(result.message || "暂存失败");
      setGit(result);
      setSelectedPath((current) => result.files.some((file) => file.path === current) ? current : result.files[0]?.path ?? null);
      window.dispatchEvent(new Event("git:changed"));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "暂存失败");
    } finally {
      setBusy(false);
    }
  };

  const commit = async () => {
    const desktop = window.piDesktop;
    if (!desktop || !message.trim()) return;
    requestId.current += 1;
    const cwd = cwdRef.current;
    setLoading(false);
    setBusy(true);
    setError("");
    setSuccess("");
    try {
      const result = await desktop.commitGitChanges(message);
      if (cwd !== cwdRef.current) return;
      if (!result.ok) throw new Error(result.message || "提交失败");
      setGit(result);
      setSelectedPath((current) => result.files.some((file) => file.path === current) ? current : result.files[0]?.path ?? null);
      setMessage("");
      setSuccess(`已提交 ${result.hash || ""}`.trim());
      window.dispatchEvent(new Event("git:changed"));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "提交失败");
    } finally {
      setBusy(false);
    }
  };

  const push = async () => {
    const desktop = window.piDesktop;
    if (!desktop?.pushGitChanges) return;
    requestId.current += 1;
    const cwd = cwdRef.current;
    setLoading(false);
    setBusy(true);
    setPushing(true);
    setError("");
    setSuccess("");
    try {
      const result = await desktop.pushGitChanges();
      if (cwd !== cwdRef.current) return;
      if (!result.ok) throw new Error(result.message || "推送失败");
      setSuccess(result.message || "推送成功");
    } catch (cause) {
      if (cwd === cwdRef.current) setError(cause instanceof Error ? cause.message : "推送失败");
    } finally {
      setBusy(false);
      setPushing(false);
    }
  };

  const files = git?.files ?? [];
  const stagedCount = files.filter((file) => file.staged).length;
  const visibleDiff = diff?.cwd === engine.cwd && diff.path === selectedPath ? diff.text : "正在读取差异…";
  return (
    <main className="flex h-full min-h-0 w-full overflow-hidden bg-surface text-on-surface">
      <section className="flex w-[300px] shrink-0 flex-col border-r border-surface-container-high bg-surface-container-lowest">
        <div className="flex items-center justify-between border-b border-surface-container-high p-space-md">
          <div>
            <h1 className="font-headline-sm text-headline-sm">提交更改</h1>
            <p className="mt-1 truncate font-code-sm text-code-sm text-on-surface-variant" title={engine.cwd}>
              {git?.ok ? `${git.branch} · ${files.length} 个变更` : engine.cwd || "当前工作区"}
            </p>
          </div>
          <button type="button" onClick={() => void refresh()} disabled={busy || loading} title="刷新 Git 状态" className="rounded p-1 text-on-surface-variant hover:bg-surface-container-high disabled:opacity-50">
            <Icon name="refresh" className="text-[18px]" />
          </button>
        </div>
        <div className="flex items-center justify-between px-space-md py-space-sm font-label-sm text-label-sm text-on-surface-variant">
          <span>变更文件</span>
          <button type="button" onClick={() => void stage(null, true)} disabled={busy || files.length === 0 || files.every((file) => file.staged && file.worktree === " ")} className="rounded px-2 py-1 text-secondary hover:bg-surface-container-high disabled:opacity-40">暂存全部</button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-space-xs">
          {loading && !git ? <p className="p-space-md text-on-surface-variant">正在读取变更…</p> : null}
          {git?.ok && files.length === 0 ? <p className="p-space-md text-on-surface-variant">工作区没有待提交的更改。</p> : null}
          {files.map((file) => (
            <div key={file.path} className={`flex items-center gap-2 rounded px-space-sm py-2 ${selectedPath === file.path ? "bg-surface-container-high" : "hover:bg-surface-container"}`}>
              <input type="checkbox" checked={file.staged} disabled={busy} onChange={(event) => void stage(file.path, event.target.checked)} aria-label={`${file.staged ? "取消暂存" : "暂存"} ${file.path}`} className="h-4 w-4 shrink-0 accent-primary" />
              <button type="button" onClick={() => setSelectedPath(file.path)} className="min-w-0 flex-1 text-left">
                <span className="block truncate font-code-sm text-code-sm" title={file.path}>{file.path}</span>
                <span className="font-label-xs text-label-xs text-on-surface-variant">{fileLabel(file)}{file.staged ? " · 已暂存" : ""}{file.staged && file.worktree !== " " ? " · 还有未暂存改动" : ""}</span>
              </button>
              {file.staged && file.worktree !== " " ? (
                <button type="button" disabled={busy} onClick={() => void stage(file.path, true)} title={`暂存 ${file.path} 的最新改动`} aria-label={`暂存 ${file.path} 的最新改动`} className="shrink-0 rounded px-1.5 text-secondary hover:bg-surface-container-high disabled:opacity-50">+</button>
              ) : null}
            </div>
          ))}
        </div>
        <div className="border-t border-surface-container-high p-space-md font-label-sm text-label-sm text-on-surface-variant">已暂存 {stagedCount} 个文件</div>
      </section>
      <section className="flex min-w-0 flex-1 flex-col">
        <div className="border-b border-surface-container-high px-space-md py-space-sm font-code-sm text-code-sm text-on-surface-variant">
          {selectedPath || "选择文件查看差异"}
        </div>
        <div className="min-h-0 flex-1 overflow-auto bg-surface py-space-sm font-code-sm text-code-sm select-text">
          {selectedPath ? visibleDiff.split("\n").map((line, index) => (
            <div key={index} className={`whitespace-pre px-space-md ${diffTone(line)}`}>{line || " "}</div>
          )) : <p className="px-space-md text-on-surface-variant">选择一个变更文件。</p>}
        </div>
        <div className="border-t border-surface-container-high bg-surface-container-low p-space-md">
          {error ? <p role="alert" className="mb-space-sm whitespace-pre-wrap text-error">{error}</p> : null}
          {success ? <p role="status" className="mb-space-sm text-tertiary">{success}</p> : null}
          <label htmlFor="git-commit-message" className="mb-1 block font-label-sm text-label-sm text-on-surface-variant">提交说明</label>
          <textarea id="git-commit-message" value={message} onChange={(event) => setMessage(event.target.value)} rows={2} placeholder="描述这次更改" className="w-full resize-none rounded bg-surface-container px-space-sm py-2 text-on-surface focus:outline-none focus:ring-1 focus:ring-primary" />
          <button type="button" onClick={() => void commit()} disabled={busy || !git?.ok || stagedCount === 0 || !message.trim()} className="mt-space-sm rounded bg-primary px-space-md py-2 font-label-sm text-label-sm text-on-primary hover:bg-primary-container disabled:cursor-not-allowed disabled:opacity-50">
            {busy ? "处理中…" : `提交 ${stagedCount} 个已暂存文件`}
          </button>
          <button type="button" onClick={() => void push()} disabled={busy || !git?.ok || git.branch === "HEAD"} className="ml-space-sm mt-space-sm rounded bg-surface-container-high px-space-md py-2 font-label-sm text-label-sm text-on-surface hover:bg-surface-bright disabled:cursor-not-allowed disabled:opacity-50">
            {pushing ? "正在推送…" : "推送到远程"}
          </button>
        </div>
      </section>
    </main>
  );
}
