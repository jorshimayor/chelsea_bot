export const config = { runtime: "edge" };

import { routeAndChat } from "../packages/shared/openrouter";
import {
  buildTweetMessages,
  normalizeTweet,
  TweetKind,
  Tone,
} from "../packages/shared/tweet-prompts";
import { withErrorLogging } from "../packages/observability/index";

const VALID_KINDS: TweetKind[] = [
  "match_preview",
  "live_update",
  "post_match",
  "player_stat",
  "transfer_news",
  "weekly_deep_dive",
];

type Body = {
  kind: TweetKind;
  tone?: Tone;
  data: Record<string, unknown>;
};

export default withErrorLogging(async function handler(
  req: Request
): Promise<Response> {
  if (req.method !== "POST") {
    return json({ error: "POST only" }, 405);
  }
  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return json({ error: "invalid JSON" }, 400);
  }
  if (!body || !VALID_KINDS.includes(body.kind)) {
    return json({ error: "invalid kind", allowed: VALID_KINDS }, 400);
  }
  const tone: Tone = body.tone === "savage" ? "savage" : "professional";
  const messages = buildTweetMessages(body.kind, tone, body.data || {});
  const res = await routeAndChat({ messages });
  const tweet = normalizeTweet(res.content);
  return json({
    kind: body.kind,
    tone,
    model: res.model,
    tweet,
    length: tweet.length,
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
