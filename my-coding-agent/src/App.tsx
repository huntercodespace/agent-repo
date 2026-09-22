import { useEffect, useState } from "react";
import { Sidebar } from "./components/Sidebar";
import { StatusBar } from "./components/StatusBar";
import { TitleBar } from "./components/TitleBar";
import { BranchSwitcher } from "./pages/BranchSwitcher";
import { CredentialsPage } from "./pages/CredentialsPage";
import { DiffPage } from "./pages/DiffPage";
import { OnboardingPage } from "./pages/OnboardingPage";
import { SettingsPage } from "./pages/SettingsPage";
import { WorkspacePage } from "./pages/WorkspacePage";
import { readRoute, type Route } from "./router";
import { readStatusFromLocation, type EngineState, type SandboxState } from "./status";

function useRoute() {
  const [route, setRoute] = useState<Route>(() => readRoute());
  useEffect(() => {
    const onHash = () => setRoute(readRoute());
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);
  return route;
}

export default function App() {
  const route = useRoute();
  const initial = readStatusFromLocation();
  const [engine, setEngine] = useState<EngineState>(initial.engine);
  const [sandbox, setSandbox] = useState<SandboxState>(initial.sandbox);
  const [underlay, setUnderlay] = useState<Route>(route === "branch" || route === "onboarding" ? "workspace" : route);
  const [branchDirty, setBranchDirty] = useState(
    () => new URLSearchParams(window.location.search).get("dirty") === "1",
  );

  useEffect(() => {
    if (route !== "branch" && route !== "onboarding") setUnderlay(route);
  }, [route]);

  if (route === "onboarding") {
    return (
      <div className="h-screen overflow-hidden bg-surface font-body-md text-body-md text-on-surface">
        <OnboardingPage />
      </div>
    );
  }

  const page = underlay === "diff" ? <DiffPage />
    : underlay === "settings" ? <SettingsPage />
    : underlay === "credentials" ? <CredentialsPage />
    : <WorkspacePage />;

  return (
    <div className="h-screen select-none overflow-hidden bg-surface font-body-md text-body-md text-on-surface">
      <TitleBar />
      <Sidebar route={route === "branch" ? underlay : route} />
      <div className="h-full min-h-0 pl-60 pb-8 pt-10">
        <div className="h-full min-h-0">{page}</div>
      </div>
      <StatusBar
        engine={engine}
        sandbox={sandbox}
        onEngineChange={setEngine}
        onSandboxChange={setSandbox}
      />
      {route === "branch" ? (
        <BranchSwitcher
          dirty={branchDirty}
          onDirtyChange={setBranchDirty}
          onClose={() => {
            window.location.hash = underlay === "workspace" ? "#/" : `#/${underlay}`;
          }}
        />
      ) : null}
    </div>
  );
}
