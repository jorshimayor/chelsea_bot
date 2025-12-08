import { AgentState } from "./types";

const banned = [
  "racist",
  "sexist",
  "homophobic",
  "slur"
];

export function classifyTone(state: AgentState): "professional" | "savage" {
  if (state.user.isChelseaFan) return "professional";
  return state.tone || "professional";
}

export function filterContent(text: string): string {
  let t = text;
  for (const b of banned) {
    const re = new RegExp(b, "ig");
    t = t.replace(re, "");
  }
  return t;
}

export function protectChelseaFan(state: AgentState): AgentState {
  if (state.user.isChelseaFan && state.tone === "savage") {
    return { ...state, tone: "professional" };
  }
  return state;
}
