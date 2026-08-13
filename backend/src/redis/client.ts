import { createClient, RedisClientType } from "redis";
import { env } from "@config/env";
import { logger } from "@utils/logger";

export const publisherClient: RedisClientType = createClient({
  url: env.redisUrl,
});

export const subscriberClient: RedisClientType = createClient({
  url: env.redisUrl,
});

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