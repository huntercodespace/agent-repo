import {
  ArrowUpOutlined,
  AudioOutlined,
  EditOutlined,
  EllipsisOutlined,
  MenuOutlined,
  PaperClipOutlined,
  RobotOutlined,
  SendOutlined,
  ShareAltOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { Bubble, Sender, ThoughtChain } from "@ant-design/x";
import { Alert, Dropdown } from "antd";
import { useEffect, useRef, useState } from "react";
import { fetchSession, fetchSessions } from "../sessions";
import { readSse } from "../sse";
import type { ChatMessage, Profile, ProjectDetail, SessionSummary, ToolDetails, ToolStatus, ToolStep } from "../types";
import { AnswerActions } from "./AnswerActions";
import { CompactProfile, WelcomeProfile } from "./ProfileViews";
import { ProjectPanel } from "./ProjectPanel";
import { ResultCards } from "./ResultCards";
import { SessionSidebar } from "./SessionSidebar";

const SUGGESTIONS = ["他最有代表性的项目是什么？", "2023 年后做过哪些 React 项目？", "为什么适合前端岗位？"];

function thoughtStatus(status: ToolStatus): "loading" | "success" | "error" {
  if (status === "pending") return "loading";
  if (status === "error") return "error";
  return "success";
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object";
}

function asToolDetails(value: unknown): ToolDetails | undefined {
  if (!isRecord(value) || typeof value.kind !== "string") return undefined;
  return value as ToolDetails;
}

function AssistantMark() {
  return (
    <span className="assistant-mark" aria-hidden="true">
      <RobotOutlined />
    </span>
  );
}

export function ChatPanel({ profile, narrow, mock }: { profile: Profile; narrow: boolean; mock: boolean }) {
  const [draft, setDraft] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [streaming, setStreaming] = useState(false);
  const [project, setProject] = useState<ProjectDetail | null>(null);
  const [projectOpen, setProjectOpen] = useState(false);
  const [projectError, setProjectError] = useState("");
  const [projectLoading, setProjectLoading] = useState(false);
  const [sessionsOpen, setSessionsOpen] = useState(false);
  const [sessions, setSessions] = useState<SessionSummary[]>([]);
  const [sessionQuery, setSessionQuery] = useState("");
  const [sessionError, setSessionError] = useState("");
  const [copiedLink, setCopiedLink] = useState(false);
  const sessionId = useRef<string | undefined>(undefined);
  const [activeId, setActiveId] = useState<string | undefined>(undefined);
  const abortRef = useRef<AbortController | null>(null);
  const threadRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void fetchSessions(sessionQuery)
        .then((items) => {
          setSessions(items);
          setSessionError("");
        })
        .catch((reason: unknown) => {
          setSessionError(reason instanceof Error ? reason.message : "没有读到对话列表");
        });
    }, 200);
    return () => window.clearTimeout(timer);
  }, [sessionQuery, messages.length, activeId]);

  useEffect(() => {
    const node = threadRef.current;
    if (!node || messages.length === 0) return;
    node.scrollTop = node.scrollHeight;
  }, [messages]);

  function patchAssistant(id: string, recipe: (message: ChatMessage) => ChatMessage) {
    setMessages((current) => current.map((message) => (message.id === id ? recipe(message) : message)));
  }

  function upsertTool(id: string, step: ToolStep) {
    patchAssistant(id, (message) => {
      const tools = message.tools ?? [];
      const index = tools.findIndex((item) => item.toolCallId === step.toolCallId);
      const next = index === -1 ? [...tools, step] : tools.map((item, itemIndex) => (itemIndex === index ? { ...item, ...step } : item));
      return { ...message, tools: next };
    });
  }

  async function openProject(id: string) {
    setProjectOpen(true);
    setProjectLoading(true);
    setProjectError("");
    setProject(null);
    try {
      const response = await fetch(`/api/projects/${encodeURIComponent(id)}`);
      const body = (await response.json()) as ProjectDetail & { message?: string };
      if (!response.ok || body.kind !== "project") {
        throw new Error(body.message || "没有找到这个项目。");
      }
      setProject(body);
    } catch (error) {
      setProjectError(error instanceof Error ? error.message : "没有找到这个项目。");
    } finally {
      setProjectLoading(false);
    }
  }

  function stopStreaming() {
    abortRef.current?.abort();
  }

  async function send(text: string, options?: { regenerate?: boolean }) {
    const question = text.trim();
    if ((!question && !options?.regenerate) || streaming) return;
    if (!options?.regenerate) setDraft("");
    let assistantId: string = crypto.randomUUID();
    setMessages((current) => {
      const withoutPending = options?.regenerate && current.at(-1)?.role === "assistant" ? current.slice(0, -1) : current;
      return [
        ...withoutPending,
        ...(options?.regenerate ? [] : [{ id: crypto.randomUUID(), role: "user" as const, text: question }]),
        { id: assistantId, role: "assistant" as const, text: "", streaming: true, tools: [] },
      ];
    });
    setStreaming(true);
    const controller = new AbortController();
    abortRef.current = controller;
    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: question,
          ...(sessionId.current ? { sessionId: sessionId.current } : {}),
          ...(options?.regenerate ? { regenerate: true } : {}),
        }),
        signal: controller.signal,
      });
      if (!response.ok) {
        let message = "请求失败";
        try {
          const body = (await response.json()) as { message?: string };
          if (body.message) message = body.message;
        } catch {
          message = "请求失败";
        }
        throw new Error(message);
      }
      await readSse(response, (event, data) => {
        if (event === "session" && typeof data.sessionId === "string") {
          sessionId.current = data.sessionId;
          setActiveId(data.sessionId);
        } else if (event === "text_delta" && typeof data.delta === "string") {
          patchAssistant(assistantId, (message) => ({ ...message, text: message.text + data.delta }));
        } else if (event === "tool_start" || event === "tool_progress" || event === "tool_end") {
          const toolCallId = String(data.toolCallId ?? "");
          const status: ToolStatus = data.status === "error" ? "error" : data.status === "success" ? "success" : "pending";
          upsertTool(assistantId, {
            toolCallId,
            name: String(data.name ?? ""),
            label: String(data.label ?? "正在查阅"),
            status,
            ...(data.args !== undefined ? { args: data.args } : {}),
            ...(typeof data.content === "string" ? { content: data.content } : {}),
            ...(asToolDetails(data.details) ? { details: asToolDetails(data.details) } : {}),
          });
        } else if (event === "error" && typeof data.message === "string") {
          patchAssistant(assistantId, (message) => ({ ...message, error: data.message as string }));
        } else if (event === "done" && typeof data.messageId === "string") {
          const serverId = data.messageId;
          patchAssistant(assistantId, (message) => ({ ...message, id: serverId, saved: true }));
          assistantId = serverId;
        }
      });
    } catch (error) {
      if (!controller.signal.aborted) {
        const message = error instanceof Error ? error.message : "请求失败";
        patchAssistant(assistantId, (current) => ({ ...current, error: message }));
      }
    } finally {
      patchAssistant(assistantId, (current) => ({ ...current, streaming: false }));
      setStreaming(false);
      abortRef.current = null;
    }
  }

  function startNewChat() {
    stopStreaming();
    sessionId.current = undefined;
    setActiveId(undefined);
    setMessages([]);
    setDraft("");
    setProjectOpen(false);
    setSessionsOpen(false);
  }

  async function openSession(id: string) {
    stopStreaming();
    const session = await fetchSession(id);
    sessionId.current = session.id;
    setActiveId(session.id);
    setMessages(session.messages);
    setSessionsOpen(false);
    setProjectOpen(false);
  }

  function share() {
    void navigator.clipboard.writeText(window.location.href).then(() => {
      setCopiedLink(true);
      window.setTimeout(() => setCopiedLink(false), 1500);
    });
  }

  const empty = messages.length === 0;
  const lastAssistantId = [...messages].reverse().find((message) => message.role === "assistant")?.id;
  const note = mock ? "答案由 AI 根据简历内容生成 · 本地演示" : "答案由 AI 根据简历内容生成";

  const composer = (
    <Sender
      className={narrow ? "composer composer-mobile" : empty ? "composer composer-welcome" : "composer composer-docked"}
      value={draft}
      onChange={setDraft}
      loading={streaming}
      placeholder="问问我的经历..."
      submitType="enter"
      autoSize={narrow || !empty ? { minRows: 1, maxRows: 4 } : { minRows: 3, maxRows: 6 }}
      onSubmit={(value) => void send(value)}
      onCancel={() => abortRef.current?.abort()}
      styles={
        !narrow && empty
          ? {
              root: {
                background: "rgba(255,255,255,0.9)",
                border: "none",
                borderRadius: 12,
                boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -4px rgba(0,0,0,0.1)",
                padding: 16,
              },
              content: {
                display: "grid",
                gridTemplateColumns: "1fr auto",
                gridTemplateAreas: '"input input" "tools send"',
                alignItems: "center",
                rowGap: 8,
                background: "transparent",
                padding: 0,
              },
              input: { gridArea: "input", minHeight: 72, background: "transparent" },
              prefix: { gridArea: "tools" },
              suffix: { gridArea: "send", justifySelf: "end" },
            }
          : {
              root: {
                background: narrow ? "#ffffff" : "rgba(255,255,255,0.95)",
                border: "none",
                borderRadius: narrow ? 999 : 12,
                boxShadow: narrow
                  ? "0 1px 2px rgba(0,0,0,0.05)"
                  : "0 20px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)",
              },
              content: { background: "transparent", padding: 0 },
              input: { background: "transparent" },
            }
      }
      prefix={
        narrow || empty ? (
          <span className="composer-tools">
            <button className="icon-button" type="button" disabled title="暂不支持附件" aria-label="附件">
              <PaperClipOutlined />
            </button>
            <button className="icon-button" type="button" disabled title="暂不支持语音" aria-label="语音">
              <AudioOutlined />
            </button>
          </span>
        ) : undefined
      }
      suffix={(_, info) => {
        const { SendButton, LoadingButton } = info.components;
        if (streaming) return <LoadingButton aria-label="停止" />;
        return (
          <SendButton className="send-button" aria-label="发送" icon={narrow || empty ? <ArrowUpOutlined /> : <SendOutlined />} />
        );
      }}
      footer={!narrow && !empty ? <p className="composer-note">{note}</p> : undefined}
    />
  );

  const sidebarProps = {
    profile,
    sessions,
    query: sessionQuery,
    activeId,
    error: sessionError,
    onQuery: setSessionQuery,
    onCreate: startNewChat,
    onSelect: (id: string) => {
      void openSession(id);
    },
  };

  return (
    <div className="shell">
      {narrow ? null : <SessionSidebar mode="desktop" {...sidebarProps} />}
      <div className="workspace">
        <header className="topbar">
          {narrow ? (
            <>
              <button className="icon-button icon-button-lg" type="button" aria-label="打开历史记录" onClick={() => setSessionsOpen(true)}>
                <MenuOutlined />
              </button>
              <div className="topbar-title">
                <i className="live-dot" />
                <h1>Ai Assistant</h1>
              </div>
              <div className="topbar-actions">
                <button className="icon-button icon-button-lg" type="button" aria-label="新建对话" onClick={startNewChat}>
                  <EditOutlined />
                </button>
                <button className="icon-button icon-button-lg" type="button" aria-label="分享" onClick={share}>
                  <ShareAltOutlined />
                </button>
                <span className="topbar-avatar">
                  <UserOutlined />
                </span>
              </div>
            </>
          ) : (
            <>
              <div className="topbar-title">
                <strong>
                  {profile.name} · 简历问答
                </strong>
                <span className="capability-pill">
                  <i />
                  {profile.headline.split("·")[0]?.trim() || "简历问答"}
                </span>
              </div>
              <div className="topbar-actions">
                <button className="share-button" type="button" onClick={share}>
                  <ShareAltOutlined />
                  {copiedLink ? "已复制链接" : "分享对话"}
                </button>
                <Dropdown
                  menu={{
                    items: [{ key: "new", label: "新建对话", onClick: startNewChat }],
                  }}
                >
                  <button className="icon-button" type="button" aria-label="更多">
                    <EllipsisOutlined />
                  </button>
                </Dropdown>
                <span className="topbar-avatar">
                  <UserOutlined />
                </span>
              </div>
            </>
          )}
        </header>
        <div className={projectOpen && !narrow ? "stage with-project" : "stage"}>
          <div className="thread-wrap">
            <div className="thread" ref={threadRef}>
              <div className={empty && !narrow ? "thread-inner thread-welcome" : "thread-inner"}>
                {empty && !narrow ? <WelcomeProfile profile={profile} /> : <CompactProfile profile={profile} narrow={narrow} />}
                <div className="intro">
                  <AssistantMark />
                  <div className="intro-copy">
                    {empty && !narrow ? (
                      <div className="intro-meta">
                        <strong>简历助手 Copilot</strong>
                        <span>智能问答已就绪</span>
                      </div>
                    ) : null}
                    <div className={empty && !narrow ? "intro-bubble intro-bubble-welcome" : "intro-bubble"}>
                      你好，我是{profile.name}的简历助手，可以问我他的项目、技能和经历。
                      {empty && !narrow ? "你可以点击下方热门问题，也可以在下方输入框自由提问。" : ""}
                    </div>
                    <div className={empty && !narrow ? "suggestion-grid" : narrow ? "suggestion-list" : "suggestion-pills"}>
                      {SUGGESTIONS.map((label) => (
                        <button key={label} type="button" onClick={() => void send(label)}>
                          <span>{label}</span>
                          {narrow || (empty && !narrow) ? <span className="suggestion-arrow" aria-hidden="true">→</span> : null}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                {messages.map((message) =>
                  message.role === "user" ? (
                    <div key={message.id} className="user-row">
                      <Bubble
                        placement="end"
                        variant="borderless"
                        content={message.text}
                        className="user-bubble"
                      />
                      {narrow ? null : (
                        <span className="user-mark" aria-hidden="true">
                          <UserOutlined />
                        </span>
                      )}
                    </div>
                  ) : (
                    <div key={message.id} className="assistant-block">
                      {message.tools && message.tools.length > 0 ? (
                        <ThoughtChain
                          className="tool-chain"
                          line={false}
                          items={message.tools.map((step) => ({
                            key: step.toolCallId,
                            title: step.label,
                            status: thoughtStatus(step.status),
                            blink: step.status === "pending",
                          }))}
                        />
                      ) : null}
                      {message.text || message.streaming || message.error ? (
                        <div className="assistant-row">
                          <AssistantMark />
                          <div className="assistant-copy">
                            {message.streaming && !message.text && !(message.tools && message.tools.length) ? (
                              <Bubble placement="start" variant="borderless" loading content="" />
                            ) : null}
                            {message.text ? (
                              <div className="assistant-card">
                                <p>{message.text}</p>
                                <ResultCards tools={message.tools ?? []} onOpenProject={(id) => void openProject(id)} />
                                {!message.streaming ? (
                                  <AnswerActions
                                    message={message}
                                    sessionId={sessionId.current}
                                    canRegenerate={Boolean(message.saved && message.id === lastAssistantId && !streaming)}
                                    onRegenerate={() => {
                                      const question = [...messages].reverse().find((item) => item.role === "user")?.text ?? "";
                                      void send(question, { regenerate: true });
                                    }}
                                    onRated={(rating) => patchAssistant(message.id, (current) => ({ ...current, rating }))}
                                  />
                                ) : null}
                              </div>
                            ) : null}
                            {message.error ? <Alert type="error" showIcon message={message.error} /> : null}
                          </div>
                        </div>
                      ) : null}
                    </div>
                  ),
                )}
                {empty && !narrow ? (
                  <div className="welcome-composer">
                    {composer}
                    <p className="composer-note">{note}</p>
                  </div>
                ) : null}
              </div>
            </div>
            {empty && !narrow ? null : (
              <div className="composer-dock">
                {composer}
                {narrow ? <p className="composer-note">{note}</p> : null}
              </div>
            )}
          </div>
          {projectOpen && !narrow ? (
            <ProjectPanel
              project={project}
              loading={projectLoading}
              error={projectError}
              onClose={() => setProjectOpen(false)}
            />
          ) : null}
        </div>
      </div>
      {narrow && sessionsOpen ? <SessionSidebar mode="drawer" {...sidebarProps} onClose={() => setSessionsOpen(false)} /> : null}
      {narrow && projectOpen ? (
        <div className="mobile-project">
          <button className="mobile-mask" type="button" aria-label="关闭项目详情" onClick={() => setProjectOpen(false)} />
          <ProjectPanel project={project} loading={projectLoading} error={projectError} onClose={() => setProjectOpen(false)} />
        </div>
      ) : null}
    </div>
  );
}
