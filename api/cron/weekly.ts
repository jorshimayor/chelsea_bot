export const config = { runtime: "edge" };

/**
 * Weekly deep-dive post.
 * Schedule target: Monday 10:00 Africa/Lagos (WAT, UTC+1) = Mon 09:00 UTC.
 * Vercel cron expression: "0 9 * * 1"
 *
 * Flow:
 *   1. Pull last 5 Chelsea fixtures to build a "window" summary.
 *   2. Ask the LLM for a weekly deep-dive tweet themed around form.
 *   3. Publish (unless flag says draft only).
 */

import { getChelseaFixtures } from "../../packages/tools/football";
import { routeAndChat } from "../../packages/shared/openrouter";
import {
  buildTweetMessages,
  normalizeTweet,
} from "../../packages/shared/tweet-prompts";
import { publishTweetForUser } from "../../packages/shared/x";
import { once } from "../../packages/shared/redis";
import { db } from "../../packages/db/client";
import { messages } from "../../packages/db/schema";
import flags from "../../config/flags.json";
import { withErrorLogging } from "../../packages/observability/index";

export default withErrorLogging(async function handler(): Promise<Response> {
  const { fixtures } = await getChelseaFixtures({ last: 5 });
  if (!fixtures.length) return json({ skipped: "no recent fixtures" });

  // Super-lightweight summary: W/D/L + last 5 opponents.
  const summary = fixtures
    .map((f) => `${f.opponent} (${f.competition}) [${f.status}]`)
    .join(", ");

  const m = buildTweetMessages("weekly_deep_dive", "professional", {
    theme: "Form across the last 5 matches",
    numbers: summary,
    window: "last 5 matches",
  });
  const llm = await routeAndChat({ messages: m });
  const tweet = normalizeTweet(llm.content);
  if (!tweet) return json({ skipped: "llm produced SKIP" });

  let tweetId = "";
  if (!flags.publish_draft_only) {
    const weekKey = `tweet:weekly:${new Date().toISOString().slice(0, 10)}`;
    const firstTime = await once(weekKey, 7 * 24 * 60 * 60);
    if (firstTime) {
      const res = await publishTweetForUser(tweet);
      tweetId = res.id || "";
    }
  }

  await db.insert(messages).values({
    direction: "out",
    content: tweet,
    modelUsed: llm.model,
  });

  return json({ tweet, posted: Boolean(tweetId), tweetId });
});

function json(obj: unknown, status = 200): Response {
  return new Response(JSON.stringify(obj), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-store",
    },
  });
}
