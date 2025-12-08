import { startOAuth } from "@shared/x";

export const config = { runtime: "edge" };

export default async function handler(req: Request): Promise<Response> {
  const state = crypto.randomUUID();
  const { url } = await startOAuth(state);
  return Response.redirect(url, 302);
}
