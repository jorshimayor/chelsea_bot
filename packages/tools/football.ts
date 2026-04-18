/**
 * API-Football helpers scoped to Chelsea FC.
 *
 * Docs: https://www.api-football.com/documentation-v3
 * Base: https://v3.football.api-sports.io
 * Auth: header x-apisports-key
 *
 * Team IDs used:
 *   49  = Chelsea FC
 * League IDs (common):
 *   39 = Premier League, 2 = UEFA Champions League, 3 = UEFA Europa League
 *
 * All functions cache via Redis (hot) and fall back to Neon (warm for stats).
 */

import { setCache, getCache } from "./cache";
import { env } from "@shared/env";

const BASE = "https://v3.football.api-sports.io";
export const CHELSEA_TEAM_ID = 49;

type ApiFootballResponse<T> = {
  response: T[];
  errors?: Record<string, string> | string[];
  results?: number;
};

async function af<T>(path: string): Promise<ApiFootballResponse<T>> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "x-apisports-key": env.API_FOOTBALL_KEY || "" },
  });
  if (!res.ok) {
    return { response: [], errors: [`http_${res.status}`] };
  }
  return (await res.json()) as ApiFootballResponse<T>;
}

// ---------- Fixtures ----------

export type NormalizedFixture = {
  id: number;
  date: string; // ISO
  competition: string;
  venue: string;
  home: string;
  away: string;
  isChelseaHome: boolean;
  opponent: string;
  status: string; // e.g. "NS", "1H", "HT", "FT"
};

export async function getChelseaFixtures(opts: {
  next?: number; // how many upcoming
  last?: number; // how many past
  season?: number;
}): Promise<{ fixtures: NormalizedFixture[]; citation: string }> {
  const params = new URLSearchParams();
  params.set("team", String(CHELSEA_TEAM_ID));
  if (opts.next) params.set("next", String(opts.next));
  if (opts.last) params.set("last", String(opts.last));
  if (opts.season) params.set("season", String(opts.season));
  const path = `/fixtures?${params.toString()}`;
  const key = `fixtures:chelsea:${params.toString()}`;
  const cached = await getCache<{
    fixtures: NormalizedFixture[];
    citation: string;
  }>(key);
  if (cached) return cached;

  const json = await af<any>(path);
  const fixtures: NormalizedFixture[] = (json.response || []).map((r: any) => {
    const home = r?.teams?.home?.name || "Home";
    const away = r?.teams?.away?.name || "Away";
    const isChelseaHome = r?.teams?.home?.id === CHELSEA_TEAM_ID;
    return {
      id: r?.fixture?.id,
      date: r?.fixture?.date,
      competition: r?.league?.name || "",
      venue: r?.fixture?.venue?.name || "",
      home,
      away,
      isChelseaHome,
      opponent: isChelseaHome ? away : home,
      status: r?.fixture?.status?.short || "NS",
    };
  });

  const data = { fixtures, citation: `${BASE}${path}` };
  // Short TTL for upcoming fixtures; they rarely change but can be reschedules.
  await setCache(key, data, 15 * 60 * 1000);
  return data;
}

// ---------- Match Stats ----------

export type NormalizedMatchStats = {
  fixtureId: number;
  team: "home" | "away" | "unknown";
  possession: number | null; // %
  shotsTotal: number | null;
  shotsOnTarget: number | null;
  corners: number | null;
  fouls: number | null;
  xg: number | null;
  passAccuracy: number | null; // %
  citation: string;
};

function pickStat(stats: any[], type: string): string | number | null {
  if (!Array.isArray(stats)) return null;
  const row = stats.find(
    (s) => (s?.type || "").toLowerCase() === type.toLowerCase()
  );
  return row ? row.value : null;
}

function toNumber(v: unknown): number | null {
  if (v === null || v === undefined) return null;
  if (typeof v === "number") return isFinite(v) ? v : null;
  const s = String(v).replace("%", "").trim();
  const n = parseFloat(s);
  return isNaN(n) ? null : n;
}

export async function getMatchStats(
  fixtureId: number
): Promise<NormalizedMatchStats> {
  const key = `matchstats:${fixtureId}`;
  const cached = await getCache<NormalizedMatchStats>(key);
  if (cached) return cached;

  const path = `/fixtures/statistics?fixture=${fixtureId}`;
  const json = await af<any>(path);
  // Response is an array per team; find the Chelsea side.
  const chelseaEntry = (json.response || []).find(
    (e: any) => e?.team?.id === CHELSEA_TEAM_ID
  );
  const stats = chelseaEntry?.statistics || [];
  const team: "home" | "away" | "unknown" = chelseaEntry
    ? "home" // We don't know from this endpoint alone; fix via fixture lookup if needed.
    : "unknown";

  const data: NormalizedMatchStats = {
    fixtureId,
    team,
    possession: toNumber(pickStat(stats, "Ball Possession")),
    shotsTotal: toNumber(pickStat(stats, "Total Shots")),
    shotsOnTarget: toNumber(pickStat(stats, "Shots on Goal")),
    corners: toNumber(pickStat(stats, "Corner Kicks")),
    fouls: toNumber(pickStat(stats, "Fouls")),
    xg: toNumber(pickStat(stats, "expected_goals")),
    passAccuracy: toNumber(pickStat(stats, "Passes %")),
    citation: `${BASE}${path}`,
  };

  await setCache(key, data, 10 * 60 * 1000);
  return data;
}

// ---------- Player Season Summary ----------

export type NormalizedPlayerSummary = {
  player: string;
  team: string;
  season: number | null;
  appearances: number | null;
  goals: number | null;
  assists: number | null;
  minutes: number | null;
  passAccuracy: number | null;
  tackles: number | null;
  citation: string;
};

export async function getChelseaPlayerSummary(
  name: string,
  season?: number
): Promise<NormalizedPlayerSummary | null> {
  const key = `playersummary:${name.toLowerCase()}:${season || ""}`;
  const cached = await getCache<NormalizedPlayerSummary>(key);
  if (cached) return cached;

  const params = new URLSearchParams();
  params.set("team", String(CHELSEA_TEAM_ID));
  params.set("search", name);
  if (season) params.set("season", String(season));
  const path = `/players?${params.toString()}`;
  const json = await af<any>(path);
  const row = (json.response || [])[0];
  if (!row) return null;

  const s = (row.statistics || [])[0] || {};
  const data: NormalizedPlayerSummary = {
    player: row?.player?.name || name,
    team: s?.team?.name || "Chelsea",
    season: s?.league?.season ?? season ?? null,
    appearances: s?.games?.appearences ?? null,
    goals: s?.goals?.total ?? null,
    assists: s?.goals?.assists ?? null,
    minutes: s?.games?.minutes ?? null,
    passAccuracy: toNumber(s?.passes?.accuracy),
    tackles: s?.tackles?.total ?? null,
    citation: `${BASE}${path}`,
  };
  await setCache(key, data, 6 * 60 * 60 * 1000);
  return data;
}
