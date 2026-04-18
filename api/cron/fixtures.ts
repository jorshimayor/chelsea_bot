export const config = { runtime: "edge" };

/**
 * Daily morning fixtures post.
 * Schedule target: 08:00 Africa/Lagos (WAT, UTC+1) = 07:00 UTC every day.
 * Vercel cron expression: "0 7 * * *"
 *
 * Flow:
 *   1. Pull the next Chelsea fixture from API-Football.
 *   2. Ask the LLM to write a MATCH PREVIEW tweet.
 *   3. Publish (unless flags.publish_draft_only).
 *   4. Persist to messages table.
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
  const { fixtures } = await getChelseaFixtures({ next: 1 });
  const next = fixtures[0];
  if (!next) {
    return json({ skipped: "no upcoming fixture" });
  }

  const dateLocal = new Date(next.date).toLocaleString("en-GB", {
    timeZone: "Africa/Lagos",
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });

  const m = buildTweetMessages("match_preview", "professional", {
    opponent: next.opponent,
    competition: next.competition,
    date: dateLocal,
    venue: next.venue,
    hook: next.isChelseaHome ? "Home fixture at the Bridge." : "Away day.",
  });
  const llm = await routeAndChat({ messages: m });
  const tweet = normalizeTweet(llm.content);
  if (!tweet) return json({ skipped: "llm produced SKIP" });

  let tweetId = "";
  if (!flags.publish_draft_only) {
    const idKey = `tweet:fixtures:${next.id}`;
    const firstTime = await once(idKey, 24 * 60 * 60);
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

  return json({
    fixtureId: next.id,
    opponent: next.opponent,
    date: next.date,
    tweet,
    posted: Boolean(tweetId),
    tweetId,
  });
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
