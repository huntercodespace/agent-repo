/// <reference types="vite/client" />

import type { CredentialBroadcast, EnvHit, OAuthEvent, ProviderInfo, ProviderStatus, SelectedModel, SetModelResult } from "./credentials/types";
import type { EngineSnapshot, PromptResult, RpcWireEvent, SessionSummary, SessionView, WorkspaceActionResult, WorkspaceState } from "./rpc/types";

export interface PiDesktopApi {
  minimize: () => void;
  toggleMaximize: () => void;
  close: () => void;
  getEngineStatus: () => Promise<EngineSnapshot>;
  sendPrompt: (message: string) => Promise<PromptResult>;
  listSessions: () => Promise<SessionSummary[]>;
  getSessionView: () => Promise<SessionView>;
  changeSession: (sessionId: string | null) => Promise<SessionView>;
  listWorkspaces: () => Promise<WorkspaceState>;
  addWorkspace: () => Promise<WorkspaceActionResult>;
  switchWorkspace: (cwd: string) => Promise<WorkspaceActionResult>;
  onWorkspacesChanged: (callback: (state: WorkspaceState) => void) => () => void;
  onEngineStatus: (callback: (status: EngineSnapshot) => void) => () => void;
  onRpcEvent: (callback: (event: RpcWireEvent) => void) => () => void;
  listProviders: () => Promise<ProviderInfo[]>;
  getCredentialStatus: () => Promise<ProviderStatus[]>;
  saveApiKey: (providerId: string, apiKey: string) => Promise<ProviderStatus>;
  clearCredential: (providerId: string) => Promise<ProviderStatus>;
  startOAuth: (providerId: string) => Promise<ProviderStatus>;
  logoutOAuth: (providerId: string) => Promise<ProviderStatus>;
  detectEnv: (providerId?: string) => Promise<EnvHit[]>;
  onOAuthEvent: (callback: (event: OAuthEvent) => void) => () => void;
  onCredentialStatus: (callback: (payload: CredentialBroadcast) => void) => () => void;
  getSelectedModel: () => Promise<SelectedModel>;
  setSelectedModel: (providerId: string, modelId: string) => Promise<SetModelResult>;
  onSelectedModel: (callback: (model: SetModelResult) => void) => () => void;
}

declare global {
  interface Window {
    piDesktop?: PiDesktopApi;
  }
}
