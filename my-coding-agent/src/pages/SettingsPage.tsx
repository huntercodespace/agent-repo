import { useState, type ChangeEvent } from "react";
import { ModelSelect } from "../components/ModelSelect";

export function SettingsPage() {
  const [fontSizeLabel, setFontSizeLabel] = useState("14px (Default)");

  function onFontSize(event: ChangeEvent<HTMLInputElement>) {
    const value = event.currentTarget.value;
    const suffix = value === "14" ? " (Default)" : value === "13" ? " (Compact)" : "";
    setFontSizeLabel(`${value}px${suffix}`);
  }

  return (
  <div className="relative w-full overflow-hidden h-full overflow-y-auto">
    <div className="absolute -top-24 right-1/4 w-96 h-96 rounded-full bg-primary/5 blur-3xl pointer-events-none">
    </div>
    <div className="absolute top-1/3 -left-20 w-80 h-80 rounded-full bg-secondary/5 blur-3xl pointer-events-none">
    </div>
    <div className="px-space-lg py-space-md border-b border-transparent bg-surface-container-lowest/60 backdrop-blur flex items-center justify-between">
      <div className="flex items-center gap-space-md">
        <div className="w-8 h-8 rounded-lg bg-surface-container-high flex items-center justify-center text-primary shadow-sm">
          <span className="material-symbols-outlined text-[18px]">
            tune
          </span>
        </div>
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <h1 className="font-headline-sm text-headline-sm font-semibold text-on-surface tracking-tight">
              工作区偏好设置
            </h1>
            <span className="font-code-sm text-code-sm px-1.5 py-0.5 rounded bg-surface-container text-on-surface-variant">
              Workspace Context: Local Host
            </span>
          </div>
          <span className="font-body-sm text-body-sm text-on-surface-variant">
            控制 IDE 外观视效、模型推理链路及自主执行安全沙箱策略
          </span>
        </div>
      </div>
      <div className="flex items-center gap-space-sm">
        <span className="font-code-sm text-code-sm text-outline flex items-center gap-1.5 px-space-sm py-1 rounded bg-surface-container-low">
          <span className="w-1.5 h-1.5 rounded-full bg-tertiary animate-pulse">
          </span>
          <span>
            Config Hash: #d4a991f
          </span>
        </span>
        <button className="h-8 px-space-md rounded bg-surface-container hover:bg-surface-container-high text-on-surface font-label-sm text-label-sm flex items-center gap-1.5 transition-colors" type="button">
          <span className="material-symbols-outlined text-[15px]">
            file_download
          </span>
          <span>
            导出 JSON
          </span>
        </button>
      </div>
    </div>
    <div className="grid grid-cols-12 gap-0 min-h-full">
      {/* Left Navigation Dock */}
      <nav className="col-span-12 md:col-span-3 lg:col-span-3 bg-surface-container-lowest/40 p-space-md flex flex-col justify-between">
        <div className="flex flex-col gap-space-xs">
          <div className="px-space-sm py-space-xs text-outline font-label-xs text-label-xs uppercase tracking-wider font-semibold">
            配置范畴 DOMAINS
          </div>
          <button className="w-full flex items-center gap-space-sm px-space-md py-2.5 rounded text-left transition-all text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface group" type="button">
            <span className="material-symbols-outlined text-[17px] text-outline group-hover:text-on-surface">
              settings
            </span>
            <div className="flex flex-col">
              <span className="font-label-md text-label-md">
                通用 General
              </span>
              <span className="font-code-sm text-code-sm text-outline">
                Telemetry, Updates, Sync
              </span>
            </div>
          </button>
          <button className="w-full flex items-center gap-space-sm px-space-md py-2.5 rounded text-left transition-all bg-surface-container-high text-primary shadow-sm group" type="button">
            <span className="material-symbols-outlined text-[17px] text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>
              palette
            </span>
            <div className="flex flex-col">
              <span className="font-label-md text-label-md font-semibold text-on-surface">
                外观与主题 Appearance
              </span>
              <span className="font-code-sm text-code-sm text-primary/80">
                Theme, Typography, Density
              </span>
            </div>
            <span className="material-symbols-outlined text-[16px] ml-auto text-primary">
              chevron_right
            </span>
          </button>
          <a className="w-full flex items-center gap-space-sm px-space-md py-2.5 rounded text-left transition-all text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface group" href="#/credentials">
            <span className="material-symbols-outlined text-[17px] text-outline group-hover:text-on-surface">
              psychology
            </span>
            <div className="flex flex-col">
              <span className="font-label-md text-label-md">
                模型与计算 Models &amp; Inference
              </span>
              <span className="font-code-sm text-code-sm text-outline">
                Routing, Reasoning, Context
              </span>
            </div>
          </a>
          <button className="w-full flex items-center gap-space-sm px-space-md py-2.5 rounded text-left transition-all text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface group" type="button">
            <span className="material-symbols-outlined text-[17px] text-outline group-hover:text-on-surface">
              shield
            </span>
            <div className="flex flex-col">
              <span className="font-label-md text-label-md">
                权限与安全沙箱 Permissions
              </span>
              <span className="font-code-sm text-code-sm text-outline">
                Terminal, Shell, File Guards
              </span>
            </div>
          </button>
          <button className="w-full flex items-center gap-space-sm px-space-md py-2.5 rounded text-left transition-all text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface group" type="button">
            <span className="material-symbols-outlined text-[17px] text-outline group-hover:text-on-surface">
              keyboard
            </span>
            <div className="flex flex-col">
              <span className="font-label-md text-label-md">
                快捷键 Keybindings
              </span>
              <span className="font-code-sm text-code-sm text-outline">
                Vim mode, Hotkeys
              </span>
            </div>
          </button>
          <button className="w-full flex items-center gap-space-sm px-space-md py-2.5 rounded text-left transition-all text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface group" type="button">
            <span className="material-symbols-outlined text-[17px] text-outline group-hover:text-on-surface">
              hub
            </span>
            <div className="flex flex-col">
              <span className="font-label-md text-label-md">
                扩展与 MCP 服务 Plugins &amp; MCP
              </span>
              <span className="font-code-sm text-code-sm text-outline">
                Model Context Protocol
              </span>
            </div>
            <span className="font-code-sm text-code-sm px-1.5 py-0.2 rounded bg-tertiary-container/30 text-tertiary ml-auto">
              3 Active
            </span>
          </button>
        </div>
        <div className="mt-space-lg p-space-md rounded-xl bg-surface-container-low flex flex-col gap-2">
          <div className="flex items-center justify-between text-on-surface-variant">
            <span className="font-label-xs text-label-xs uppercase font-semibold">
              沙箱负载度量
            </span>
            <span className="font-code-sm text-code-sm text-tertiary">
              99.8% Isolation
            </span>
          </div>
          <div className="w-full bg-surface-container-highest h-1.5 rounded-full overflow-hidden">
            <div className="bg-primary h-full rounded-full" style={{ width: "32%" }}>
            </div>
          </div>
          <span className="font-code-sm text-code-sm text-outline">
            Memory Cap: 4.0GB / 16.0GB
          </span>
        </div>
      </nav>
      {/* Right Main Workspace */}
      <div className="col-span-12 md:col-span-9 lg:col-span-9 p-space-xl overflow-y-auto space-y-space-xl">
        {/* Section 1: 外观与主题 */}
        <section className="flex flex-col gap-space-md bg-surface-container-low p-space-xl rounded-xl shadow-sm">
          <div className="flex items-center justify-between pb-space-xs">
            <div className="flex items-center gap-space-sm">
              <span className="material-symbols-outlined text-primary text-[20px]">
                palette
              </span>
              <h2 className="font-headline-sm text-headline-sm font-semibold text-on-surface">
                外观与主题 Appearance
              </h2>
            </div>
            <span className="font-code-sm text-code-sm px-2 py-0.5 rounded bg-surface-container-high text-on-surface-variant">
              Active Variant: Dark Core
            </span>
          </div>
          {/* Theme Selectors */}
          <div className="flex flex-col gap-space-xs">
            <label className="font-label-sm text-label-sm text-on-surface-variant uppercase font-semibold tracking-wide">
              工作区配色风格 Theme Preset
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-space-md pt-space-xs">
              {/* Option 1 (Selected) */}
              <div className="p-space-md rounded-lg bg-surface-container-high shadow-md flex flex-col gap-space-sm relative cursor-pointer group">
                <div className="absolute top-2 right-2 w-4 h-4 rounded-full bg-primary flex items-center justify-center text-on-primary">
                  <span className="material-symbols-outlined text-[11px] font-bold">
                    check
                  </span>
                </div>
                <div className="h-16 rounded bg-surface-container-lowest p-2 flex flex-col justify-between">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 rounded-full bg-[#ff5f56]">
                    </span>
                    <span className="w-2 h-2 rounded-full bg-[#ffbd2e]">
                    </span>
                    <span className="w-2 h-2 rounded-full bg-[#27c93f]">
                    </span>
                  </div>
                  <div className="flex gap-1 items-center">
                    <span className="w-12 h-1.5 rounded bg-primary/70">
                    </span>
                    <span className="w-6 h-1.5 rounded bg-secondary/50">
                    </span>
                  </div>
                </div>
                <div>
                  <div className="font-label-md text-label-md text-on-surface font-semibold flex items-center gap-1.5">
                    <span>
                      Deep Charcoal
                    </span>
                    <span className="font-code-sm text-code-sm text-tertiary font-normal">
                      默认
                    </span>
                  </div>
                  <p className="font-body-sm text-body-sm text-outline line-clamp-1">
                    低反差无眩光工程暗阶
                  </p>
                </div>
              </div>
              {/* Option 2 */}
              <div className="p-space-md rounded-lg bg-surface-container hover:bg-surface-container-high transition-colors flex flex-col gap-space-sm cursor-pointer group">
                <div className="h-16 rounded bg-[#000000] p-2 flex flex-col justify-between">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 rounded-full bg-surface-variant">
                    </span>
                    <span className="w-2 h-2 rounded-full bg-surface-variant">
                    </span>
                  </div>
                  <div className="flex gap-1 items-center">
                    <span className="w-8 h-1.5 rounded bg-on-surface">
                    </span>
                    <span className="w-10 h-1.5 rounded bg-outline-variant">
                    </span>
                  </div>
                </div>
                <div>
                  <div className="font-label-md text-label-md text-on-surface font-semibold">
                    Midnight OLED
                  </div>
                  <p className="font-body-sm text-body-sm text-outline line-clamp-1">
                    纯黑像素极昼对比
                  </p>
                </div>
              </div>
              {/* Option 3 */}
              <div className="p-space-md rounded-lg bg-surface-container hover:bg-surface-container-high transition-colors flex flex-col gap-space-sm cursor-pointer group">
                <div className="h-16 rounded bg-[#161c24] p-2 flex flex-col justify-between">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 rounded-full bg-secondary">
                    </span>
                  </div>
                  <div className="flex gap-1 items-center">
                    <span className="w-10 h-1.5 rounded bg-secondary-fixed-dim">
                    </span>
                    <span className="w-4 h-1.5 rounded bg-secondary-container">
                    </span>
                  </div>
                </div>
                <div>
                  <div className="font-label-md text-label-md text-on-surface font-semibold">
                    Nordic Slate
                  </div>
                  <p className="font-body-sm text-body-sm text-outline line-clamp-1">
                    北欧清冽灰蓝冷调
                  </p>
                </div>
              </div>
              {/* Option 4 */}
              <div className="p-space-md rounded-lg bg-surface-container hover:bg-surface-container-high transition-colors flex flex-col gap-space-sm cursor-pointer group">
                <div className="h-16 rounded bg-gradient-to-r from-surface-container-lowest to-surface-bright p-2 flex flex-col justify-between">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 rounded-full bg-outline">
                    </span>
                  </div>
                  <div className="flex gap-1 items-center">
                    <span className="w-12 h-1.5 rounded bg-on-surface-variant">
                    </span>
                  </div>
                </div>
                <div>
                  <div className="font-label-md text-label-md text-on-surface font-semibold">
                    Sync System
                  </div>
                  <p className="font-body-sm text-body-sm text-outline line-clamp-1">
                    随操作系统明暗自动流转
                  </p>
                </div>
              </div>
            </div>
          </div>
          {/* Typography & Scale Matrix */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-space-lg pt-space-sm">
            <div className="flex flex-col gap-space-xs">
              <label className="font-label-sm text-label-sm text-on-surface-variant uppercase font-semibold">
                字体家族 Font Family
              </label>
              <div className="flex items-center gap-space-sm">
                <div className="flex-1 h-9 rounded bg-surface-container px-space-md flex items-center justify-between">
                  <span className="font-code-md text-code-md text-on-surface">
                    JetBrains Mono (Code)
                  </span>
                  <span className="material-symbols-outlined text-outline text-[16px]">
                    expand_more
                  </span>
                </div>
                <div className="flex-1 h-9 rounded bg-surface-container px-space-md flex items-center justify-between">
                  <span className="font-body-md text-body-md text-on-surface">
                    Inter / PingFang (UI)
                  </span>
                  <span className="material-symbols-outlined text-outline text-[16px]">
                    expand_more
                  </span>
                </div>
              </div>
              <span className="font-code-sm text-code-sm text-outline">
                渲染引擎: HarfBuzz 连字支持 (FiraCode/JetBrains Ligatures Enabled)
              </span>
            </div>
            <div className="flex flex-col gap-space-xs">
              <div className="flex items-center justify-between">
                <label className="font-label-sm text-label-sm text-on-surface-variant uppercase font-semibold">
                  代码与界面字号 Font Size
                </label>
                <span className="font-code-sm text-code-sm text-primary font-medium" id="fontSizeVal">
                  {fontSizeLabel}
                </span>
              </div>
              <div className="h-9 flex items-center gap-space-md">
                <span className="font-code-sm text-code-sm text-outline">
                  12px
                </span>
                <input className="w-full accent-primary bg-surface-container-high h-1.5 rounded-lg appearance-none cursor-pointer" max="18" min="12" type="range" defaultValue={ "14" } onChange={onFontSize} />
                <span className="font-code-sm text-code-sm text-outline">
                  18px
                </span>
              </div>
              <span className="font-code-sm text-code-sm text-outline">
                行高比率: 1.55x Strict Baseline Grid
              </span>
            </div>
          </div>
          {/* Window Density */}
          <div className="flex flex-col gap-space-xs pt-space-xs">
            <label className="font-label-sm text-label-sm text-on-surface-variant uppercase font-semibold">
              界面密度 Window Density
            </label>
            <div className="flex items-center gap-space-sm max-w-md">
              <button className="flex-1 h-8 rounded bg-surface-container hover:bg-surface-container-high text-on-surface-variant font-label-sm text-label-sm flex items-center justify-center gap-2 transition-colors" type="button">
                <span className="material-symbols-outlined text-[15px]">
                  density_small
                </span>
                <span>
                  紧凑 Compact (4px grid)
                </span>
              </button>
              <button className="flex-1 h-8 rounded bg-primary text-on-primary font-label-sm text-label-sm font-semibold flex items-center justify-center gap-2 shadow-sm" type="button">
                <span className="material-symbols-outlined text-[15px]">
                  density_medium
                </span>
                <span>
                  舒适 Cozy (8px/12px)
                </span>
              </button>
            </div>
          </div>
        </section>
        {/* Section 2: 模型与推理配置 */}
        <section className="flex flex-col gap-space-md bg-surface-container-low p-space-xl rounded-xl shadow-sm">
          <div className="flex items-center justify-between pb-space-xs">
            <div className="flex items-center gap-space-sm">
              <span className="material-symbols-outlined text-secondary text-[20px]">
                cognition
              </span>
              <h2 className="font-headline-sm text-headline-sm font-semibold text-on-surface">
                模型与推理配置 Models &amp; Inference
              </h2>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-tertiary animate-pulse">
              </span>
              <span className="font-code-sm text-code-sm text-tertiary">
                Inference Gateway: Ready (24ms)
              </span>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-space-lg">
            {/* Main Model */}
            <div className="flex flex-col gap-space-xs">
              <label className="font-label-sm text-label-sm text-on-surface-variant uppercase font-semibold">
                默认主模型 Primary Agent Model
              </label>
              <ModelSelect variant="field" fallback="Pi-Sonnet-3.5" />
              <span className="font-code-sm text-code-sm text-outline">
                保存 DeepSeek API Key 后，主进程会调用 set_model，切到 DeepSeek Flash（deepseek / deepseek-v4-flash）。
                <a className="ml-2 text-primary hover:underline" href="#/credentials">管理密钥</a>
              </span>
            </div>
            {/* Fast Model */}
            <div className="flex flex-col gap-space-xs">
              <label className="font-label-sm text-label-sm text-on-surface-variant uppercase font-semibold">
                备用极速模型 Fallback / Speed Model
              </label>
              <div className="h-10 rounded bg-surface-container px-space-md flex items-center justify-between cursor-pointer hover:bg-surface-container-high transition-colors">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-secondary">
                  </span>
                  <span className="font-code-sm text-code-sm text-on-surface font-semibold">
                    Pi-Haiku-Fast
                  </span>
                  <span className="font-label-xs text-label-xs text-on-surface-variant font-normal">
                    (Low latency autocomplete)
                  </span>
                </div>
                <span className="material-symbols-outlined text-outline text-[16px]">
                  unfold_more
                </span>
              </div>
              <span className="font-code-sm text-code-sm text-outline">
                行内代码预测补全及次秒级单行指令解析
              </span>
            </div>
          </div>
          {/* Context & Reasoning Effort */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-space-lg pt-space-xs">
            {/* Context Window */}
            <div className="flex flex-col gap-space-xs">
              <div className="flex items-center justify-between">
                <label className="font-label-sm text-label-sm text-on-surface-variant uppercase font-semibold">
                  最大上下文窗口 Context Window
                </label>
                <span className="font-code-sm text-code-sm text-secondary font-semibold">
                  128,000 tokens
                </span>
              </div>
              <div className="h-10 rounded bg-surface-container px-space-md flex items-center justify-between">
                <span className="font-code-md text-code-md text-on-surface">
                  128k (Dynamic Compression Active)
                </span>
                <span className="material-symbols-outlined text-outline text-[16px]">
                  compress
                </span>
              </div>
              <span className="font-code-sm text-code-sm text-outline">
                自动触发 RAG 语意剪枝以控制单次推理 Token 账单
              </span>
            </div>
            {/* Reasoning Effort */}
            <div className="flex flex-col gap-space-xs">
              <label className="font-label-sm text-label-sm text-on-surface-variant uppercase font-semibold">
                深度思考 (Reasoning Effort)
              </label>
              <div className="grid grid-cols-3 gap-space-xs h-10">
                <button className="rounded bg-surface-container hover:bg-surface-container-high text-on-surface-variant font-label-sm text-label-sm flex items-center justify-center transition-colors" type="button">
                  关 Off
                </button>
                <button className="rounded bg-surface-container hover:bg-surface-container-high text-on-surface-variant font-label-sm text-label-sm flex items-center justify-center transition-colors" type="button">
                  中 Medium
                </button>
                <button className="rounded bg-primary-container text-on-primary-container font-label-sm text-label-sm font-semibold flex items-center justify-center gap-1 shadow-sm" type="button">
                  <span className="material-symbols-outlined text-[14px]">
                    auto_awesome
                  </span>
                  <span>
                    高 (深入推理)
                  </span>
                </button>
              </div>
              <span className="font-code-sm text-code-sm text-outline">
                针对复杂 Race Condition 与并发 死锁推导分配更多思维链预算
              </span>
            </div>
          </div>
        </section>
        {/* Section 3: 安全与命令执行权限 (Security Sandbox) */}
        <section className="flex flex-col gap-space-md bg-surface-container-low p-space-xl rounded-xl shadow-sm">
          <div className="flex items-center justify-between pb-space-xs">
            <div className="flex items-center gap-space-sm">
              <span className="material-symbols-outlined text-tertiary text-[20px]">
                security
              </span>
              <h2 className="font-headline-sm text-headline-sm font-semibold text-on-surface">
                安全与命令执行权限 (Security Sandbox)
              </h2>
            </div>
            <span className="font-code-sm text-code-sm px-2 py-0.5 rounded bg-tertiary-container/20 text-tertiary font-medium">
              Policy: Strict Read-Safe
            </span>
          </div>
          {/* Radio List */}
          <div className="flex flex-col gap-space-sm">
            <label className="font-label-sm text-label-sm text-on-surface-variant uppercase font-semibold">
              终端命令执行策略 Execution Policy
            </label>
            {/* Policy 1 (Recommended) */}
            <label className="flex items-start gap-space-md p-space-md rounded-lg bg-surface-container-high cursor-pointer transition-colors group">
              <div className="pt-0.5">
                <div className="w-4 h-4 rounded-full bg-primary flex items-center justify-center text-on-primary">
                  <span className="w-1.5 h-1.5 rounded-full bg-surface-container-lowest">
                  </span>
                </div>
              </div>
              <div className="flex flex-col gap-0.5">
                <div className="flex items-center gap-2">
                  <span className="font-label-md text-label-md font-semibold text-on-surface">
                    自动执行低风险只读命令，破坏性写操作需弹窗确认
                  </span>
                  <span className="font-code-sm text-code-sm px-1.5 py-0.2 rounded bg-tertiary-container/30 text-tertiary font-medium">
                    推荐
                  </span>
                </div>
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                  允许 Agent 自主执行 
                  <code className="font-code-sm text-code-sm text-secondary bg-surface-container px-1 py-0.5 rounded">
                    git status
                  </code>
                  , 
                  <code className="font-code-sm text-code-sm text-secondary bg-surface-container px-1 py-0.5 rounded">
                    cat
                  </code>
                  , 
                  <code className="font-code-sm text-code-sm text-secondary bg-surface-container px-1 py-0.5 rounded">
                    ls
                  </code>
                  , 
                  <code className="font-code-sm text-code-sm text-secondary bg-surface-container px-1 py-0.5 rounded">
                    npm test
                  </code>
                  。涉及文件写入、删除或网络上传前挂起并通知用户。
                </p>
              </div>
            </label>
            {/* Policy 2 */}
            <label className="flex items-start gap-space-md p-space-md rounded-lg bg-surface-container hover:bg-surface-container-high cursor-pointer transition-colors group">
              <div className="pt-0.5">
                <div className="w-4 h-4 rounded-full bg-surface-variant flex items-center justify-center group-hover:bg-outline-variant">
                </div>
              </div>
              <div className="flex flex-col gap-0.5">
                <div className="flex items-center gap-2">
                  <span className="font-label-md text-label-md font-medium text-on-surface">
                    完全自主模式 (Autonomous Full Velocity)
                  </span>
                  <span className="font-code-sm text-code-sm px-1.5 py-0.2 rounded bg-error-container text-error font-medium">
                    高权限风险
                  </span>
                </div>
                <p className="font-body-sm text-body-sm text-outline">
                  所有终端命令及依赖安装直接后台执行。严格要求在独立 Docker 容器或临时 VM 中运行，防止宿主环境污染。
                </p>
              </div>
            </label>
            {/* Policy 3 */}
            <label className="flex items-start gap-space-md p-space-md rounded-lg bg-surface-container hover:bg-surface-container-high cursor-pointer transition-colors group">
              <div className="pt-0.5">
                <div className="w-4 h-4 rounded-full bg-surface-variant flex items-center justify-center group-hover:bg-outline-variant">
                </div>
              </div>
              <div className="flex flex-col gap-0.5">
                <div className="flex items-center gap-2">
                  <span className="font-label-md text-label-md font-medium text-on-surface">
                    严格审批模式 (Zero Trust Step-by-step)
                  </span>
                </div>
                <p className="font-body-sm text-body-sm text-outline">
                  Agent 构想的每一次命令执行、单行 diff 补丁生成与环境探测均需逐条人工敲击 ↵ 确认。
                </p>
              </div>
            </label>
          </div>
          {/* Sensitive File Whitelist */}
          <div className="flex flex-col gap-space-xs pt-space-xs">
            <label className="font-label-sm text-label-sm text-on-surface-variant uppercase font-semibold">
              敏感文件保护白名单 Sensitive File Guards
            </label>
            <div className="p-space-md rounded-lg bg-surface-container flex flex-col gap-space-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-outline text-[16px]">
                    lock
                  </span>
                  <span className="font-body-sm text-body-sm text-on-surface">
                    默认屏蔽读取的环境机密文件：
                  </span>
                </div>
                <span className="font-code-sm text-code-sm text-tertiary">
                  已启用模式过滤 (Regex Active)
                </span>
              </div>
              <div className="flex flex-wrap gap-space-xs items-center">
                <span className="font-code-sm text-code-sm px-2 py-1 rounded bg-surface-container-high text-on-surface flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[13px] text-error">
                    key
                  </span>
                  <span>
                    .env
                  </span>
                  <span className="material-symbols-outlined text-[13px] text-outline hover:text-on-surface cursor-pointer">
                    close
                  </span>
                </span>
                <span className="font-code-sm text-code-sm px-2 py-1 rounded bg-surface-container-high text-on-surface flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[13px] text-error">
                    key
                  </span>
                  <span>
                    .env.production
                  </span>
                  <span className="material-symbols-outlined text-[13px] text-outline hover:text-on-surface cursor-pointer">
                    close
                  </span>
                </span>
                <span className="font-code-sm text-code-sm px-2 py-1 rounded bg-surface-container-high text-on-surface flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[13px] text-error">
                    vpn_key
                  </span>
                  <span>
                    id_rsa
                  </span>
                  <span className="material-symbols-outlined text-[13px] text-outline hover:text-on-surface cursor-pointer">
                    close
                  </span>
                </span>
                <span className="font-code-sm text-code-sm px-2 py-1 rounded bg-surface-container-high text-on-surface flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[13px] text-error">
                    vpn_key
                  </span>
                  <span>
                    id_ed25519
                  </span>
                  <span className="material-symbols-outlined text-[13px] text-outline hover:text-on-surface cursor-pointer">
                    close
                  </span>
                </span>
                <span className="font-code-sm text-code-sm px-2 py-1 rounded bg-surface-container-high text-on-surface flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[13px] text-outline">
                    description
                  </span>
                  <span>
                    *.pem
                  </span>
                  <span className="material-symbols-outlined text-[13px] text-outline hover:text-on-surface cursor-pointer">
                    close
                  </span>
                </span>
                <button className="h-7 px-2.5 rounded bg-surface-container-highest hover:bg-surface-bright text-on-surface font-label-xs text-label-xs flex items-center gap-1 transition-colors" type="button">
                  <span className="material-symbols-outlined text-[14px]">
                    add
                  </span>
                  <span>
                    添加规则模式
                  </span>
                </button>
              </div>
              <span className="font-code-sm text-code-sm text-outline">
                Agent 尝试触碰上述路径将立即截断 AST 流，并输出安全合规审计警告。
              </span>
            </div>
          </div>
        </section>
      </div>
    </div>
    {/* Bottom Sticky Save Bar */}
    <div className="sticky bottom-0 left-0 right-0 h-14 bg-surface-container-lowest/90 backdrop-blur px-space-xl flex items-center justify-between shadow-xl z-20">
      <div className="flex items-center gap-space-md">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-tertiary">
          </span>
          <span className="font-label-sm text-label-sm font-semibold text-on-surface">
            已自动保存 (Auto-saved)
          </span>
        </div>
        <span className="text-outline font-code-sm text-code-sm">
          |
        </span>
        <span className="font-code-sm text-code-sm text-on-surface-variant">
          变更已实时热重载至 active runtime
        </span>
      </div>
      <div className="flex items-center gap-space-sm">
        <button className="h-8 px-space-md rounded bg-surface-container hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface font-label-sm text-label-sm flex items-center gap-1.5 transition-colors" type="button">
          <span className="material-symbols-outlined text-[15px]">
            restart_alt
          </span>
          <span>
            重置为默认值 (Restore Defaults)
          </span>
        </button>
        <button className="h-8 px-space-lg rounded bg-primary text-on-primary hover:bg-primary-container hover:text-on-primary-container font-label-sm text-label-sm font-semibold flex items-center gap-1.5 shadow-sm transition-colors" type="button">
          <span className="material-symbols-outlined text-[15px]">
            check
          </span>
          <span>
            同步到远程团队策略
          </span>
        </button>
      </div>
    </div>
  </div>
  );
}
