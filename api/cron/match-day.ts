export const config = { runtime: "edge" };

/**
 * Match-day polling cron.
 * Runs every 5 minutes; only acts if a Chelsea fixture is currently live or
 * just finished.
 *
 * Vercel cron expression: "*\/5 * * * *"  (every 5 min)
 *
 * Flow:
 *   - Fetch live fixtures.
 *   - If Chelsea is in one, pull match stats, build a LIVE UPDATE tweet.
 *   - If Chelsea just finished (status FT/AET/PEN) and we haven't posted the
 *     post-match recap yet, build a POST_MATCH tweet.
 *   - Idempotency keyed by fixture id + status so we don't spam.
 */

import { CHELSEA_TEAM_ID } from "../../packages/tools/football";
import { getLiveEvents } from "../../packages/tools/index";
import { getMatchStats } from "../../packages/tools/football";
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

type LiveEvent = {
  fixture?: {
    id?: number;
    status?: { short?: string; elapsed?: number | null };
  };
  teams?: {
    home?: { id?: number; name?: string };
    away?: { id?: number; name?: string };
  };
  goals?: { home?: number | null; away?: number | null };
};

const LIVE_STATUSES = new Set(["1H", "2H", "ET", "HT", "BT", "P"]);
const FINAL_STATUSES = new Set(["FT", "AET", "PEN"]);

export default withErrorLogging(async function handler(): Promise<Response> {
  const live = await getLiveEvents({});
  const events: LiveEvent[] = (live.events || []) as LiveEvent[];
  const chelseaGame = events.find(
    (e) =>
      e?.teams?.home?.id === CHELSEA_TEAM_ID ||
      e?.teams?.away?.id === CHELSEA_TEAM_ID
  );
  if (!chelseaGame) return json({ skipped: "no chelsea fixture live" });

  const status = chelseaGame?.fixture?.status?.short || "";
  const fixtureId = chelseaGame?.fixture?.id || 0;
  const homeGoals = chelseaGame?.goals?.home ?? 0;
  const awayGoals = chelseaGame?.goals?.away ?? 0;
  const score = `${homeGoals}-${awayGoals}`;
  const minute = chelseaGame?.fixture?.status?.elapsed ?? null;

  if (LIVE_STATUSES.has(status)) {
    return await handleLive({ fixtureId, score, minute, status });
  }
  if (FINAL_STATUSES.has(status)) {
    return await handlePostMatch({ fixtureId, score });
  }
  return json({ skipped: `status=${status}`, fixtureId });
});

async function handleLive(args: {
  fixtureId: number;
  score: string;
  minute: number | null;
  status: string;
}): Promise<Response> {
  // Idempotency: one live tweet per (fixtureId, score) tuple.
  const key = `tweet:live:${args.fixtureId}:${args.score}`;
  const firstTime = await once(key, 20 * 60);
  if (!firstTime) return json({ skipped: "already tweeted this scoreline" });

  const stats = await getMatchStats(args.fixtureId);
  const m = buildTweetMessages("live_update", "professional", {
    minute: args.minute ?? args.status,
    event: "Score update",
    actor: "n/a",
    score: args.score,
    possession: stats.possession,
    xg: stats.xg,
  });
  const llm = await routeAndChat({ messages: m });
  const tweet = normalizeTweet(llm.content);
  if (!tweet) return json({ skipped: "llm produced SKIP" });

  let tweetId = "";
  if (!flags.publish_draft_only) {
    const res = await publishTweetForUser(tweet);
    tweetId = res.id || "";
  }
  await db.insert(messages).values({
    direction: "out",
    content: tweet,
    modelUsed: llm.model,
  });
  return json({ type: "live", tweet, posted: Boolean(tweetId), tweetId });
}

async function handlePostMatch(args: {
  fixtureId: number;
  score: string;
}): Promise<Response> {
  const key = `tweet:postmatch:${args.fixtureId}`;
  const firstTime = await once(key, 24 * 60 * 60);
  if (!firstTime) return json({ skipped: "post-match already sent" });

  const stats = await getMatchStats(args.fixtureId);
  const m = buildTweetMessages("post_match", "professional", {
    score: args.score,
    possession: stats.possession ?? "n/a",
    xg: stats.xg ?? "n/a",
    shotsOnTarget: stats.shotsOnTarget ?? "n/a",
    shotsTotal: stats.shotsTotal ?? "n/a",
    motm: "n/a",
    motmRating: "n/a",
  });
  const llm = await routeAndChat({ messages: m });
  const tweet = normalizeTweet(llm.content);
  if (!tweet) return json({ skipped: "llm produced SKIP" });

  let tweetId = "";
  if (!flags.publish_draft_only) {
    const res = await publishTweetForUser(tweet);
    tweetId = res.id || "";
  }
  await db.insert(messages).values({
    direction: "out",
    content: tweet,
    modelUsed: llm.model,
  });
  return json({ type: "post_match", tweet, posted: Boolean(tweetId), tweetId });
}

function json(obj: unknown, status = 200): Response {
  return new Response(JSON.stringify(obj), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-store",
    },
  });
}
