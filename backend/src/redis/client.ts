import { createClient, RedisClientType } from "redis";
import { env } from "@config/env";
import { logger } from "@utils/logger";

const redisOptions = {
  url: env.redisUrl,
  pingInterval: 30000, // Send PING every 30 seconds to prevent idle timeout
  socket: {
    keepAlive: 30000,
    reconnectStrategy: (retries: number) => {
      const delay = Math.min(retries * 500, 3000);
      logger.warn(`Reconnecting to Redis (attempt ${retries}) in ${delay}ms`);
      return delay;
    },
  },
};

export const publisherClient: RedisClientType = createClient(redisOptions);
export const subscriberClient: RedisClientType = createClient(redisOptions);

publisherClient.on("error", (err: Error) =>
  logger.error("Redis publisher error", { message: err.message || err })
);

subscriberClient.on("error", (err: Error) =>
  logger.error("Redis subscriber error", { message: err.message || err })
);

export async function connectRedis(): Promise<void> {
  if (!publisherClient.isOpen) {
    await publisherClient.connect();
  }

  if (!subscriberClient.isOpen) {
    await subscriberClient.connect();
  }

  logger.info("Redis pub/sub clients connected");
}

export async function disconnectRedis(): Promise<void> {
  if (publisherClient.isOpen) {
    await publisherClient.quit();
  }

  if (subscriberClient.isOpen) {
    await subscriberClient.quit();
  }
}
