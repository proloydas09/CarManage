import Redis from "ioredis";

const REDIS_URL = process.env.REDIS_URL ?? "redis://localhost:6379";

export const redis = new Redis(REDIS_URL, {
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
  lazyConnect: true,
});

redis.on("error", (err) => {
  console.error("[Redis] Connection error:", err.message);
});

redis.on("connect", () => {
  console.log("[Redis] Connected");
});

export async function pingRedis(): Promise<boolean> {
  try {
    await redis.ping();
    return true;
  } catch {
    return false;
  }
}
