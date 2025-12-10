export const config = { runtime: "edge" };
import { publishTweetForUser } from "../../packages/shared/x";
import { withErrorLogging } from "../../packages/observability/index";

export default withErrorLogging(async function handler(req: Request): Promise<Response> {
  const u = new URL(req.url);
  const text = u.searchParams.get("text") || "BlueBanter test post";
  const confirm = u.searchParams.get("confirm") || "0";
  if (confirm !== "1") {
    return new Response(JSON.stringify({ preview: text, note: "Set confirm=1 to post" }), { status: 200, headers: { "Content-Type": "application/json" } });
  }
  const res = await publishTweetForUser(text);
  return new Response(JSON.stringify({ id: res.id || "" }), { status: 200, headers: { "Content-Type": "application/json" } });
});
