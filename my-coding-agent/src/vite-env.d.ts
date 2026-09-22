/// <reference types="vite/client" />

export interface PiDesktopApi {
  minimize: () => void;
  toggleMaximize: () => void;
  close: () => void;
}

declare global {
  interface Window {
    piDesktop?: PiDesktopApi;
  }
}
