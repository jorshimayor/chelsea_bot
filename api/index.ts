export const config = { runtime: "edge" };

export default async function handler(req: Request): Promise<Response> {
  return new Response("agent", { status: 200 });
}
