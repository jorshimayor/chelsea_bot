import { env } from "@shared/env";
import * as Sentry from "@sentry/vercel-edge";

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

let sentryReady = false;

function ensureSentry(): void {
  if (sentryReady) return;
  if (env.SENTRY_DSN) {
    Sentry.init({ dsn: env.SENTRY_DSN });
    sentryReady = true;
  }
}

function errorId(): string {
  const g = (globalThis as any).crypto;
  if (g && g.randomUUID) return g.randomUUID();
  return `${Date.now()}-${Math.floor(Math.random() * 1e6)}`;
}

export function withErrorLogging(handler: (req: Request) => Promise<Response>): (req: Request) => Promise<Response> {
  return async (req: Request) => {
    try {
      return await handler(req);
    } catch (e: any) {
      ensureSentry();
      const id = errorId();
      const url = req.url;
      const method = req.method;
      const msg = e?.message || String(e);
      const stack = e?.stack || "";
      try { Sentry.captureException(e, { tags: { error_id: id }, extra: { url, method } }); } catch {}
      if (env.OTLP_ENDPOINT) {
        const payload = { type: "error", id, url, method, msg, stack };
        try { await fetch(env.OTLP_ENDPOINT, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) }); } catch {}
      }
      const body = JSON.stringify({ ok: false, error: { id, message: msg } });
      return new Response(body, { status: 500, headers: { "Content-Type": "application/json", "x-error-id": id } });
    }
  };
}
