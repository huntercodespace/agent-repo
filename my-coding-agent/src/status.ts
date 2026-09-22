export const ENGINE_STATES = ["idle", "chatting", "reconnecting", "disconnected"] as const;

export type EngineState = (typeof ENGINE_STATES)[number];

export const SANDBOX_STATES = ["off", "enabling", "on"] as const;

export type SandboxState = (typeof SANDBOX_STATES)[number];

export interface StatusBarState {
  engine: EngineState;
  sandbox: SandboxState;
}

export function isEngineState(value: string | null): value is EngineState {
  return ENGINE_STATES.some((state) => state === value);
}

export function isSandboxState(value: string | null): value is SandboxState {
  return SANDBOX_STATES.some((state) => state === value);
}

export function readStatusFromLocation(search = window.location.search): StatusBarState {
  const params = new URLSearchParams(search);
  const engine = params.get("engine");
  const sandbox = params.get("sandbox");
  return {
    engine: isEngineState(engine) ? engine : "idle",
    sandbox: isSandboxState(sandbox) ? sandbox : "on",
  };
}

export function nextEngineState(current: EngineState): EngineState {
  const index = ENGINE_STATES.indexOf(current);
  return ENGINE_STATES[(index + 1) % ENGINE_STATES.length];
}

export function nextSandboxState(current: SandboxState): SandboxState {
  const index = SANDBOX_STATES.indexOf(current);
  return SANDBOX_STATES[(index + 1) % SANDBOX_STATES.length];
}
