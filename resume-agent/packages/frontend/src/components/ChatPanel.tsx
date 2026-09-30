import { Bubble, Prompts, Sender, ThoughtChain, Welcome } from "@ant-design/x";
import { Alert, Button, Drawer } from "antd";
import { useRef, useState } from "react";
import { fetchSession } from "../sessions";
import { readSse } from "../sse";
import type { ChatMessage, Profile, ProjectDetail, ToolDetails, ToolStatus, ToolStep } from "../types";
import { AnswerActions } from "./AnswerActions";
import { ResultCards } from "./ResultCards";
import { SessionDrawer } from "./SessionDrawer";

const SUGGESTIONS = [
  { key: "flagship", label: "最有代表性的项目是什么？" },
  { key: "react", label: "他 2023 年后做过哪些 React 项目？" },
  { key: "fit", label: "为什么适合这个岗位？" },
  { key: "contact", label: "如何联系他？" },
];

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

export function ChatPanel({ profile }: { profile: Profile }) {
  const [draft, setDraft] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [streaming, setStreaming] = useState(false);
  const [project, setProject] = useState<ProjectDetail | null>(null);
  const [projectOpen, setProjectOpen] = useState(false);
  const [projectError, setProjectError] = useState("");
  const [projectLoading, setProjectLoading] = useState(false);
  const [sessionsOpen, setSessionsOpen] = useState(false);
  const [sessionTitle, setSessionTitle] = useState("");
  const sessionId = useRef<string | undefined>(undefined);
  const abortRef = useRef<AbortController | null>(null);

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
    if (!options?.regenerate && !sessionTitle) {
      setSessionTitle(question.length > 40 ? `${question.slice(0, 40)}…` : question);
    }
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
    setSessionTitle("");
    setMessages([]);
    setDraft("");
  }

  async function openSession(id: string) {
    stopStreaming();
    const session = await fetchSession(id);
    sessionId.current = session.id;
    setSessionTitle(session.title);
    setMessages(session.messages);
    setSessionsOpen(false);
  }

  const empty = messages.length === 0;
  const lastAssistantId = [...messages].reverse().find((message) => message.role === "assistant")?.id;

  return (
    <div className="chat-panel">
      <div className="chat-toolbar">
        {sessionTitle ? <span className="session-title">{sessionTitle}</span> : <span />}
        <Button type="text" onClick={() => setSessionsOpen(true)}>
          历史对话
        </Button>
      </div>
      <div className="thread">
        {empty ? (
          <Welcome
            className="welcome"
            variant="borderless"
            icon={<img src={profile.avatar} alt="" />}
            title={`你好，我是${profile.name}的简历助手`}
            description="可以问我项目、技能和经历。我只会根据简历里写明的内容回答。"
          />
        ) : null}
        <Prompts
          className="prompt-row"
          title={empty ? "可以试试" : undefined}
          items={SUGGESTIONS.map((item) => ({ key: item.key, label: item.label }))}
          wrap
          onItemClick={(info) => {
            const label = info.data.label;
            if (typeof label === "string") void send(label);
          }}
        />
        {messages.map((message) =>
          message.role === "user" ? (
            <Bubble key={message.id} placement="end" content={message.text} className="user-bubble" />
          ) : (
            <div key={message.id} className="assistant-block">
              {message.tools && message.tools.length > 0 ? (
                <ThoughtChain
                  className="thoughts"
                  items={message.tools.map((step) => ({
                    key: step.toolCallId,
                    title: step.label,
                    status: thoughtStatus(step.status),
                    collapsible: true,
                    blink: step.status === "pending",
                  }))}
                  expandedKeys={message.tools
                    .filter((step) => step.status !== "success")
                    .map((step) => step.toolCallId)}
                />
              ) : null}
              {message.text || message.streaming ? (
                <Bubble
                  placement="start"
                  streaming={Boolean(message.streaming && message.text)}
                  loading={Boolean(message.streaming && !message.text && !(message.tools && message.tools.length))}
                  content={message.text}
                />
              ) : null}
              {message.error ? <Alert type="error" showIcon message={message.error} /> : null}
              <ResultCards tools={message.tools ?? []} onOpenProject={(id) => void openProject(id)} />
              {!message.streaming && message.text ? (
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
          ),
        )}
      </div>
      <Sender
        className="composer"
        value={draft}
        onChange={setDraft}
        loading={streaming}
        placeholder="问问我的经历…"
        submitType="enter"
        autoSize={{ minRows: 1, maxRows: 4 }}
        onSubmit={(value) => void send(value)}
        onCancel={() => abortRef.current?.abort()}
        suffix={(_, info) => {
          const { SendButton, LoadingButton } = info.components;
          return streaming ? (
            <LoadingButton aria-label="停止" />
          ) : (
            <SendButton aria-label="发送" shape="round" icon={null}>
              发送
            </SendButton>
          );
        }}
      />
      <SessionDrawer
        open={sessionsOpen}
        activeId={sessionId.current}
        onClose={() => setSessionsOpen(false)}
        onCreate={startNewChat}
        onSelect={(id) => {
          void openSession(id);
        }}
      />
      <Drawer
        title={project?.title || "项目详情"}
        placement="right"
        size="default"
        open={projectOpen}
        onClose={() => setProjectOpen(false)}
        className="project-drawer"
      >
        {projectLoading ? <p>正在读取项目全文…</p> : null}
        {projectError ? <Alert type="warning" showIcon message={projectError} /> : null}
        {project ? (
          <div className="drawer-body">
            <p className="drawer-period">{project.period || "时间未写"}</p>
            <div className="skill-row">
              {project.tech_stack.map((tech) => (
                <span key={tech} className="drawer-tag">
                  {tech}
                </span>
              ))}
            </div>
            <p className="drawer-text">{project.text}</p>
          </div>
        ) : null}
      </Drawer>
    </div>
  );
}
