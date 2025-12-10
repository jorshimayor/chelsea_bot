export const config = { runtime: "edge" };
import {
  getLiveEvents,
  getPlayerStats,
  fetchNews,
  fetchQuotes,
  fetchExpertCommentary,
  generateImage,
} from "../../packages/tools/index";
import { withErrorLogging } from "../../packages/observability/index";

export default withErrorLogging(async function handler(req: Request): Promise<Response> {
  const u = new URL(req.url);
  const player = u.searchParams.get("player") || "Chelsea";
  const matchId = u.searchParams.get("matchId") || undefined;
  const prompt = u.searchParams.get("prompt") || `${player} banter`;
  const live = await getLiveEvents({ matchId });
  const stats = await getPlayerStats({ name: player });
  const news = await fetchNews({ player });
  const quotes = await fetchQuotes({ player });
  const expert = await fetchExpertCommentary({ player });
  const image = await generateImage({ prompt, style: "chelsea" });
  const body = JSON.stringify({
    ok: true,
    citations: [
      live.citation,
      stats.citation,
      news.citation,
      quotes.citation,
      expert.citation,
    ].filter(Boolean),
    counts: {
      live: (live.events || []).length,
      stats: (stats.stats || []).length,
      news: (news.articles || []).length,
      quotes: (quotes.quotes || []).length,
      expert: (expert.items || []).length,
    },
    imageUrl: image.url,
  });
  return new Response(body, {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
});
