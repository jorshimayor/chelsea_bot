export function createAuthUrl(clientId: string, redirectUri: string, state: string): string {
  const u = new URL("https://twitter.com/i/oauth2/authorize");
  u.searchParams.set("client_id", clientId);
  u.searchParams.set("redirect_uri", redirectUri);
  u.searchParams.set("response_type", "code");
  u.searchParams.set("scope", "tweet.read tweet.write users.read offline.access");
  u.searchParams.set("state", state);
  u.searchParams.set("code_challenge", state);
  u.searchParams.set("code_challenge_method", "plain");
  return u.toString();
}

import { TwitterApi } from "twitter-api-v2";
import { env } from "./env";
import { redis } from "./redis";
import { db } from "@db/client";
import { oauthTokens } from "@db/schema";
import { desc, eq } from "drizzle-orm";

export async function publishTweet(token: string, text: string): Promise<{ id: string }> {
  const client = new TwitterApi(token);
  const res = await client.v2.tweet(text);
  return { id: res.data.id };
}

export async function startOAuth(state: string): Promise<{ url: string; verifier: string }> {
  const client = new TwitterApi({ clientId: env.X_CLIENT_ID || "", clientSecret: env.X_CLIENT_SECRET || "" });
  const { url, codeVerifier, state: s } = client.generateOAuth2AuthLink(env.X_REDIRECT_URI || "", { scope: ["tweet.read", "tweet.write", "users.read", "offline.access"] });
  if (redis) await redis.set(`x:verifier:${s}`, codeVerifier, { ex: 600 });
  return { url, verifier: codeVerifier };
}

export async function completeOAuth(state: string, code: string): Promise<{ accessToken: string; refreshToken?: string; expiresAt?: Date }> {
  const client = new TwitterApi({ clientId: env.X_CLIENT_ID || "", clientSecret: env.X_CLIENT_SECRET || "" });
  const verifier = redis ? await redis.get<string>(`x:verifier:${state}`) : undefined;
  const { accessToken, refreshToken, expiresIn } = await client.loginWithOAuth2({ code, codeVerifier: verifier || state, redirectUri: env.X_REDIRECT_URI || "" });
  const expiresAt = new Date(Date.now() + (expiresIn || 0) * 1000);
  await db.insert(oauthTokens).values({ platform: "x", accessToken, refreshToken: refreshToken || null, expiresAt });
  return { accessToken, refreshToken, expiresAt };
}

export async function getLatestToken(userId?: number): Promise<{ accessToken: string; refreshToken?: string; expiresAt?: Date } | null> {
  const rows = await db.select().from(oauthTokens).orderBy(desc(oauthTokens.createdAt)).limit(1);
  if (!rows[0]) return null;
  return { accessToken: rows[0].accessToken, refreshToken: rows[0].refreshToken || undefined, expiresAt: rows[0].expiresAt || undefined };
}

export async function refreshAccessToken(rt: string): Promise<{ accessToken: string; refreshToken?: string; expiresAt?: Date }> {
  const client = new TwitterApi({ clientId: env.X_CLIENT_ID || "", clientSecret: env.X_CLIENT_SECRET || "" });
  const { accessToken, refreshToken, expiresIn } = await client.refreshOAuth2Token(rt);
  const expiresAt = new Date(Date.now() + (expiresIn || 0) * 1000);
  await db.insert(oauthTokens).values({ platform: "x", accessToken, refreshToken: refreshToken || null, expiresAt });
  return { accessToken, refreshToken, expiresAt };
}

export async function ensureAccessToken(): Promise<string | null> {
  const tok = await getLatestToken();
  if (!tok) return null;
  const soon = tok.expiresAt ? tok.expiresAt.getTime() - Date.now() < 60_000 : false;
  if (soon && tok.refreshToken) {
    const r = await refreshAccessToken(tok.refreshToken);
    return r.accessToken;
  }
  return tok.accessToken;
}

export async function publishTweetForUser(text: string): Promise<{ id: string }> {
  const at = await ensureAccessToken();
  if (!at) return { id: "" };
  const client = new TwitterApi(at);
  const res = await client.v2.tweet(text);
  return { id: res.data.id };
}
