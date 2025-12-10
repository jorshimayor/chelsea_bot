export const config = { runtime: "edge" };

export default async function handler(): Promise<Response> {
  const started = Date.now();
  // minimal work to keep the edge runtime warm
  const ms = Date.now() - started;
  return new Response("ok", { status: 200, headers: { "x-prewarm-ms": String(ms), "Cache-Control": "no-store" } });
}

