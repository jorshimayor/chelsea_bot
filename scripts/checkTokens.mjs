/**
 * Static guardrail: ensure no model in the OpenRouter router declares a
 * maxOutputTokens cap above 1200. Runs as a pure text check so it works
 * without a TS build step.
 */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const src = readFileSync(
  join(here, "..", "packages", "shared", "openrouter.ts"),
  "utf8"
);

const LIMIT = 1200;
const re = /maxOutputTokens:\s*(\d+)/g;
let m;
const caps = [];
while ((m = re.exec(src)) !== null) caps.push(Number(m[1]));

if (caps.length === 0) {
  console.error("checkTokens: no maxOutputTokens entries found");
  process.exit(1);
}

const over = caps.filter((c) => c > LIMIT);
if (over.length > 0) {
  console.error(`checkTokens: cap(s) exceed ${LIMIT}:`, over);
  process.exit(1);
}

console.log(`checkTokens: ok (${caps.length} model(s), max ${Math.max(...caps)} ≤ ${LIMIT})`);
