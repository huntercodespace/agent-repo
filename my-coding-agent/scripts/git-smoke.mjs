import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { promisify } from "node:util";
import gitService from "../electron/git-service.cjs";

const run = promisify(execFile);
const cwd = await mkdtemp(join(tmpdir(), "pi-git-smoke-"));
const git = (...args) => run("git", args, { cwd });

try {
  await git("init", "-q");
  await git("config", "user.name", "Git Smoke Test");
  await git("config", "user.email", "git-smoke@example.invalid");
  await writeFile(join(cwd, "selected.txt"), "selected\n");
  await writeFile(join(cwd, "other.txt"), "other\n");

  let state = await gitService.status(cwd);
  assert.equal(state.ok, true);
  assert.equal(state.files.length, 2);
  assert.equal((await gitService.commit(cwd, "empty")).ok, false);

  state = await gitService.stage(cwd, "selected.txt", true);
  assert.equal(state.files.find((file) => file.path === "selected.txt")?.staged, true);
  assert.match((await gitService.diff(cwd, "selected.txt")).text, /\+selected/);

  state = await gitService.stage(cwd, "selected.txt", false);
  assert.equal(state.files.find((file) => file.path === "selected.txt")?.staged, false);

  await gitService.stage(cwd, "selected.txt", true);
  const committed = await gitService.commit(cwd, "test: selected file");
  assert.equal(committed.ok, true);
  assert.match(committed.hash, /^[a-f0-9]+$/);
  assert.deepEqual(committed.files.map((file) => file.path), ["other.txt"]);
  assert.equal((await git("show", "--pretty=format:", "--name-only", "HEAD")).stdout.trim(), "selected.txt");

  const nested = join(cwd, "nested");
  await mkdir(nested);
  state = await gitService.status(nested);
  assert.deepEqual(state.files.map((file) => file.path), ["other.txt"]);
  state = await gitService.stage(nested, null, true);
  assert.equal(state.files[0].staged, true);
  assert.equal((await gitService.commit(nested, "test: stage from subdirectory")).ok, true);
  assert.equal((await gitService.status(cwd)).files.length, 0);
  console.log("Git commit smoke test passed");
} finally {
  await rm(cwd, { recursive: true, force: true });
}
