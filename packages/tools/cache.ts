import { redis } from "@shared/redis";

type Entry<T> = { value: T; expiresAt: number };
const store = new Map<string, Entry<unknown>>();

export async function setCache<T>(key: string, value: T, ttlMs: number) {
  if (redis) {
    await redis.set(key, JSON.stringify(value), { ex: Math.ceil(ttlMs / 1000) });
    return;
  }
  store.set(key, { value, expiresAt: Date.now() + ttlMs });
}

export async function getCache<T>(key: string): Promise<T | undefined> {
  if (redis) {
    const v = await redis.get<string>(key);
    return v ? (JSON.parse(v) as T) : undefined;
  }
  const e = store.get(key);
  if (!e) return undefined;
  if (Date.now() > e.expiresAt) {
    store.delete(key);
    return undefined;
  }
  return e.value as T;
}
