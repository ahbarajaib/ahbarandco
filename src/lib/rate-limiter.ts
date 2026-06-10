type RateRecord = {
  count: number;
  resetTime: number;
};

const tracker = new Map<string, RateRecord>();
const MAX_ENTRIES = 5000; // Cap map size to prevent memory bloat

// Cleanup expired entries every 5 minutes in server environments
if (typeof window === "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [key, value] of tracker.entries()) {
      if (now > value.resetTime) {
        tracker.delete(key);
      }
    }
  }, 300000);
}

export function isRateLimited(ip: string, limit = 10, windowMs = 60000): boolean {
  const now = Date.now();
  const record = tracker.get(ip);

  if (!record) {
    if (tracker.size >= MAX_ENTRIES) {
      // Evict oldest record if cache size is exceeded to protect memory
      const firstKey = tracker.keys().next().value;
      if (firstKey) tracker.delete(firstKey);
    }
    tracker.set(ip, { count: 1, resetTime: now + windowMs });
    return false;
  }

  if (now > record.resetTime) {
    record.count = 1;
    record.resetTime = now + windowMs;
    return false;
  }

  record.count++;
  return record.count > limit;
}
