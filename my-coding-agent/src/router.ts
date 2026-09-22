export type Route = "workspace" | "diff" | "settings" | "onboarding" | "credentials" | "branch";

export function readRoute(hash = window.location.hash): Route {
  const path = hash.replace(/^#/, "").split("?")[0].replace(/^\/+/, "");
  switch (path) {
    case "diff":
      return "diff";
    case "settings":
      return "settings";
    case "onboarding":
      return "onboarding";
    case "credentials":
      return "credentials";
    case "branch":
      return "branch";
    default:
      return "workspace";
  }
}
