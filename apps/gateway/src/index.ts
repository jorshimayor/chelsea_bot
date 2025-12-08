const buckets = new Map<string, { count: number; reset: number }>();

function rateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const b = buckets.get(key) || { count: 0, reset: now + windowMs };
  if (now > b.reset) {
    b.count = 0;
    b.reset = now + windowMs;
  }
  if (b.count >= limit) return false;
  b.count += 1;
  buckets.set(key, b);
  return true;
}

export default {
  async fetch(req: Request): Promise<Response> {
    const ip = req.headers.get("cf-connecting-ip") || "";
    const ok = rateLimit(ip, 60, 60_000);
    if (!ok) return new Response("rate limited", { status: 429 });
    return fetch("https://vercel.edge/agent", { method: req.method, headers: req.headers, body: req.body as BodyInit });
  }
};
