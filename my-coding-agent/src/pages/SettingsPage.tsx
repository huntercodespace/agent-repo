import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { Icon } from "../components/Icon";
import { ModelSelect } from "../components/ModelSelect";
import { useCredentialBoard } from "../credentials/board";

type SettingsDomain = "general" | "appearance" | "models" | "permissions" | "keybindings" | "plugins";

function navItemClass(active: boolean) {
  return active
    ? "w-full flex items-center gap-space-sm px-space-md py-2.5 rounded text-left transition-all bg-surface-container-high text-primary shadow-sm group"
    : "w-full flex items-center gap-space-sm px-space-md py-2.5 rounded text-left transition-all text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface group";
}

export function SettingsPage() {
  const board = useCredentialBoard();
  const flashModelId = board.providers.find((provider) => provider.id === "deepseek")?.flashModelId ?? null;
  const [fontSizeLabel, setFontSizeLabel] = useState("14px (Default)");
  const [activeDomain, setActiveDomain] = useState<SettingsDomain>("appearance");
  const contentScrollerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    contentScrollerRef.current?.scrollTo({ top: 0 });
  }, [activeDomain]);

  function onFontSize(event: ChangeEvent<HTMLInputElement>) {
    const value = event.currentTarget.value;
    const suffix = value === "14" ? " (Default)" : value === "13" ? " (Compact)" : "";
    setFontSizeLabel(`${value}px${suffix}`);
  }

  return (
  <div className="relative flex h-full min-h-0 w-full flex-col overflow-hidden">
    <div className="pointer-events-none absolute -top-24 right-1/4 h-96 w-96 rounded-full bg-primary/5 blur-3xl">
    </div>
    <div className="pointer-events-none absolute top-1/3 -left-20 h-80 w-80 rounded-full bg-secondary/5 blur-3xl">
    </div>
    <header className="relative z-10 flex shrink-0 items-center justify-between border-b border-outline-variant/20 bg-surface-container-lowest/60 px-space-lg py-space-md backdrop-blur">
      <div className="flex items-center gap-space-md">
        <div className="w-8 h-8 rounded-lg bg-surface-container-high flex items-center justify-center text-primary shadow-sm">
          <Icon name="tune" className="text-[18px]" />
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
          <Icon name="file_download" className="text-[15px]" />
          <span>
            导出 JSON
          </span>
        </button>
      </div>
    </header>
    <div className="relative flex min-h-0 flex-1 overflow-hidden">
      {/* Left Navigation Dock */}
      <nav className="hidden shrink-0 flex-col justify-between overflow-y-auto border-r border-outline-variant/20 bg-surface-container-lowest/40 p-space-md md:flex md:w-[280px] lg:w-[300px]">
        <div className="flex flex-col gap-space-xs">
          <div className="px-space-sm py-space-xs text-outline font-label-xs text-label-xs uppercase tracking-wider font-semibold">
            配置范畴 DOMAINS
          </div>
          <button type="button" onClick={() => setActiveDomain("general")} className={navItemClass(activeDomain === "general")}>
            <Icon name="settings" className={`text-[17px] ${activeDomain === "general" ? "text-primary" : "text-outline group-hover:text-on-surface"}`} />
            <div className="flex flex-col">
              <span className={`font-label-md text-label-md ${activeDomain === "general" ? "font-semibold text-on-surface" : ""}`}>
                通用 General
              </span>
              <span className={`font-code-sm text-code-sm ${activeDomain === "general" ? "text-primary/80" : "text-outline"}`}>
                Telemetry, Updates, Sync
              </span>
            </div>
            {activeDomain === "general" ? <Icon name="chevron_right" className="ml-auto text-[16px] text-primary" /> : null}
          </button>
          <button type="button" onClick={() => setActiveDomain("appearance")} className={navItemClass(activeDomain === "appearance")}>
            <Icon name="palette" className={`text-[17px] ${activeDomain === "appearance" ? "text-primary" : "text-outline group-hover:text-on-surface"}`} fill={activeDomain === "appearance"} />
            <div className="flex flex-col">
              <span className={`font-label-md text-label-md ${activeDomain === "appearance" ? "font-semibold text-on-surface" : ""}`}>
                外观与主题 Appearance
              </span>
              <span className={`font-code-sm text-code-sm ${activeDomain === "appearance" ? "text-primary/80" : "text-outline"}`}>
                Theme, Typography, Density
              </span>
            </div>
            {activeDomain === "appearance" ? <Icon name="chevron_right" className="ml-auto text-[16px] text-primary" /> : null}
          </button>
          <button type="button" onClick={() => setActiveDomain("models")} className={navItemClass(activeDomain === "models")}>
            <Icon name="psychology" className={`text-[17px] ${activeDomain === "models" ? "text-primary" : "text-outline group-hover:text-on-surface"}`} />
            <div className="flex flex-col">
              <span className={`font-label-md text-label-md ${activeDomain === "models" ? "font-semibold text-on-surface" : ""}`}>
                模型与计算 Models &amp; Inference
              </span>
              <span className={`font-code-sm text-code-sm ${activeDomain === "models" ? "text-primary/80" : "text-outline"}`}>
                Routing, Reasoning, Context
              </span>
            </div>
            {activeDomain === "models" ? <Icon name="chevron_right" className="ml-auto text-[16px] text-primary" /> : null}
          </button>
          <button type="button" onClick={() => setActiveDomain("permissions")} className={navItemClass(activeDomain === "permissions")}>
            <Icon name="shield" className={`text-[17px] ${activeDomain === "permissions" ? "text-primary" : "text-outline group-hover:text-on-surface"}`} />
            <div className="flex flex-col">
              <span className={`font-label-md text-label-md ${activeDomain === "permissions" ? "font-semibold text-on-surface" : ""}`}>
                权限与安全沙箱 Permissions
              </span>
              <span className={`font-code-sm text-code-sm ${activeDomain === "permissions" ? "text-primary/80" : "text-outline"}`}>
                Terminal, Shell, File Guards
              </span>
            </div>
            {activeDomain === "permissions" ? <Icon name="chevron_right" className="ml-auto text-[16px] text-primary" /> : null}
          </button>
          <button type="button" onClick={() => setActiveDomain("keybindings")} className={navItemClass(activeDomain === "keybindings")}>
            <Icon name="keyboard" className={`text-[17px] ${activeDomain === "keybindings" ? "text-primary" : "text-outline group-hover:text-on-surface"}`} />
            <div className="flex flex-col">
              <span className={`font-label-md text-label-md ${activeDomain === "keybindings" ? "font-semibold text-on-surface" : ""}`}>
                快捷键 Keybindings
              </span>
              <span className={`font-code-sm text-code-sm ${activeDomain === "keybindings" ? "text-primary/80" : "text-outline"}`}>
                Vim mode, Hotkeys
              </span>
            </div>
            {activeDomain === "keybindings" ? <Icon name="chevron_right" className="ml-auto text-[16px] text-primary" /> : null}
          </button>
          <button type="button" onClick={() => setActiveDomain("plugins")} className={navItemClass(activeDomain === "plugins")}>
            <Icon name="hub" className={`text-[17px] ${activeDomain === "plugins" ? "text-primary" : "text-outline group-hover:text-on-surface"}`} />
            <div className="flex flex-col">
              <span className={`font-label-md text-label-md ${activeDomain === "plugins" ? "font-semibold text-on-surface" : ""}`}>
                扩展与 MCP 服务 Plugins &amp; MCP
              </span>
              <span className={`font-code-sm text-code-sm ${activeDomain === "plugins" ? "text-primary/80" : "text-outline"}`}>
                Model Context Protocol
              </span>
            </div>
            {activeDomain === "plugins" ? (
              <Icon name="chevron_right" className="ml-auto text-[16px] text-primary" />
            ) : (
              <span className="ml-auto rounded bg-tertiary-container/30 px-1.5 py-0.5 font-code-sm text-code-sm text-tertiary">
                3 Active
              </span>
            )}
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
      {/* Right Main Workspace — only this column scrolls */}
      <div ref={contentScrollerRef} className="min-h-0 min-w-0 flex-1 overflow-y-auto p-space-xl">
        <div className="space-y-space-xl">
        {activeDomain === "general" ? (
          <section className="flex flex-col gap-space-md rounded-xl bg-surface-container-low p-space-xl shadow-sm">
            <h2 className="font-headline-sm text-headline-sm font-semibold text-on-surface">通用 General</h2>
            <p className="font-body-sm text-body-sm text-on-surface-variant">遥测、更新与同步选项将在此配置。</p>
          </section>
        ) : null}
        {activeDomain === "appearance" ? (
        <section className="flex flex-col gap-space-md bg-surface-container-low p-space-xl rounded-xl shadow-sm">
          <div className="flex items-center justify-between pb-space-xs">
            <div className="flex items-center gap-space-sm">
              <Icon name="palette" className="text-primary text-[20px]" />
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
                  <Icon name="check" className="text-[11px] font-bold" />
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
                  <Icon name="expand_more" className="text-outline text-[16px]" />
                </div>
                <div className="flex-1 h-9 rounded bg-surface-container px-space-md flex items-center justify-between">
                  <span className="font-body-md text-body-md text-on-surface">
                    Inter / PingFang (UI)
                  </span>
                  <Icon name="expand_more" className="text-outline text-[16px]" />
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
                <Icon name="density_small" className="text-[15px]" />
                <span>
                  紧凑 Compact (4px grid)
                </span>
              </button>
              <button className="flex-1 h-8 rounded bg-primary text-on-primary font-label-sm text-label-sm font-semibold flex items-center justify-center gap-2 shadow-sm" type="button">
                <Icon name="density_medium" className="text-[15px]" />
                <span>
                  舒适 Cozy (8px/12px)
                </span>
              </button>
            </div>
          </div>
        </section>
        ) : null}
        {activeDomain === "models" ? (
        <section className="flex flex-col gap-space-md bg-surface-container-low p-space-xl rounded-xl shadow-sm">
          <div className="flex items-center justify-between pb-space-xs">
            <div className="flex items-center gap-space-sm">
              <Icon name="cognition" className="text-secondary text-[20px]" />
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
              <ModelSelect variant="field" fallback="Sonnet-3.5" />
              <p className="font-code-sm text-code-sm text-outline">
                保存 DeepSeek API Key 后，主进程会调用 set_model，切到 DeepSeek V4 Flash。
                {flashModelId ? <span className="mt-0.5 block font-mono text-[10px] text-on-surface-variant">deepseek/{flashModelId}</span> : null}
              </p>
              <a
                href="#/credentials"
                className="mt-space-xs inline-flex w-fit items-center gap-2 rounded-lg border border-primary/50 bg-primary/15 px-space-md py-2 font-label-sm text-label-sm font-semibold text-primary shadow-sm transition-colors hover:border-primary hover:bg-primary/25 hover:text-on-primary-container"
              >
                <Icon name="vpn_key" className="text-[18px]" />
                <span>管理密钥</span>
                <Icon name="chevron_right" className="text-[16px] opacity-80" />
              </a>
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
                    Haiku-Fast
                  </span>
                  <span className="font-label-xs text-label-xs text-on-surface-variant font-normal">
                    (Low latency autocomplete)
                  </span>
                </div>
                <Icon name="unfold_more" className="text-outline text-[16px]" />
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
                <Icon name="compress" className="text-outline text-[16px]" />
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
                  <Icon name="auto_awesome" className="text-[14px]" />
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
        ) : null}
        {activeDomain === "permissions" ? (
        <section className="flex flex-col gap-space-md bg-surface-container-low p-space-xl rounded-xl shadow-sm">
          <div className="flex items-center justify-between pb-space-xs">
            <div className="flex items-center gap-space-sm">
              <Icon name="security" className="text-tertiary text-[20px]" />
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
                  <Icon name="lock" className="text-outline text-[16px]" />
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
                  <Icon name="key" className="text-[13px] text-error" />
                  <span>
                    .env
                  </span>
                  <Icon name="close" className="text-[13px] text-outline hover:text-on-surface cursor-pointer" />
                </span>
                <span className="font-code-sm text-code-sm px-2 py-1 rounded bg-surface-container-high text-on-surface flex items-center gap-1.5">
                  <Icon name="key" className="text-[13px] text-error" />
                  <span>
                    .env.production
                  </span>
                  <Icon name="close" className="text-[13px] text-outline hover:text-on-surface cursor-pointer" />
                </span>
                <span className="font-code-sm text-code-sm px-2 py-1 rounded bg-surface-container-high text-on-surface flex items-center gap-1.5">
                  <Icon name="vpn_key" className="text-[13px] text-error" />
                  <span>
                    id_rsa
                  </span>
                  <Icon name="close" className="text-[13px] text-outline hover:text-on-surface cursor-pointer" />
                </span>
                <span className="font-code-sm text-code-sm px-2 py-1 rounded bg-surface-container-high text-on-surface flex items-center gap-1.5">
                  <Icon name="vpn_key" className="text-[13px] text-error" />
                  <span>
                    id_ed25519
                  </span>
                  <Icon name="close" className="text-[13px] text-outline hover:text-on-surface cursor-pointer" />
                </span>
                <span className="font-code-sm text-code-sm px-2 py-1 rounded bg-surface-container-high text-on-surface flex items-center gap-1.5">
                  <Icon name="description" className="text-[13px] text-outline" />
                  <span>
                    *.pem
                  </span>
                  <Icon name="close" className="text-[13px] text-outline hover:text-on-surface cursor-pointer" />
                </span>
                <button className="h-7 px-2.5 rounded bg-surface-container-highest hover:bg-surface-bright text-on-surface font-label-xs text-label-xs flex items-center gap-1 transition-colors" type="button">
                  <Icon name="add" className="text-[14px]" />
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
        ) : null}
        {activeDomain === "keybindings" ? (
          <section className="flex flex-col gap-space-md rounded-xl bg-surface-container-low p-space-xl shadow-sm">
            <h2 className="font-headline-sm text-headline-sm font-semibold text-on-surface">快捷键 Keybindings</h2>
            <p className="font-body-sm text-body-sm text-on-surface-variant">Vim 模式与快捷键映射将在此配置。</p>
          </section>
        ) : null}
        {activeDomain === "plugins" ? (
          <section className="flex flex-col gap-space-md rounded-xl bg-surface-container-low p-space-xl shadow-sm">
            <h2 className="font-headline-sm text-headline-sm font-semibold text-on-surface">扩展与 MCP 服务</h2>
            <p className="font-body-sm text-body-sm text-on-surface-variant">Model Context Protocol 扩展将在此管理。</p>
          </section>
        ) : null}
        </div>
      </div>
    </div>
    <footer className="relative z-10 flex h-14 shrink-0 items-center justify-between border-t border-outline-variant/20 bg-surface-container-lowest/90 px-space-xl shadow-xl backdrop-blur">
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
          <Icon name="restart_alt" className="text-[15px]" />
          <span>
            重置为默认值 (Restore Defaults)
          </span>
        </button>
        <button className="h-8 px-space-lg rounded bg-primary text-on-primary hover:bg-primary-container hover:text-on-primary-container font-label-sm text-label-sm font-semibold flex items-center gap-1.5 shadow-sm transition-colors" type="button">
          <Icon name="check" className="text-[15px]" />
          <span>
            同步到远程团队策略
          </span>
        </button>
      </div>
    </footer>
  </div>
  );
}
