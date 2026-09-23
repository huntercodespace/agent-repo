/**
 * AuthStorage credential wrap: provider registry, masked save, DeepSeek Flash.
 * Uses PI_CODING_AGENT_DIR so it does not touch the real ~/.pi/agent store.
 */
import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const dir = mkdtempSync(join(tmpdir(), "pi-credentials-"));
process.env.PI_CODING_AGENT_DIR = dir;
const secret = "sk-test-deepseek-flash-demo-key-99zz";
const envSecret = "sk-env-deepseek-should-not-leak-77aa";

const credentials = await import("../electron/credentials.mjs");

try {
  const providers = await credentials.listProviders();
  const deepseek = providers.find((provider) => provider.id === "deepseek");
  assert.ok(deepseek, "deepseek missing from pi-ai registry");
  assert.equal(deepseek.apiKey, true);
  assert.equal(deepseek.oauth, false);
  assert.equal(deepseek.multiStep, false);
  assert.ok(deepseek.models.some((model) => model.id === "deepseek-flash"));
  assert.equal(credentials.displayModelName("deepseek", "deepseek-flash", "DeepSeek V4.1 Flash"), "DeepSeek Flash");

  const codex = providers.find((provider) => provider.id === "openai-codex");
  assert.equal(codex?.oauthOnly, true);
  assert.equal(codex?.apiKey, false);

  for (const id of ["amazon-bedrock", "google-vertex"]) {
    const provider = providers.find((entry) => entry.id === id);
    assert.equal(provider?.authFlow, "multi-step", id);
    assert.equal(provider?.multiStep, true, id);
  }

  for (const id of ["anthropic", "github-copilot", "openrouter", "xai", "kimi-coding", "radius"]) {
    const provider = providers.find((entry) => entry.id === id);
    assert.equal(provider?.oauth, true, id);
  }

  const saved = await credentials.saveApiKey("deepseek", secret);
  assert.equal(saved.status, "stored");
  assert.equal(saved.source, "stored");
  assert.equal(saved.mask, "••••99zz");
  assert.equal(saved.configured, true);
  const savedJson = JSON.stringify(saved);
  assert.equal(savedJson.includes(secret), false);
  assert.equal(savedJson.includes("99zz"), true);

  const authFile = readFileSync(join(dir, "auth.json"), "utf8");
  assert.equal(authFile.includes(secret), true);
  assert.equal(authFile.includes("deepseek"), true);

  const selected = await credentials.setSelectedModel("deepseek", "deepseek-flash");
  assert.equal(selected.ok, true);
  assert.equal(selected.name, "DeepSeek Flash");
  const settingsFile = readFileSync(join(dir, "settings.json"), "utf8");
  assert.equal(settingsFile.includes("deepseek-flash"), true);
  assert.equal(settingsFile.includes(secret), false);
  const current = await credentials.getSelectedModel();
  assert.equal(current.modelId, "deepseek-flash");
  assert.equal(current.providerId, "deepseek");

  const summary = credentials.summaryFrom(await credentials.getStatus());
  assert.equal(summary.configured, true);
  assert.equal(summary.providerId, "deepseek");
  assert.equal(summary.mask, "••••99zz");
  assert.equal(JSON.stringify(summary).includes(secret), false);

  const cleared = await credentials.clearCredential("deepseek");
  assert.equal(cleared.status, "unconfigured");
  assert.equal(readFileSync(join(dir, "auth.json"), "utf8").includes(secret), false);

  process.env.DEEPSEEK_API_KEY = envSecret;
  const detected = await credentials.detectEnv("deepseek");
  assert.deepEqual(detected, [{ providerId: "deepseek", envVars: ["DEEPSEEK_API_KEY"] }]);
  assert.equal(JSON.stringify(detected).includes(envSecret), false);
  const afterEnv = (await credentials.getStatus()).find((row) => row.providerId === "deepseek");
  assert.equal(afterEnv?.status, "environment");
  assert.equal(afterEnv?.source, "environment");
  assert.equal(afterEnv?.mask, "DEEPSEEK_API_KEY");
  assert.equal(JSON.stringify(afterEnv).includes(envSecret), false);

  const blocked = await credentials.saveApiKey("openai-codex", secret);
  assert.equal(blocked.status, "error");
  assert.equal(JSON.stringify(blocked).includes(secret), false);

  console.log("credentials smoke ok");
} finally {
  delete process.env.DEEPSEEK_API_KEY;
  rmSync(dir, { recursive: true, force: true });
}
