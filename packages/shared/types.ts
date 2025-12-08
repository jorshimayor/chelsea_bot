export type Direction = "in" | "out";

export type Message = {
  id?: string;
  content: string;
  direction: Direction;
  imageUrl?: string;
  modelUsed?: string;
};

export type User = {
  id: number;
  platform: string;
  username?: string | null;
  isChelseaFan: boolean;
  rivalIntensity: number;
  favoritePlayer?: string | null;
};

export type AgentState = {
  messages: Message[];
  user: User;
  tone: "professional" | "savage";
  toolsNeeded: string[];
  finalReply?: string;
  imageUrl?: string;
};

export type NodeHandler = (state: AgentState) => Promise<AgentState>;
