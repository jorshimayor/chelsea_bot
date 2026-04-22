import { neon } from "@neondatabase/serverless";
import { neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";
import { env } from "@shared/env";

if (typeof (globalThis as any).WebSocket !== "undefined") {
  neonConfig.webSocketConstructor = (globalThis as any).WebSocket;
}

let _db: ReturnType<typeof drizzle> | null = null;

function getDb(): ReturnType<typeof drizzle> {
  if (_db) return _db;
  const sql = neon(env.NEON_DATABASE_URL);
  _db = drizzle(sql, { schema });
  return _db;
}

export const db = new Proxy({} as ReturnType<typeof drizzle>, {
  get(_target, prop: string | symbol) {
    return (getDb() as any)[prop as any];
  },
}) as ReturnType<typeof drizzle>;
