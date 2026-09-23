/// <reference types="vite/client" />

import type { EngineSnapshot, PromptResult, RpcWireEvent } from "./rpc/types";

export interface PiDesktopApi {
  minimize: () => void;
  toggleMaximize: () => void;
  close: () => void;
  getEngineStatus: () => Promise<EngineSnapshot>;
  sendPrompt: (message: string) => Promise<PromptResult>;
  onEngineStatus: (callback: (status: EngineSnapshot) => void) => () => void;
  onRpcEvent: (callback: (event: RpcWireEvent) => void) => () => void;
}

declare global {
  interface Window {
    piDesktop?: PiDesktopApi;
  }
}
