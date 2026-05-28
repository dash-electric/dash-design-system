import { createHmac, timingSafeEqual } from "node:crypto";

/**
 * Verify an HMAC-SHA256 signature for an ingest request body.
 *
 * Convention:
 *   header:  X-Dash-Signature: sha256=<hex>
 *   payload: raw request body (UTF-8 bytes), signed with INGEST_HMAC_KEY.
 *
 * Returns true only when the signature is well-formed, key is configured,
 * and HMAC matches in constant time.
 */
export function verifyHmac(rawBody: string, signatureHeader: string | null): boolean {
  if (!signatureHeader) return false;
  const key = process.env.INGEST_HMAC_KEY;
  if (!key) return false;

  const match = signatureHeader.match(/^sha256=([a-f0-9]+)$/i);
  if (!match) return false;

  const provided = match[1].toLowerCase();
  const expected = createHmac("sha256", key).update(rawBody, "utf8").digest("hex");

  // timingSafeEqual requires equal-length buffers.
  if (provided.length !== expected.length) return false;
  try {
    return timingSafeEqual(Buffer.from(provided, "hex"), Buffer.from(expected, "hex"));
  } catch {
    return false;
  }
}

/** Convenience for tests / dev tooling. */
export function signBody(rawBody: string, key: string): string {
  return "sha256=" + createHmac("sha256", key).update(rawBody, "utf8").digest("hex");
}
