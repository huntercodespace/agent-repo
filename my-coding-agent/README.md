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
| Branch switcher, dirty worktree | [#/branch](http://127.0.0.1:5173/#/branch) |
| Branch switcher, clean | [#/branch?dirty=0](http://127.0.0.1:5173/#/branch?dirty=0) |
| Status bar spec | [#/status](http://127.0.0.1:5173/#/status) |
| Engine status | [#/engine](http://127.0.0.1:5173/#/engine) |

Inside the window:

- **Fix auth token race condition** or **提交更改** opens diff review.
- **设置** opens preferences. **模型与计算** and the primary model row open credentials.
- **打开文件夹** opens the project picker. A recent project returns to the workspace.
- The **main** badge in the title bar, and the branch chip on the status bar, open the branch switcher. It opens on the dirty worktree from the HTML export. `#/branch?dirty=0` hides that warning. A real search string still works (`?dirty=0#/branch`). **刷新** toggles the warning. The chip stays `main*`.
- **已消耗 4.2k tokens** on the workspace footer opens the status-bar spec. **延迟 24ms** opens the engine status screen. **Git: main** and the title-bar branch chip open the branch switcher.

## Status bar

Workspace, diff, and settings use the 24px footer from those screens: `Git: main ✓ | Pi Engine: v2.4 (Ready) | 权限: 自动执行 (安全模式)`. Credentials uses its own footer (`凭据存储: 本地 AuthStorage 就绪`). The branch screen uses `⎇ main`.

`#/engine` uses the taller status bar: four engine chips at once, plus a sandbox chip.

| Chip | States |
| --- | --- |
| 引擎 · RPC | 空闲 · 已连接 / 对话中 / 重连中 / 已断开. Each chip keeps the subtitle 每窗口独立进程. Click one to mark it active. |
| 沙盒 | Grey **沙盒 · 未启用**, in-progress **沙盒 · 正在启用**, or bright **沙盒 · 命令隔离**. |

Click the sandbox chip to cycle the stub. Press Escape during **正在启用** to return to grey **沙盒 · 未启用**. That cancel does not open a dialog. Hover the chip while it is on for the 沙盒隔离策略 note. `#/engine?policy=1` (or `?policy=1`) opens that note when the sandbox is on. The default is idle and sandbox off.

Query overrides live in the hash, and the same keys in `location.search` still apply. A hash key wins when both set it.

```text
#/engine?engine=chatting&sandbox=off
#/engine?engine=reconnecting&sandbox=enabling
#/engine?engine=disconnected
#/engine?sandbox=on&policy=1
```

`engine` is `idle`, `chatting`, `reconnecting`, or `disconnected`. `sandbox` is `off`, `enabling`, or `on`. Changing the hash re-reads `engine`, `sandbox`, `dirty`, and `policy` without a reload.
