import { useEffect, useMemo, useRef, useState, type ChangeEvent } from "react";
import { chooseModel, modelChoiceLabel, useCredentialBoard } from "../credentials/board";
import type { ProviderInfo } from "../credentials/types";
import { Icon } from "./Icon";

interface ModelSelectProps {
  variant: "chip" | "field" | "composer";
  fallback?: string;
}

async function choosePair(pair: string) {
  const slash = pair.indexOf("/");
  if (slash <= 0) return;
  await chooseModel(pair.slice(0, slash), pair.slice(slash + 1));
}

function ComposerModelMenu({
  configured,
  value,
  label,
  title,
}: {
  configured: ProviderInfo[];
  value: string;
  label: string;
  title: string;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onPointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    }
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  async function pick(next: string) {
    if (next === value) {
      setOpen(false);
      return;
    }
    await choosePair(next);
    setOpen(false);
  }

  return (
    <div ref={rootRef} className="relative min-w-0">
      <button
        type="button"
        aria-label="选择模型"
        aria-haspopup="listbox"
        aria-expanded={open}
        title={title}
        onClick={() => setOpen((current) => !current)}
        className="inline-flex max-w-[9.5rem] min-w-0 items-center gap-0.5 rounded-md px-1 py-0.5 text-left outline-none transition-colors hover:bg-[#333] focus-visible:ring-1 focus-visible:ring-white/40 sm:max-w-[11rem]"
      >
        <span className="min-w-0 flex-1 truncate text-[12px] text-[#d7d7d7]">{label}</span>
        <Icon
          name="expand_more"
          className={`shrink-0 text-[18px] leading-none text-[#9b9b9b] transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open ? (
        <div
          role="listbox"
          aria-label="模型列表"
          className="absolute bottom-full right-0 z-[100] mb-2 max-h-64 min-w-[13rem] overflow-y-auto rounded-xl border border-[#3b3b3b] bg-[#2a2a2a] py-1 shadow-[0_8px_24px_rgba(0,0,0,0.45)]"
        >
          {configured.map((provider) => (
            <div key={provider.id} className="py-0.5">
              <div className="px-3 py-1 text-[10px] font-medium tracking-wide text-[#8f8f8f]">{provider.name}</div>
              {provider.models.map((model) => {
                const pair = `${provider.id}/${model.id}`;
                const itemLabel = modelChoiceLabel(provider.id, model.id, model.name, provider.flashModelId);
                const active = value === pair;
                return (
                  <button
                    key={pair}
                    type="button"
                    role="option"
                    aria-selected={active}
                    onClick={() => void pick(pair)}
                    className={`flex w-full items-center gap-2 px-3 py-2 text-left text-[13px] transition-colors ${
                      active ? "bg-[#3d3d3d] text-[#f5f5f5]" : "text-[#d0d0d0] hover:bg-[#353535]"
                    }`}
                  >
                    <span className="min-w-0 flex-1 truncate">{itemLabel}</span>
                    {active ? <Icon name="check" className="shrink-0 text-[16px] text-[#b8b8b8]" /> : null}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}

export function ModelSelect({ variant, fallback = "Sonnet-3.5" }: ModelSelectProps) {
  const board = useCredentialBoard();
  const configured = useMemo(() => {
    const ids = new Set(
      board.providers.filter((provider) => board.statuses[provider.id]?.configured).map((provider) => provider.id),
    );
    return board.providers.filter((provider) => ids.has(provider.id) && provider.models.length > 0);
  }, [board.providers, board.statuses]);

  const value = board.selected.providerId && board.selected.modelId
    ? `${board.selected.providerId}/${board.selected.modelId}`
    : "";
  const selectedName = board.selected.name
    || (board.selected.providerId && board.selected.modelId
      ? modelChoiceLabel(board.selected.providerId, board.selected.modelId, board.selected.modelId)
      : null);
  const deepseek = board.providers.find((provider) => provider.id === "deepseek");
  const flashModelId = deepseek?.flashModelId ?? null;
  const flashPair = flashModelId ? `deepseek/${flashModelId}` : null;
  const flashSelected = Boolean(
    flashPair && board.selected.providerId === "deepseek" && board.selected.modelId === flashModelId,
  );

  async function onChange(event: ChangeEvent<HTMLSelectElement>) {
    const next = event.target.value;
    if (!next) return;
    await choosePair(next);
  }

  if (!board.available) {
    return (
      <span className={variant === "chip"
        ? "flex h-8 items-center gap-1 rounded bg-surface-container px-space-sm font-label-sm text-label-sm text-on-surface"
        : variant === "composer"
          ? "max-w-[9.5rem] truncate text-[12px] text-[#d7d7d7]"
        : "font-code-sm text-code-sm text-on-surface font-semibold"}
      >
        {fallback}
      </span>
    );
  }

  if (variant === "composer") {
    const label = selectedName || fallback;
    const title = flashSelected && flashPair ? flashPair : label;
    return (
      <ComposerModelMenu
        configured={configured}
        value={value}
        label={label}
        title={title}
      />
    );
  }

  const className = variant === "chip"
    ? "h-8 max-w-[16rem] rounded bg-surface-container px-space-sm font-label-sm text-label-sm text-on-surface outline-none hover:bg-surface-container-high"
    : "h-10 w-full rounded bg-surface-container px-space-md font-code-sm text-code-sm text-on-surface font-semibold outline-none hover:bg-surface-container-high";

  const select = (
    <select
      aria-label="选择模型"
      className={className}
      value={value}
      onChange={onChange}
      title={flashSelected && flashPair ? flashPair : selectedName || fallback}
    >
      <option value="">{selectedName || fallback}</option>
      {configured.map((provider) => (
        <optgroup key={provider.id} label={provider.name}>
          {provider.models.map((model) => {
            const label = modelChoiceLabel(provider.id, model.id, model.name, provider.flashModelId);
            return (
              <option key={`${provider.id}/${model.id}`} value={`${provider.id}/${model.id}`}>
                {label}
              </option>
            );
          })}
        </optgroup>
      ))}
    </select>
  );

  if (variant === "chip" && flashSelected) {
    return (
      <span className="flex max-w-[18rem] flex-col justify-center leading-none">
        {select}
        <span className="px-space-sm font-mono text-[10px] text-outline">{flashPair}</span>
      </span>
    );
  }

  return select;
}
