type RateLimitStore = Map<string, { count: number; lastReset: number }>;

const ipRateLimits: RateLimitStore = new Map();

// Simple window-based rate limiter
// Returns true if request is allowed, false if blocked
export function checkRateLimit(
  identifier: string,
  limit: number = 10,
  windowMs: number = 10000,
): boolean {
  const now = Date.now();
  const record = ipRateLimits.get(identifier) || { count: 0, lastReset: now };

  // Reset window if expired
  if (now - record.lastReset > windowMs) {
    record.count = 0;
    record.lastReset = now;
  }

  // Increment count
  record.count++;
  ipRateLimits.set(identifier, record);

  // Check limit
  return record.count <= limit;
}

// Cleanup old entries every 5 minutes to prevent memory leaks
setInterval(
  () => {
    const now = Date.now();
    for (const [key, value] of ipRateLimits.entries()) {
      if (now - value.lastReset > 60000) {
        // Remove if older than 1 minute
        ipRateLimits.delete(key);
      }
    }
  },
  5 * 60 * 1000,
);
