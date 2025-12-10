import { startOAuth } from "../../packages/shared/x";
import { withErrorLogging } from "../../packages/observability/index";

export const config = { runtime: "edge" };

export default withErrorLogging(async function handler(req: Request): Promise<Response> {
  const state = crypto.randomUUID();
  const { url } = await startOAuth(state);
  return Response.redirect(url, 302);
});
