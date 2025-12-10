import { completeOAuth } from "../../packages/shared/x";
import { withErrorLogging } from "../../packages/observability/index";

export const config = { runtime: "edge" };

export default withErrorLogging(async function handler(req: Request): Promise<Response> {
  const u = new URL(req.url);
  const state = u.searchParams.get("state") || "";
  const code = u.searchParams.get("code") || "";
  const t = await completeOAuth(state, code);
  return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { "Content-Type": "application/json" } });
});
