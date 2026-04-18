/**
 * Smoke test for tweet generation.
 *
 * Loads .env from the repo root, calls OpenRouter through the shared router,
 * normalizes the reply, and asserts the format (length, suffix).
 *
 * Run:    pnpm test:generate
 * Needs:  only OPENROUTER_API_KEY in .env. No DB, no Redis, no API-Football.
 */

import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { routeAndChat } from "../packages/shared/openrouter";
import {
  buildTweetMessages,
  normalizeTweet,
} from "../packages/shared/tweet-prompts";

function loadDotenv(path: string) {
  try {
    const raw = readFileSync(path, "utf8");
    for (const line of raw.split(/\r?\n/)) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);
      if (!m) continue;
      const [, k, vRaw] = m;
      if (process.env[k]) continue;
      process.env[k] = vRaw.replace(/^["']|["']$/g, "");
    }
  } catch {
    /* no .env — fine, fall through to the check below */
  }
}

async function main(): Promise<number> {
  const here = dirname(fileURLToPath(import.meta.url));
  loadDotenv(join(here, "..", ".env"));

  if (!process.env.OPENROUTER_API_KEY) {
    console.error(
      "OPENROUTER_API_KEY is not set. Add it to .env and retry.\n" +
        "  cp .env.example .env && edit .env"
    );
    return 1;
  }

  const SAMPLE = {
    kind: "match_preview" as const,
    tone: "professional" as const,
    data: {
      opponent: "Arsenal",
      competition: "Premier League",
      date: "Sat 3 PM",
      venue: "Stamford Bridge",
      hook: "Home fixture at the Bridge.",
    },
  };

  console.log("→ Generating tweet…");
  console.log("  kind:", SAMPLE.kind, "| tone:", SAMPLE.tone);

  const messages = buildTweetMessages(SAMPLE.kind, SAMPLE.tone, SAMPLE.data);
  const started = Date.now();
  const res = await routeAndChat({ messages });
  const ms = Date.now() - started;
  const tweet = normalizeTweet(res.content);

  console.log(`\n— LLM replied in ${ms} ms via ${res.model} —`);
  console.log("raw  :", JSON.stringify(res.content));
  console.log("tweet:", tweet);
  console.log(
    `length: ${tweet.length}/280  |  ends with #CFC 💙: ${tweet.endsWith(
      "#CFC 💙"
    )}`
  );

  if (!tweet) {
    console.error("\n✗ Normalizer returned empty (LLM emitted SKIP).");
    return 2;
  }
  if (tweet.length > 280) {
    console.error("\n✗ Tweet exceeds 280 chars — normalizer bug.");
    return 3;
  }
  if (!tweet.endsWith("#CFC 💙")) {
    console.error("\n✗ Tweet is missing the #CFC 💙 suffix.");
    return 4;
  }

  console.log("\n✓ Smoke test passed.");
  return 0;
}

main().then(
  (code) => process.exit(code),
  (err) => {
    console.error("\n✗ Smoke test threw:", err?.message || err);
    if (err?.stack) console.error(err.stack);
    process.exit(10);
  }
);
