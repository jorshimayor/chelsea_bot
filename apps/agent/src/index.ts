export const config = { runtime: "edge" };
import { env } from "@shared/env";
import { routeAndStream } from "@shared/openrouter";
import { startTrace, endTrace } from "@observability/index";

function streamText(text: string): ReadableStream<Uint8Array> {
  const enc = new TextEncoder();
  const chunks = text.match(/.{1,120}/g) || [text];
  return new ReadableStream({
    start(controller) {
      let i = 0;
      const push = () => {
        if (i >= chunks.length) {
          controller.close();
          return;
        }
        controller.enqueue(enc.encode(chunks[i++]));
        setTimeout(push, 25);
      };
      push();
    },
  });
}

export default async function handler(req: Request): Promise<Response> {
  try {
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
  } catch (e) {
    void env;
    return new Response("error", { status: 500 });
  }
}
