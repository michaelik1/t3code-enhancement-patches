import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { resolve } from "node:path";

const repository = resolve(process.argv[2] ?? "upstream");
const root = resolve(import.meta.dirname, "..");
const config = JSON.parse(readFileSync(resolve(root, "patches/base.json"), "utf8"));
if (typeof config.patch_version !== "string" || !/^\d+\.\d+$/.test(config.patch_version)) {
  throw new Error(
    `Invalid patch_version in patches/base.json: ${String(config.patch_version)} (expected "<major>.<minor>", e.g. "1.0")`,
  );
}
for (const [file, expected] of Object.entries(config.files)) {
  const content = execFileSync("git", ["show", `HEAD:${file}`], { cwd: repository });
  const actual = createHash("sha256").update(content).digest("hex");
  if (actual !== expected) throw new Error(`Upstream file changed: ${file}; review patch against this release before updating the recorded hash`);
}
const patch = resolve(root, "patches/usage-limits.patch");
execFileSync("git", ["apply", "--check", patch], { cwd: repository, stdio: "inherit" });
execFileSync("git", ["apply", patch], { cwd: repository, stdio: "inherit" });
console.log(`Verified protected upstream files and applied usage limits patch (patch ${config.patch_version}).`);
