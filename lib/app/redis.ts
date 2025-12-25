import env from "@/configs/env";
import Redis from "ioredis";

class RedisClient {
  private static instance: Redis;

  private constructor() {}

  public static getInstance(): Redis {
    if (!RedisClient.instance) {
      RedisClient.instance = new Redis(env.APP.REDIS_URL);

      RedisClient.instance.on("connect", () => {
        console.log("Redis connected successfully");
      });

      RedisClient.instance.on("error", (error) => {
        console.error("Redis connection error:", error);
      });
    }

    return RedisClient.instance;
  }

  public static async disconnect(): Promise<void> {
    if (RedisClient.instance) {
      await RedisClient.instance.quit();
      RedisClient.instance = null as unknown as Redis;
    }
  }
}

export default RedisClient.getInstance();
