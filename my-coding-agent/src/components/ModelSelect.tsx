import { useMemo, type ChangeEvent } from "react";
import { chooseModel, modelChoiceLabel, useCredentialBoard } from "../credentials/board";

interface ModelSelectProps {
  variant: "chip" | "field";
  fallback?: string;
}

export function ModelSelect({ variant, fallback = "Pi-Sonnet-3.5" }: ModelSelectProps) {
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
    const slash = next.indexOf("/");
    if (slash <= 0) return;
    await chooseModel(next.slice(0, slash), next.slice(slash + 1));
  }

  if (!board.available) {
    return (
      <span className={variant === "chip"
        ? "flex h-8 items-center gap-1 rounded bg-surface-container px-space-sm font-label-sm text-label-sm text-on-surface"
        : "font-code-sm text-code-sm text-on-surface font-semibold"}
      >
        {fallback}
      </span>
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
