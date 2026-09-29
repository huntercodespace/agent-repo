import { Alert } from "antd";
import { useEffect, useState } from "react";
import { ChatPanel } from "./components/ChatPanel";
import { ProfileCard } from "./components/ProfileCard";
import type { Profile } from "./types";

function useNarrow() {
  const [narrow, setNarrow] = useState(() => window.matchMedia("(max-width: 720px)").matches);
  useEffect(() => {
    const query = window.matchMedia("(max-width: 720px)");
    const onChange = () => setNarrow(query.matches);
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, []);
  return narrow;
}

export function App() {
  const narrow = useNarrow();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [error, setError] = useState("");
  const [mock, setMock] = useState(false);

  useEffect(() => {
    void Promise.all([fetch("/api/profile").then((response) => response.json()), fetch("/api/health").then((response) => response.json())])
      .then(([profileBody, healthBody]) => {
        if (!profileBody?.name) throw new Error(profileBody?.message || "没有读到简历档案");
        setProfile(profileBody as Profile);
        setMock(Boolean(healthBody?.mock));
      })
      .catch((reason: unknown) => {
        setError(reason instanceof Error ? reason.message : "没有连上简历服务");
      });
  }, []);

  return (
    <main className="page">
      <section className="sheet">
        {error ? <Alert type="error" showIcon message={error} /> : null}
        {mock ? <Alert type="info" showIcon message="本地演示模式：回答是预设的，不会调用模型。" /> : null}
        {profile ? <ProfileCard profile={profile} narrow={narrow} /> : null}
        {profile ? <ChatPanel profile={profile} /> : null}
      </section>
    </main>
  );
}
