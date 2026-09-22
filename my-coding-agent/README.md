# Pi desktop shell

Electron workspace for the Pi coding agent. The shell includes the main workspace, diff review, settings, onboarding, model-credential states, and the branch switcher. Copy and layout follow the Stitch screens. Session data, credentials, and git state are static placeholders.

Auth storage, a live RPC client, and a real command sandbox are not part of this shell.

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

## Pages

Routes are hashes, so they work in the browser and in the Electron window.

| Page | Open |
| --- | --- |
| Main workspace | [http://127.0.0.1:5173/#/](http://127.0.0.1:5173/#/) |
| Diff review | [#/diff](http://127.0.0.1:5173/#/diff) |
| Settings | [#/settings](http://127.0.0.1:5173/#/settings) |
| Onboarding | [#/onboarding](http://127.0.0.1:5173/#/onboarding) |
| Model credentials (six states) | [#/credentials](http://127.0.0.1:5173/#/credentials) |
| Branch switcher, clean | [#/branch](http://127.0.0.1:5173/#/branch) |
| Branch switcher, dirty worktree | `?dirty=1#/branch` |

Inside the window:

- **Fix auth token race condition** or **提交更改** opens diff review.
- **设置** opens preferences. **模型与计算** and the primary model row open credentials.
- **打开文件夹** opens the project picker. A recent project returns to the workspace.
- The **main** badge in the title bar, and the branch chip on the status bar, open the branch switcher. The switcher can flip between a clean tree and a dirty tree. It does not change the `main` chip.

## Status bar

The bottom bar shows three independent pieces: a branch chip, one engine chip, and one sandbox chip.

| Chip | States |
| --- | --- |
| Branch | `main`. It does not follow the engine or sandbox. |
| 引擎·RPC | 空闲·已连接 / 对话中 / 重连中 / 已断开. Non-idle states also read 每窗口独立进程. |
| 沙盒 | Grey **未启用**, in-progress **正在启用**, or bright **沙盒·命令隔离**. |

Hover the sandbox chip for the isolation note: it only covers terminal commands, you can still edit the current project, and it limits out-of-workspace file access plus casual network access. Press Escape during **正在启用** to return to grey **未启用**. That cancel does not open a dialog. `?policy=1` opens the sandbox note.

Click a chip to cycle the stub. The default screen is idle and sandbox on.

Query overrides:

```text
?engine=chatting&sandbox=off
?engine=reconnecting&sandbox=enabling
?engine=disconnected
```

`engine` is `idle`, `chatting`, `reconnecting`, or `disconnected`. `sandbox` is `off`, `enabling`, or `on`.
