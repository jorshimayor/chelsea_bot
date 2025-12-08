export const topics = {
  publishEvents: "publish-events",
  toolEvents: "tool-events",
  alerts: "alerts"
};

export async function produce(topic: string, value: Record<string, unknown>) {
  return { topic, value };
}
