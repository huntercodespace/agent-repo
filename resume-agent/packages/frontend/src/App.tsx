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
    <main className={narrow ? "app app-mobile" : "app"}>
      {error ? <p className="boot-error">{error}</p> : null}
      {profile ? <ChatPanel profile={profile} narrow={narrow} mock={mock} /> : null}
    </main>
  );
}
