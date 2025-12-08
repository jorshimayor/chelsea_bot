import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import * as schema from "./schema";
import { env } from "@shared/env";

const sql = neon(env.NEON_DATABASE_URL);
export const db = drizzle(sql, { schema });
