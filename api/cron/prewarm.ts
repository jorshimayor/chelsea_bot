export const config = { runtime: "edge" };

export default async function handler(): Promise<Response> {
  return new Response(null, { status: 204 });
}
