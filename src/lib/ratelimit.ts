type RequestRecord = {
  count: number;
  windowStart: number;
};

const store = new Map<string, RequestRecord>();

/**
 * Simple in-memory rate limiter.
 * @param identifier - unique key (e.g. IP address)
 * @param maxRequests - maximum allowed requests per window
 * @param windowMs - window duration in milliseconds
 * @returns true if the request is allowed, false if rate limited
 */
export function rateLimit(
  identifier: string,
  maxRequests: number,
  windowMs: number
): boolean {
  const now = Date.now();
  const record = store.get(identifier);

  if (!record || now - record.windowStart > windowMs) {
    store.set(identifier, { count: 1, windowStart: now });
    return true;
  }

  if (record.count >= maxRequests) {
    return false;
  }

  record.count += 1;
  return true;
}
