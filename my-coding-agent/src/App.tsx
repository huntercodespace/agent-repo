import { useEffect, useState } from "react";
import { Sidebar } from "./components/Sidebar";
import { StatusBar } from "./components/StatusBar";
import { TitleBar, type RightRailTab } from "./components/TitleBar";
import { BranchCanvas } from "./pages/BranchCanvas";
import { BranchSwitcher } from "./pages/BranchSwitcher";
import { CredentialsFrame } from "./pages/CredentialsFrame";
import { DiffPage } from "./pages/DiffPage";
import { EngineStatusPage } from "./pages/EngineStatusPage";
import { OnboardingPage } from "./pages/OnboardingPage";
import { SettingsPage } from "./pages/SettingsPage";
import { StatusSpecPage } from "./pages/StatusSpecPage";
import { WorkspacePage } from "./pages/WorkspacePage";
import { useRpc } from "./rpc/RpcProvider";
import { readLocationQuery, readRoute, type Route } from "./router";
import {
  readDirtyWorktree,
  readStatusFromLocation,
  type EngineState,
  type SandboxState,
} from "./status";

function readShellFromLocation() {
  const params = readLocationQuery();
  const status = readStatusFromLocation(params);
  return {
    route: readRoute(),
    engine: status.engine,
    sandbox: status.sandbox,
    dirty: readDirtyWorktree(params),
  };
}

function shellFor(route: Route): { pad: string; side: string; bar: "workspace" | "branch" | "engine" | "none" } {
  if (route === "engine") return { pad: "pb-12", side: "bottom-12", bar: "engine" };
  if (route === "status") return { pad: "pb-0", side: "bottom-0", bar: "none" };
  if (route === "branch") return { pad: "pb-6", side: "bottom-6", bar: "branch" };
  return { pad: "pb-6", side: "bottom-6", bar: "workspace" };
}

export default function App() {
  const rpc = useRpc();
  const initial = readShellFromLocation();
  const [route, setRoute] = useState<Route>(initial.route);
  const [engine, setEngine] = useState<EngineState>(initial.engine);
  const [sandbox, setSandbox] = useState<SandboxState>(initial.sandbox);
  const [underlay, setUnderlay] = useState<Route>(initial.route === "branch" || initial.route === "onboarding" ? "workspace" : initial.route);
  const [branchDirty, setBranchDirty] = useState(initial.dirty);

  useEffect(() => {
    const sync = () => {
      const next = readShellFromLocation();
      setRoute(next.route);
      setEngine(next.engine);
      setSandbox(next.sandbox);
      setBranchDirty(next.dirty);
    };
    window.addEventListener("hashchange", sync);
    return () => window.removeEventListener("hashchange", sync);
  }, []);

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

  // Derive from route so tabs/width stay in sync on navigation (no underlay lag).
  const titleRightRail: RightRailTab | null =
    route === "diff" ? "diff"
      : route === "workspace" ? "files"
      : null;

  return (
    <div className="h-screen select-none overflow-hidden bg-surface font-body-md text-body-md text-on-surface">
      <TitleBar rightRail={titleRightRail} />
      <Sidebar route={route === "branch" ? underlay : route} bottomClass={shell.side} />
      <div className={`h-full min-h-0 pl-60 pt-10 ${shell.pad}`}>
        <div className="h-full min-h-0">{page}</div>
      </div>
      {shell.bar === "none" ? null : (
        <StatusBar
          variant={shell.bar}
          engine={engine}
          sandbox={sandbox}
          connection={rpc.status}
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
