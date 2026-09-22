# Pi desktop shell

Electron workspace for the Pi coding agent. This package is the main workspace screen: title bar, session sidebar, conversation, file inspector, and the bottom status bar.

Auth storage, a live RPC client, and a real command sandbox are not part of this shell. Session messages and the status chips are static UI state.

## Requirements

- Node.js 22+
- npm 10+

## Install

```bash
cd my-coding-agent
npm install
```

## Run

Development (Vite renderer + Electron window):

```bash
npm run dev
```

Renderer only, in a browser at `http://127.0.0.1:5173`:

```bash
npm run dev:web
```

Production build, then Electron:

```bash
npm start
```

`npm start` compiles the renderer into `dist/` and opens it in a frameless window. The traffic lights close, minimize, and maximize that window.

On Linux containers where Chromium’s sandbox cannot start, launch with:

```bash
ELECTRON_NO_SANDBOX=1 npm run dev
```

## Status bar

The bottom bar always shows two chips:

| Chip | States |
| --- | --- |
| 引擎 · RPC | 空闲 · 已连接 / 对话中 / 重连中 / 已断开. Non-idle states also read 每窗口独立进程. |
| 沙盒 | Grey **未启用** when off. Bright **沙盒 · 命令隔离** when on. |

Click a chip to cycle the stub. The default screen is idle and sandbox on, matching an agent that is ready with command isolation enabled.

Query overrides (web or Electron dev URL):

```text
?engine=chatting&sandbox=off
?engine=reconnecting
?engine=disconnected
```

`engine` is one of `idle`, `chatting`, `reconnecting`, `disconnected`. `sandbox=off` shows 未启用; any other value leaves the sandbox chip on.
