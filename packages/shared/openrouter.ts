import OpenAI from "openai";
import { env } from "./env";

type Model = { id: string; maxOutputTokens: number; priceRank: number };

const models: Model[] = [
  { id: "x-ai/grok-4.1-fast", maxOutputTokens: 1200, priceRank: 1 },
  { id: "anthropic/claude-3-5-sonnet-20241022", maxOutputTokens: 1200, priceRank: 2 },
  { id: "meta/llama-3.1-405b", maxOutputTokens: 1200, priceRank: 3 },
  { id: "qwen/qwen-2.5-110b", maxOutputTokens: 1200, priceRank: 4 }
];

export type ChatInput = { messages: { role: string; content: string }[] };
export type ChatOutput = { id: string; model: string; content: string };

const client = new OpenAI({ baseURL: "https://openrouter.ai/api/v1", apiKey: env.OPENROUTER_API_KEY });

export async function routeAndChat(input: ChatInput): Promise<ChatOutput> {
  const model = models[0];
  const res = await client.chat.completions.create({ model: model.id, messages: input.messages as OpenAI.ChatCompletionMessageParam[], max_tokens: model.maxOutputTokens });
  const content = res.choices?.[0]?.message?.content || "";
  return { id: res.id || "", model: model.id, content };
}

export async function routeAndStream(input: ChatInput): Promise<{ stream: ReadableStream<Uint8Array>; usage: Promise<number> }> {
  const model = models[0];
  const enc = new TextEncoder();
  const res = await client.chat.completions.create({ model: model.id, messages: input.messages as OpenAI.ChatCompletionMessageParam[], max_tokens: model.maxOutputTokens, stream: true });
  const it = res as any;
  let totalTokens = 0;
  const usagePromise = (async () => totalTokens)();
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      for await (const ev of it) {
        const delta = ev?.choices?.[0]?.delta?.content || ev?.choices?.[0]?.message?.content || "";
        if (ev?.usage?.total_tokens) totalTokens = ev.usage.total_tokens;
        if (delta) controller.enqueue(enc.encode(delta));
      }
      controller.close();
    }
  });
  return { stream, usage: usagePromise };
}

export async function generateImage(input: { prompt: string; size?: string; modelId?: string }): Promise<{ url: string; model: string }> {
  const model = input.modelId || "black-forest-labs/flux-pro";
  const size = input.size || "1024x1024";
  const res = await (client as any).images.generate({ model, prompt: input.prompt, size });
  const first = res?.data?.[0] || {};
  const url = first.url || (first.b64_json ? `data:image/png;base64,${first.b64_json}` : "");
  return { url, model };
}
