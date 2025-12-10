import { setCache, getCache } from "./cache";
import Parser from "rss-parser";
import { env } from "@shared/env";
import { db } from "../db/client";
import { newsCache, statCache } from "@db/schema";
import { eq } from "drizzle-orm";
import { generateImage as orGenerateImage } from "../shared/openrouter";

export async function getLiveEvents(input: { matchId?: string }) {
  const key = `live:${input.matchId || "latest"}`;
  const cached = await getCache<any>(key);
  if (cached) return cached;
  const url = input.matchId
    ? `https://v3.football.api-sports.io/fixtures?id=${input.matchId}`
    : `https://v3.football.api-sports.io/fixtures?live=all`;
  const res = await fetch(url, {
    headers: { "x-apisports-key": env.API_FOOTBALL_KEY || "" },
  });
  const json = await res.json();
  const data = {
    events: json.response || [],
    matchId: input.matchId,
    citation: url,
  };
  await setCache(key, data, 10_000);
  return data;
}

export async function getPlayerStats(input: { name: string; season?: string }) {
  const key = `stats:${input.name}:${input.season || ""}`;
  const hot = await getCache<any>(key);
  if (hot) return hot;
  const warm = await db
    .select()
    .from(statCache)
    .where(eq(statCache.key, key))
    .limit(1);
  if (warm[0] && warm[0].expiresAt && warm[0].expiresAt > new Date()) {
    const data = warm[0].data as any;
    await setCache(key, data, 60_000);
    return data;
  }
  const url = `https://v3.football.api-sports.io/players?search=${encodeURIComponent(
    input.name
  )}${input.season ? `&season=${input.season}` : ""}`;
  const res = await fetch(url, {
    headers: { "x-apisports-key": env.API_FOOTBALL_KEY || "" },
  });
  const json = await res.json();
  const data = {
    name: input.name,
    season: input.season,
    stats: json.response || [],
    citation: url,
  };
  await setCache(key, data, 6 * 60 * 60 * 1000);
  await db
    .insert(statCache)
    .values({ key, data, expiresAt: new Date(Date.now() + 6 * 60 * 60 * 1000) })
    .onConflictDoUpdate({
      target: statCache.key,
      set: { data, expiresAt: new Date(Date.now() + 6 * 60 * 60 * 1000) },
    });
  return data;
}

export async function fetchQuotes(input: { player: string; days?: number }) {
  const key = `quotes:${input.player}:${input.days || 0}`;
  const cached = await getCache<any>(key);
  if (cached) return cached;
  const tavilyUrl = "https://api.tavily.com/search";
  const body = {
    api_key: env.TAVILY_API_KEY || "",
    query: `${input.player} quotes site:x.com OR site:twitter.com`,
    max_results: 5,
  };
  const res = await fetch(tavilyUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const json = await res.json();
  const data = {
    player: input.player,
    quotes: json.results || [],
    citation: tavilyUrl,
  };
  await setCache(key, data, 24 * 60 * 60 * 1000);
  return data;
}

export async function fetchNews(input: { player?: string; hours?: number }) {
  const key = `news:${input.player || "all"}:${input.hours || 0}`;
  const hot = await getCache<any>(key);
  if (hot) return hot;
  const warm = await db.select().from(newsCache).limit(1);
  if (warm[0] && warm[0].expiresAt && warm[0].expiresAt > new Date()) {
    const data = warm[0].data as any;
    await setCache(key, data, 60_000);
    return data;
  }
  const parser = new Parser();
  const feed = await parser.parseURL(
    "https://www.chelseafc.com/en/news/latest.rss"
  );
  const data = {
    player: input.player,
    articles: feed.items || [],
    citation: "https://www.chelseafc.com/en/news/latest.rss",
  };
  await setCache(key, data, 4 * 60 * 60 * 1000);
  await db
    .insert(newsCache)
    .values({
      player: input.player || null,
      data,
      expiresAt: new Date(Date.now() + 4 * 60 * 60 * 1000),
    });
  return data;
}

export async function fetchExpertCommentary(input: { player: string }) {
  const key = `commentary:${input.player}`;
  const cached = await getCache<any>(key);
  if (cached) return cached;
  const tavilyUrl = "https://api.tavily.com/search";
  const body = {
    api_key: env.TAVILY_API_KEY || "",
    query: `${input.player} analysis site:youtube.com`,
    max_results: 5,
  };
  const res = await fetch(tavilyUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const json = await res.json();
  const data = {
    player: input.player,
    items: json.results || [],
    citation: tavilyUrl,
  };
  await setCache(key, data, 48 * 60 * 60 * 1000);
  return data;
}

export async function generateImage(input: {
  prompt: string;
  style: "chelsea";
}) {
  const key = `image:${input.prompt}:${input.style}`;
  const cached = await getCache<any>(key);
  if (cached) return cached;
  const gen = await orGenerateImage({
    prompt: `${input.style} ${input.prompt}`,
    size: "1024x1024",
  });
  const data = {
    url: gen.url || "",
    prompt: input.prompt,
    style: input.style,
    citation: gen.model,
  };
  await setCache(key, data, 24 * 60 * 60 * 1000);
  return data;
}
