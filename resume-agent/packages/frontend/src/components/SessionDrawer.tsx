import { Button, Drawer, Input } from "antd";
import { useEffect, useState } from "react";
import { fetchSessions, groupSessions } from "../sessions";
import type { SessionSummary } from "../types";

export function SessionDrawer({
  open,
  activeId,
  onClose,
  onCreate,
  onSelect,
}: {
  open: boolean;
  activeId?: string;
  onClose: () => void;
  onCreate: () => void;
  onSelect: (id: string) => void;
}) {
  const [query, setQuery] = useState("");
  const [sessions, setSessions] = useState<SessionSummary[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;
    const handle = window.setTimeout(() => {
      void fetchSessions(query)
        .then((items) => {
          setSessions(items);
          setError("");
        })
        .catch((reason: unknown) => {
          setError(reason instanceof Error ? reason.message : "没有读到对话列表");
        });
    }, 200);
    return () => window.clearTimeout(handle);
  }, [open, query]);

  const groups = groupSessions(sessions);

  return (
    <Drawer title="历史对话" placement="right" open={open} onClose={onClose} className="session-drawer">
      <div className="session-toolbar">
        <Button
          type="primary"
          onClick={() => {
            onCreate();
            onClose();
          }}
        >
          新对话
        </Button>
      </div>
      <Input
        className="session-search"
        allowClear
        placeholder="搜索标题或内容"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
      />
      {error ? <p className="session-empty">{error}</p> : null}
      {!error && groups.length === 0 ? <p className="session-empty">还没有对话</p> : null}
      {groups.map((group) => (
        <section key={group.label}>
          <h3>{group.label}</h3>
          {group.items.map((item) => (
            <button
              key={item.id}
              type="button"
              className={item.id === activeId ? "session-item active" : "session-item"}
              onClick={() => onSelect(item.id)}
            >
              <span>{item.title || "未命名对话"}</span>
              <time>{new Date(item.updatedAt).toLocaleString("zh-CN", { month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit" })}</time>
            </button>
          ))}
        </section>
      ))}
    </Drawer>
  );
}
