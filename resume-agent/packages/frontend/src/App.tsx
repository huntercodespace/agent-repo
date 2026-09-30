import { DisconnectOutlined } from "@ant-design/icons";
import { useEffect, useState } from "react";
import { ChatPanel } from "./components/ChatPanel";
import type { Profile } from "./types";

function useNarrow() {
  const [narrow, setNarrow] = useState(() => window.matchMedia("(max-width: 960px)").matches);
  useEffect(() => {
    const query = window.matchMedia("(max-width: 960px)");
    const onChange = () => setNarrow(query.matches);
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, []);
  return narrow;
}

function useVisualViewport() {
  useEffect(() => {
    const root = document.documentElement;
    const apply = () => {
      const viewport = window.visualViewport;
      if (!viewport) return;
      root.style.setProperty("--vvh", `${viewport.height}px`);
      root.style.setProperty("--vv-top", `${viewport.offsetTop}px`);
    };
    apply();
    window.visualViewport?.addEventListener("resize", apply);
    window.visualViewport?.addEventListener("scroll", apply);
    window.addEventListener("resize", apply);
    return () => {
      window.visualViewport?.removeEventListener("resize", apply);
      window.visualViewport?.removeEventListener("scroll", apply);
      window.removeEventListener("resize", apply);
    };
  }, []);
}

function offlineMessage(reason: unknown): string {
  if (reason instanceof TypeError) return "暂时连不上简历服务";
  if (reason instanceof Error && /failed to fetch|network|load failed/i.test(reason.message)) return "暂时连不上简历服务";
  return reason instanceof Error ? reason.message : "暂时连不上简历服务";
}

export function App() {
  const narrow = useNarrow();
  useVisualViewport();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [error, setError] = useState("");
  const [mock, setMock] = useState(false);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    setError("");
    void Promise.all([
      fetch("/api/profile", { signal: controller.signal }).then((response) => response.json()),
      fetch("/api/health", { signal: controller.signal }).then((response) => response.json()),
    ])
      .then(([profileBody, healthBody]) => {
        if (!profileBody?.name) throw new Error(profileBody?.message || "没有读到简历档案");
        setProfile(profileBody as Profile);
        setMock(Boolean(healthBody?.mock));
      })
      .catch((reason: unknown) => {
        if (controller.signal.aborted) return;
        setProfile(null);
        setError(offlineMessage(reason));
      });
    return () => controller.abort();
  }, [attempt]);

  return (
    <main className={narrow ? "app app-mobile" : "app"}>
      {error && !profile ? (
        <div className="offline-screen">
          <div className="offline-card">
            <DisconnectOutlined />
            <strong>暂时连不上简历服务</strong>
            <p>请检查网络后重试</p>
            <button type="button" onClick={() => setAttempt((value) => value + 1)}>
              重试
            </button>
          </div>
        </div>
      ) : null}
      {profile ? <ChatPanel profile={profile} narrow={narrow} mock={mock} /> : null}
    </main>
  );
}
