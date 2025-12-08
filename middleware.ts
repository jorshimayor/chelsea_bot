const started = Date.now();

export default function middleware(req: Request): Response {
  const ms = Date.now() - started;
  return new Response(null, { status: 204, headers: { "x-cold-start-ms": String(ms) } });
}
