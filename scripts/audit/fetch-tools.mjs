import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

const repoRoot = process.cwd();
const manifestPath = path.join(repoRoot, "tools", "audit-tools.json");
const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
const destinationRoot = process.env.ATHAR_AUDIT_TOOLS_DIR || path.join(os.tmpdir(), "athar-audit-tools");
const requested = process.argv.slice(2);
const toolNames = requested.length ? requested : Object.keys(manifest);

fs.mkdirSync(destinationRoot, { recursive: true });

for (const name of toolNames) {
  const tool = manifest[name];
  if (!tool) throw new Error(`Unknown audit tool: ${name}`);
  const destination = path.join(destinationRoot, name);

  if (!fs.existsSync(path.join(destination, ".git"))) {
    fs.rmSync(destination, { recursive: true, force: true });
    execFileSync("git", ["clone", "--quiet", tool.repository, destination], { stdio: "inherit" });
  } else {
    execFileSync("git", ["-C", destination, "fetch", "--quiet", "origin"], { stdio: "inherit" });
  }

  execFileSync("git", ["-C", destination, "checkout", "--quiet", "--detach", tool.commit], { stdio: "inherit" });
  const resolved = execFileSync("git", ["-C", destination, "rev-parse", "HEAD"], { encoding: "utf8" }).trim();
  if (resolved !== tool.commit) throw new Error(`${name}: expected ${tool.commit}, got ${resolved}`);
  console.log(`${name}: ${destination} @ ${resolved}`);
}
