import { useEffect, useState } from "react";
import { Sidebar } from "./components/Sidebar";
import { StatusBar } from "./components/StatusBar";
import { TitleBar } from "./components/TitleBar";
import { BranchCanvas } from "./pages/BranchCanvas";
import { BranchSwitcher } from "./pages/BranchSwitcher";
import { CredentialsFrame } from "./pages/CredentialsFrame";
import { DiffPage } from "./pages/DiffPage";
import { EngineStatusPage } from "./pages/EngineStatusPage";
import { OnboardingPage } from "./pages/OnboardingPage";
import { SettingsPage } from "./pages/SettingsPage";
import { StatusSpecPage } from "./pages/StatusSpecPage";
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

function shellFor(route: Route): { pad: string; side: string; bar: "workspace" | "branch" | "engine" | "none" } {
  if (route === "engine") return { pad: "pb-12", side: "bottom-12", bar: "engine" };
  if (route === "status") return { pad: "pb-0", side: "bottom-0", bar: "none" };
  if (route === "branch") return { pad: "pb-6", side: "bottom-6", bar: "branch" };
  return { pad: "pb-6", side: "bottom-6", bar: "workspace" };
}

export default function App() {
  const route = useRoute();
  const initial = readStatusFromLocation();
  const [engine, setEngine] = useState<EngineState>(initial.engine);
  const [sandbox, setSandbox] = useState<SandboxState>(initial.sandbox);
  const [underlay, setUnderlay] = useState<Route>(route === "branch" || route === "onboarding" ? "workspace" : route);
  const [branchDirty, setBranchDirty] = useState(
    () => new URLSearchParams(window.location.search).get("dirty") !== "0",
  );

  useEffect(() => {
    if (route !== "branch" && route !== "onboarding" && route !== "credentials") setUnderlay(route);
  }, [route]);

  useEffect(() => {
    if (sandbox !== "enabling") return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      event.preventDefault();
      setSandbox("off");
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [sandbox]);

  if (route === "onboarding") {
    return (
      <div className="h-screen overflow-hidden bg-surface font-body-md text-body-md text-on-surface">
        <OnboardingPage />
      </div>
    );
  }

  if (route === "credentials") {
    return <CredentialsFrame />;
  }

  const shell = shellFor(route);
  const page = route === "branch" ? <BranchCanvas />
    : underlay === "diff" ? <DiffPage />
    : underlay === "settings" ? <SettingsPage />
    : underlay === "status" ? <StatusSpecPage />
    : underlay === "engine" ? <EngineStatusPage />
    : <WorkspacePage />;

  return (
    <div className="h-screen select-none overflow-hidden bg-surface font-body-md text-body-md text-on-surface">
      <TitleBar />
      <Sidebar route={route === "branch" ? underlay : route} bottomClass={shell.side} />
      <div className={`h-full min-h-0 pl-60 pt-10 ${shell.pad}`}>
        <div className="h-full min-h-0">{page}</div>
      </div>
      {shell.bar === "none" ? null : (
        <StatusBar
          variant={shell.bar}
          engine={engine}
          sandbox={sandbox}
          onEngineChange={setEngine}
          onSandboxChange={setSandbox}
        />
      )}
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
