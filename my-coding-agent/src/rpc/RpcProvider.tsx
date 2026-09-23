import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { EMPTY_CREDENTIALS, type EngineSnapshot, type PromptResult, type RpcStatus, type TranscriptBlock } from "./types";
import { appendUserBlock, applyRpcEvent, settleTranscript } from "./transcript";

interface RpcContextValue {
  status: RpcStatus;
  hydrated: boolean;
  blocks: TranscriptBlock[];
  notice: string | null;
  sendPrompt: (text: string) => Promise<boolean>;
}

const offlineStatus = (): RpcStatus => ({
  available: false,
  webContentsId: null,
  engine: "disconnected",
  pid: null,
  cwd: "",
  modelLabel: null,
  detail: null,
  credentials: EMPTY_CREDENTIALS,
  credentialsHref: "#/credentials",
});

const RpcContext = createContext<RpcContextValue | null>(null);

function withBridge(snapshot: EngineSnapshot): RpcStatus {
  return { ...snapshot, available: true };
}

export function RpcProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<RpcStatus>(() => {
    if (typeof window !== "undefined" && window.piDesktop?.getEngineStatus) {
      return { ...offlineStatus(), available: true, engine: "reconnecting" };
    }
    return offlineStatus();
  });
  const [hydrated, setHydrated] = useState(false);
  const [blocks, setBlocks] = useState<TranscriptBlock[]>([]);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    if (status.engine !== "idle") return;
    setBlocks((current) => settleTranscript(current));
  }, [status.engine]);

  useEffect(() => {
    const desktop = window.piDesktop;
    if (!desktop?.getEngineStatus || !desktop.onEngineStatus || !desktop.onRpcEvent) return;
    const apply = (snapshot: EngineSnapshot) => {
      setStatus(withBridge(snapshot));
      setHydrated(true);
    };
    const offStatus = desktop.onEngineStatus(apply);
    const offEvent = desktop.onRpcEvent((event) => {
      setBlocks((current) => applyRpcEvent(current, event));
      if (event.type === "message_end" && event.errorMessage) {
        setNotice(`模型请求失败：${event.errorMessage}`);
      } else if (event.type === "agent_start") {
        setNotice(null);
      }
    });
    let cancelled = false;
    desktop.getEngineStatus().then((snapshot) => {
      if (!cancelled) apply(snapshot);
    });
    return () => {
      cancelled = true;
      offStatus();
      offEvent();
    };
  }, []);

  useEffect(() => {
    const desktop = window.piDesktop;
    if (!desktop?.onCredentialStatus) return;
    return desktop.onCredentialStatus((payload) => {
      setStatus((current) => ({ ...current, credentials: payload.summary }));
      if (payload.summary.configured) {
        setNotice((current) => (current && current.includes("凭据") ? null : current));
      }
    });
  }, []);

  const sendPrompt = useCallback(async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return false;
    const desktop = window.piDesktop;
    if (!desktop?.sendPrompt) {
      setNotice("RPC 引擎只在 Electron 窗口里运行。用 npm run dev 打开桌面壳。");
      return false;
    }
    if (!status.credentials.configured) {
      setNotice("模型凭据未配置。密钥只留在主进程 AuthStorage，请打开凭据页。");
      return false;
    }
    const result: PromptResult = await desktop.sendPrompt(trimmed);
    if (!result.ok) {
      if (result.code === "credentials") {
        setNotice(result.message ? `模型凭据不可用：${result.message}` : "模型凭据未配置。请打开凭据页。");
        return false;
      }
      setNotice(result.message || "发送失败");
      return false;
    }
    setNotice(null);
    setBlocks((current) => appendUserBlock(current, trimmed));
    return true;
  }, [status.credentials.configured]);

  const value = useMemo(
    () => ({ status, hydrated, blocks, notice, sendPrompt }),
    [status, hydrated, blocks, notice, sendPrompt],
  );

  return <RpcContext.Provider value={value}>{children}</RpcContext.Provider>;
}

export function useRpc() {
  const value = useContext(RpcContext);
  if (!value) throw new Error("useRpc must be used within RpcProvider");
  return value;
}
