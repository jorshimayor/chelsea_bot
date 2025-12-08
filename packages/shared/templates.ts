import { redis } from "./redis";
import templates from "../../data/templates.json";

export async function getTemplates(): Promise<string[]> {
  if (redis) {
    const v = await redis.get<string>("templates");
    if (v) return JSON.parse(v) as string[];
  }
  return templates as unknown as string[];
}

export async function getTemplateForTone(tone: "professional" | "savage"): Promise<string> {
  const list = await getTemplates();
  const key = tone === "savage" ? "Savage" : "Professional";
  const filtered = list.filter((t) => t.toLowerCase().includes(key.toLowerCase()));
  const src = filtered.length ? filtered : list;
  const i = Math.floor(Math.random() * src.length);
  return src[i];
}
