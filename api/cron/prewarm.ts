export const config = { runtime: "edge" };

import { withErrorLogging } from "../../packages/observability/index";

export default withErrorLogging(async function handler(): Promise<Response> {
  const started = Date.now();
  const ms = Date.now() - started;
  return new Response("ok", { status: 200, headers: { "x-prewarm-ms": String(ms), "Cache-Control": "no-store" } });
});
