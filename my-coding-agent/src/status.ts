export const ENGINE_STATES = ["idle", "chatting", "reconnecting", "disconnected"] as const;

export type EngineState = (typeof ENGINE_STATES)[number];

export interface StatusBarState {
  engine: EngineState;
  sandboxEnabled: boolean;
}

export function isEngineState(value: string | null): value is EngineState {
  return ENGINE_STATES.some((state) => state === value);
}

export function readStatusFromLocation(search = window.location.search): StatusBarState {
  const params = new URLSearchParams(search);
  const engine = params.get("engine");
  const sandbox = params.get("sandbox");
  return {
    engine: isEngineState(engine) ? engine : "idle",
    sandboxEnabled: sandbox !== "off",
  };
}

export function nextEngineState(current: EngineState): EngineState {
  const index = ENGINE_STATES.indexOf(current);
  return ENGINE_STATES[(index + 1) % ENGINE_STATES.length];
}
