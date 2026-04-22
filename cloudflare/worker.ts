import dashboardHtml from "../public/index.html";

import apiIndex from "../api/index";
import apiDashboard from "../api/dashboard";
import apiGenerateTweet from "../api/generate-tweet";
import cronPrewarm from "../api/cron/prewarm";
import cronFixtures from "../api/cron/fixtures";
import cronWeekly from "../api/cron/weekly";
import cronMatchDay from "../api/cron/match-day";
import xAuth from "../api/x/auth";
import xCallback from "../api/x/callback";
import xPublish from "../api/x/publish";
import testTools from "../api/test/tools";

type EnvBindings = Record<string, string | undefined>;

function setProcessEnv(env: EnvBindings): void {
  const g = globalThis as any;
  if (!g.process) g.process = {};
  const normalized: Record<string, string | undefined> = {};
  for (const [k, v] of Object.entries(env || {})) {
    normalized[k] = v;
    if (k.startsWith("env.")) {
      normalized[k.slice(4)] = v;
    }
  }
  const nested = (env as any)?.env;
  if (nested && typeof nested === "object") {
    for (const [k, v] of Object.entries(nested)) {
      normalized[k] = v as any;
    }
  }
  g.process.env = { ...(g.process.env || {}), ...normalized };
}

function notFound(): Response {
  return new Response("Not Found", { status: 404 });
}

function serveDashboard(): Response {
  return new Response(dashboardHtml, {
    status: 200,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}

async function callHandler(
  handler: ((req: Request) => Promise<Response>) | (() => Promise<Response>),
  req: Request
): Promise<Response> {
  if ((handler as any).length === 0) return (handler as any)();
  return (handler as any)(req);
}

export default {
  async fetch(req: Request, env: EnvBindings): Promise<Response> {
    setProcessEnv(env);
    const url = new URL(req.url);
    const p = url.pathname;

    if (p === "/" || p === "/index.html") return serveDashboard();

    if (p === "/api/index") return callHandler(apiIndex as any, req);
    if (p === "/api/dashboard") return callHandler(apiDashboard as any, req);
    if (p === "/api/generate-tweet") return callHandler(apiGenerateTweet as any, req);

    if (p === "/api/cron/prewarm") return callHandler(cronPrewarm as any, req);
    if (p === "/api/cron/fixtures") return callHandler(cronFixtures as any, req);
    if (p === "/api/cron/weekly") return callHandler(cronWeekly as any, req);
    if (p === "/api/cron/match-day") return callHandler(cronMatchDay as any, req);

    if (p === "/api/x/auth") return callHandler(xAuth as any, req);
    if (p === "/api/x/callback") return callHandler(xCallback as any, req);
    if (p === "/api/x/publish") return callHandler(xPublish as any, req);

    if (p === "/api/test/tools") return callHandler(testTools as any, req);

    return notFound();
  },

  async scheduled(event: any, env: EnvBindings): Promise<void> {
    setProcessEnv(env);
    const cron = (event as any).cron as string | undefined;

    if (cron === "*/5 * * * *") {
      await callHandler(cronPrewarm as any, new Request("https://local/api/cron/prewarm"));
      await callHandler(cronMatchDay as any, new Request("https://local/api/cron/match-day"));
      return;
    }

    if (cron === "0 7 * * *") {
      await callHandler(cronFixtures as any, new Request("https://local/api/cron/fixtures"));
      return;
    }

    if (cron === "0 9 * * 1") {
      await callHandler(cronWeekly as any, new Request("https://local/api/cron/weekly"));
    }
  },
};
