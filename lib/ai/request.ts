const buckets = new Map<string, { count: number; resetAt: number }>();

export function requestIp(request: Request) {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "local"
  );
}

export function sameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin) return process.env.NODE_ENV !== "production";
  try {
    const originHost = new URL(origin).host;
    const requestHost =
      request.headers.get("x-forwarded-host") ?? request.headers.get("host");
    return Boolean(requestHost && originHost === requestHost);
  } catch {
    return false;
  }
}

/** Warm-instance protection; Vercel Firewall remains the durable production edge limit. */
export function takeRateLimit(
  namespace: string,
  key: string,
  maximum: number,
  windowMs: number,
) {
  const now = Date.now();
  const bucketKey = `${namespace}:${key}`;
  const existing = buckets.get(bucketKey);
  const bucket = !existing || existing.resetAt <= now
    ? { count: 0, resetAt: now + windowMs }
    : existing;

  bucket.count += 1;
  buckets.set(bucketKey, bucket);
  return bucket.count <= maximum;
}
