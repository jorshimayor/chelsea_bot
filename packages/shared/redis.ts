import { Redis } from "@upstash/redis";
import { env } from "./env";

export const redis = env.UPSTASH_REDIS_URL && env.UPSTASH_REDIS_TOKEN ? new Redis({ url: env.UPSTASH_REDIS_URL, token: env.UPSTASH_REDIS_TOKEN }) : undefined;

export async function once(key: string, ttlSec: number): Promise<boolean> {
  if (!redis) return true;
  const r = await redis.set(key, "1", { nx: true, ex: ttlSec });
  return r === "OK";
}
