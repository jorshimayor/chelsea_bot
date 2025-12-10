export const config = { runtime: "edge" };
import * as Sentry from "@sentry/vercel-edge";
import { env } from "../packages/shared/env";
import { routeAndStream } from "../packages/shared/openrouter";
import { startTrace, endTrace } from "../packages/observability/index";
import { withErrorLogging } from "../packages/observability/index";

Sentry.init({ dsn: env.SENTRY_DSN || "" });

export default withErrorLogging(async function handler(
  req: Request
): Promise<Response> {
  const citations = (req.headers.get("x-citations") || "")
    .split(" ")
    .filter(Boolean);
  const t = startTrace("openrouter-stream", { citations });
  const { stream, usage } = await routeAndStream({
    messages: [
      { role: "system", content: "You are BlueBanter" },
      { role: "user", content: citations.join(" ") },
    ],
  });
  const usageValue = await usage;
  await endTrace(t);
  return new Response(stream, {
    status: 200,
    headers: {
      "Content-Type": "text/plain",
      "x-token-usage": String(usageValue),
    },
  });
});
