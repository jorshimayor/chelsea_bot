import crypto from "crypto";

export function hmacVerify(
  payload: string,
  signature: string,
  secret: string
): boolean {
  const h = crypto.createHmac("sha256", secret).update(payload).digest("hex");
  return crypto.timingSafeEqual(Buffer.from(h), Buffer.from(signature));
}

export function cors(req: Request): Response | null {
  const origin = req.headers.get("origin") || "*";
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": origin,
        "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
        "Access-Control-Allow-Headers":
          "Content-Type,Authorization,X-Signature",
        "Access-Control-Max-Age": "86400",
      },
    });
  }
  return null;
}

export function redactSecrets(
  obj: Record<string, unknown>
): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const k of Object.keys(obj)) {
    const v = obj[k];
    if (typeof v === "string" && v.length > 0) out[k] = "[redacted]";
    else out[k] = v;
  }
  return out;
}
