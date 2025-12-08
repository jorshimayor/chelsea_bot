import { env } from "@shared/env";

type Trace = { name: string; ts: number; attrs?: Record<string, unknown> };

export function startTrace(name: string, attrs?: Record<string, unknown>): Trace {
  return { name, ts: Date.now(), attrs };
}

export async function endTrace(t: Trace): Promise<void> {
  if (!env.OTLP_ENDPOINT) return;
  const payload = { name: t.name, ts: t.ts, attrs: t.attrs, endTs: Date.now() };
  try { await fetch(env.OTLP_ENDPOINT, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) }); } catch {}
}

export function initSentry(dsn?: string): void {
  void dsn;
}
