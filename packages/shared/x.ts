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

import { env } from "./env";
import { db } from "@db/client";
import { oauthTokens } from "@db/schema";
import { desc, eq } from "drizzle-orm";

function basicAuthHeader(user: string, pass: string): string {
  const raw = `${user}:${pass}`;
  const b64 =
    typeof (globalThis as any).btoa === "function"
      ? (globalThis as any).btoa(raw)
      : Buffer.from(raw, "utf8").toString("base64");
  return `Basic ${b64}`;
}

export async function publishTweet(token: string, text: string): Promise<{ id: string }> {
  const res = await fetch("https://api.twitter.com/2/tweets", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ text }),
  });
  const json = (await res.json()) as any;
  return { id: json?.data?.id || "" };
}

export async function startOAuth(state: string): Promise<{ url: string; verifier: string }> {
  const url = createAuthUrl(env.X_CLIENT_ID || "", env.X_REDIRECT_URI || "", state);
  return { url, verifier: state };
}

export async function completeOAuth(state: string, code: string): Promise<{ accessToken: string; refreshToken?: string; expiresAt?: Date }> {
  const clientId = env.X_CLIENT_ID || "";
  const clientSecret = env.X_CLIENT_SECRET || "";
  const redirectUri = env.X_REDIRECT_URI || "";

  const body = new URLSearchParams({
    grant_type: "authorization_code",
    client_id: clientId,
    code,
    redirect_uri: redirectUri,
    code_verifier: state,
  });

  const headers: Record<string, string> = {
    "Content-Type": "application/x-www-form-urlencoded",
  };
  if (clientSecret) headers.Authorization = basicAuthHeader(clientId, clientSecret);

  const res = await fetch("https://api.twitter.com/2/oauth2/token", {
    method: "POST",
    headers,
    body,
  });
  const json = (await res.json()) as any;
  const accessToken = json?.access_token || "";
  const refreshToken = json?.refresh_token || undefined;
  const expiresIn = json?.expires_in || 0;
  const expiresAt = new Date(Date.now() + Number(expiresIn || 0) * 1000);
  await db.insert(oauthTokens).values({ platform: "x", accessToken, refreshToken: refreshToken || null, expiresAt });
  return { accessToken, refreshToken, expiresAt };
}

export async function getLatestToken(userId?: number): Promise<{ accessToken: string; refreshToken?: string; expiresAt?: Date } | null> {
  const rows = await db.select().from(oauthTokens).orderBy(desc(oauthTokens.createdAt)).limit(1);
  if (!rows[0]) return null;
  return { accessToken: rows[0].accessToken, refreshToken: rows[0].refreshToken || undefined, expiresAt: rows[0].expiresAt || undefined };
}

export async function refreshAccessToken(rt: string): Promise<{ accessToken: string; refreshToken?: string; expiresAt?: Date }> {
  const clientId = env.X_CLIENT_ID || "";
  const clientSecret = env.X_CLIENT_SECRET || "";

  const body = new URLSearchParams({
    grant_type: "refresh_token",
    refresh_token: rt,
    client_id: clientId,
  });

  const headers: Record<string, string> = {
    "Content-Type": "application/x-www-form-urlencoded",
  };
  if (clientSecret) headers.Authorization = basicAuthHeader(clientId, clientSecret);

  const res = await fetch("https://api.twitter.com/2/oauth2/token", {
    method: "POST",
    headers,
    body,
  });
  const json = (await res.json()) as any;
  const accessToken = json?.access_token || "";
  const refreshToken = json?.refresh_token || undefined;
  const expiresIn = json?.expires_in || 0;
  const expiresAt = new Date(Date.now() + Number(expiresIn || 0) * 1000);
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
  return publishTweet(at, text);
}
