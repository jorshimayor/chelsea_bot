import { AgentState, NodeHandler } from "@shared/types";
import { routeAndChat, routeAndStream } from "@shared/openrouter";
import { getLiveEvents, getPlayerStats, fetchNews, fetchQuotes, fetchExpertCommentary, generateImage } from "@tools/index";
import { filterContent, protectChelseaFan } from "@shared/safety";
import { db } from "@db/client";
import { conversations, messages, users } from "@db/schema";
import flags from "../../config/flags.json";
import { context, trace } from "@opentelemetry/api";
import { startTrace, endTrace } from "@observability/index";
import { once } from "@shared/redis";
import { publishTweetForUser } from "@shared/x";
import { getTemplateForTone } from "@shared/templates";

type Node = { name: string; handler: NodeHandler };

class StateGraph {
  private nodes: Map<string, Node> = new Map();
  private edges: Map<string, string[]> = new Map();
  addNode(name: string, handler: NodeHandler) {
    this.nodes.set(name, { name, handler });
    return this;
  }
  addEdge(from: string, to: string) {
    const list = this.edges.get(from) || [];
    list.push(to);
    this.edges.set(from, list);
    return this;
  }
  compile(opts: { checkpointer: unknown; interruptBefore: string[] }) {
    const run = async (start: string, state: AgentState) => {
      let current = start;
      let s = state;
      while (current) {
        const node = this.nodes.get(current);
        if (!node) break;
        s = await node.handler(s);
        const next = this.edges.get(current)?.[0];
        current = next || "";
      }
      return s;
    };
    return { run };
  }
}

const ingressNode: NodeHandler = async (state) => state;
const userLookupNode: NodeHandler = async (state) => {
  const t = startTrace("userLookup");
  const s = await db.select().from(users).limit(1);
  await endTrace(t);
  return { ...state, user: s[0] as any };
};
const toneClassifierNode: NodeHandler = async (state) => {
  const t = startTrace("toneClassifier");
  const res = await routeAndChat({ messages: [{ role: "system", content: "classify tone professional or savage" }, { role: "user", content: state.messages[state.messages.length - 1]?.content || "" }] });
  const tone = res.content.includes("savage") ? "savage" : "professional";
  await endTrace(t);
  return { ...state, tone };
};
const parallelToolNode: NodeHandler = async (state) => {
  const [live, stats, news, quotes, expert] = await Promise.all([
    getLiveEvents({}),
    getPlayerStats({ name: state.user.favoritePlayer || "Chelsea" }),
    fetchNews({}),
    fetchQuotes({ player: state.user.favoritePlayer || "Chelsea" }),
    fetchExpertCommentary({ player: state.user.favoritePlayer || "Chelsea" })
  ]);
  const toolsNeeded = [live.citation, stats.citation, news.citation, quotes.citation, expert.citation].filter(Boolean) as string[];
  return { ...state, toolsNeeded };
};
const synthesisNode: NodeHandler = async (state) => {
  const t = startTrace("synthesis");
  const tpl = await getTemplateForTone(state.tone);
  const citations = state.toolsNeeded.map((c) => `[${c}]`).join(" ");
  const { stream } = await routeAndStream({ messages: [{ role: "system", content: tpl }, { role: "user", content: citations }] });
  const dec = new TextDecoder();
  let acc = "";
  const reader = stream.getReader();
  while (true) {
    const r = await reader.read();
    if (r.done) break;
    const chunk = dec.decode(r.value);
    const ct = startTrace("synthesis-chunk", { len: chunk.length });
    acc += chunk;
    await endTrace(ct);
  }
  await endTrace(t);
  return { ...state, finalReply: acc };
};
const safetyFilterNode: NodeHandler = async (state) => {
  const protectedState = protectChelseaFan(state);
  const cleaned = filterContent(protectedState.finalReply || "");
  return { ...protectedState, finalReply: cleaned };
};
const imageGenerationNode: NodeHandler = async (state) => {
  if (!flags.image_generation_enabled) return state;
  const img = await generateImage({ prompt: state.finalReply || "", style: "chelsea" });
  return { ...state, imageUrl: img.url };
};
const publishToXNode: NodeHandler = async (state) => {
  if (flags.publish_draft_only) return state;
  const idKey = `tweet:${(state.finalReply || "").slice(0, 64)}`;
  const ok = await once(idKey, 600);
  if (!ok) return state;
  await publishTweetForUser(state.finalReply || "");
  return state;
};
const persistNode: NodeHandler = async (state) => {
  await db.insert(messages).values({ direction: "out", content: state.finalReply || "", imageUrl: state.imageUrl || null });
  return state;
};

const workflow = new StateGraph()
  .addNode("ingress", ingressNode)
  .addNode("userLookup", userLookupNode)
  .addNode("toneClassifier", toneClassifierNode)
  .addNode("parallelTools", parallelToolNode)
  .addNode("synthesis", synthesisNode)
  .addNode("safety", safetyFilterNode)
  .addNode("image", imageGenerationNode)
  .addNode("publish", publishToXNode)
  .addNode("persist", persistNode)
  .addEdge("__start__", "ingress")
  .addEdge("ingress", "userLookup")
  .addEdge("userLookup", "toneClassifier")
  .addEdge("toneClassifier", "parallelTools")
  .addEdge("parallelTools", "synthesis")
  .addEdge("synthesis", "safety")
  .addEdge("safety", "image")
  .addEdge("image", "publish")
  .addEdge("publish", "persist")
  .addEdge("persist", "__end__");

export const agent = workflow.compile({ checkpointer: {}, interruptBefore: ["safety"] });
