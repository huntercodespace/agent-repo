import { Button, Input, Popover, Radio } from "antd";
import { useState } from "react";
import type { ChatMessage } from "../types";

const REASONS = ["信息不准确", "没回答到点上", "其他"] as const;

async function sendFeedback(input: {
  sessionId: string;
  messageId: string;
  rating: "like" | "dislike";
  reason?: string;
  comment?: string;
}): Promise<void> {
  const response = await fetch("/api/feedback", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!response.ok) {
    const body = (await response.json().catch(() => ({}))) as { message?: string };
    throw new Error(body.message || "没有记下反馈");
  }
}

export function AnswerActions({
  message,
  sessionId,
  canRegenerate,
  onRegenerate,
  onRated,
}: {
  message: ChatMessage;
  sessionId?: string;
  canRegenerate: boolean;
  onRegenerate: () => void;
  onRated: (rating: "like" | "dislike") => void;
}) {
  const [copied, setCopied] = useState(false);
  const [reason, setReason] = useState<(typeof REASONS)[number] | "">("");
  const [comment, setComment] = useState("");
  const [open, setOpen] = useState(false);
  const [error, setError] = useState("");

  async function submit(rating: "like" | "dislike", nextReason = "", nextComment = "") {
    if (!sessionId || !message.saved) return;
    setError("");
    await sendFeedback({
      sessionId,
      messageId: message.id,
      rating,
      ...(nextReason ? { reason: nextReason } : {}),
      ...(nextComment ? { comment: nextComment } : {}),
    });
    onRated(rating);
    setOpen(false);
  }

  return (
    <div className="answer-actions">
      <Button
        type="text"
        size="small"
        onClick={() => {
          void navigator.clipboard.writeText(message.text).then(() => {
            setCopied(true);
            window.setTimeout(() => setCopied(false), 1500);
          });
        }}
      >
        {copied ? "已复制" : "复制"}
      </Button>
      {canRegenerate ? (
        <Button type="text" size="small" onClick={onRegenerate}>
          重新生成
        </Button>
      ) : null}
      <Button
        type={message.rating === "like" ? "primary" : "text"}
        size="small"
        disabled={!message.saved || !sessionId}
        onClick={() => {
          void submit("like").catch((reasonError: unknown) => {
            setError(reasonError instanceof Error ? reasonError.message : "没有记下反馈");
          });
        }}
      >
        有用
      </Button>
      <Popover
        trigger="click"
        open={open}
        onOpenChange={setOpen}
        content={
          <div className="feedback-box">
            <Radio.Group
              value={reason}
              onChange={(event) => setReason(event.target.value as (typeof REASONS)[number])}
            >
              {REASONS.map((item) => (
                <Radio key={item} value={item}>
                  {item}
                </Radio>
              ))}
            </Radio.Group>
            <Input.TextArea
              value={comment}
              placeholder="补充说明，可以不填"
              autoSize={{ minRows: 2, maxRows: 4 }}
              onChange={(event) => setComment(event.target.value)}
            />
            <div className="feedback-actions">
              <Button
                size="small"
                type="primary"
                onClick={() => {
                  void submit("dislike", reason, comment).catch((reasonError: unknown) => {
                    setError(reasonError instanceof Error ? reasonError.message : "没有记下反馈");
                  });
                }}
              >
                提交
              </Button>
              <Button
                size="small"
                onClick={() => {
                  void submit("dislike").catch((reasonError: unknown) => {
                    setError(reasonError instanceof Error ? reasonError.message : "没有记下反馈");
                  });
                }}
              >
                跳过
              </Button>
            </div>
          </div>
        }
      >
        <Button type={message.rating === "dislike" ? "primary" : "text"} size="small" disabled={!message.saved || !sessionId}>
          没用
        </Button>
      </Popover>
      {error ? <span className="feedback-error">{error}</span> : null}
    </div>
  );
}
