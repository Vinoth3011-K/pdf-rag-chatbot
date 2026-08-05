import { PrismaClient } from "@prisma/client";
import { logger } from "@utils/logger";
import { env } from "@config/env";

declare global {
  // eslint-disable-next-line no-var
  var __prisma__: PrismaClient | undefined;
}

export const prisma =
  global.__prisma__ ||
  new PrismaClient({
    log: env.isProduction ? ["error"] : ["query", "error", "warn"]
  });

if (!env.isProduction) {
  global.__prisma__ = prisma;
}

export async function connectDatabase(): Promise<void> {
  await prisma.$connect();
  logger.info("PostgreSQL connected via Prisma");
}

export async function disconnectDatabase(): Promise<void> {
  await prisma.$disconnect();
}
