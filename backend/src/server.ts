import { createApp } from "./app";
import { env } from "@config/env";
import { logger } from "@utils/logger";
import {
  connectDatabase,
  disconnectDatabase
} from "@config/prisma";
import {
  connectRedis,
  disconnectRedis
} from "@redis/client";
import {
  initPubSubSubscriptions
} from "@redis/pubsub.service";


async function bootstrap() {

  await connectDatabase();

  await connectRedis();

  await initPubSubSubscriptions();


  const app = createApp();


  const server = app.listen(
    env.port,
    () => {
      logger.info(
        `Backend server listening on port ${env.port} [${env.nodeEnv}]`
      );
    }
  );


  // Handle port already in use
  server.on(
    "error",
    (error: NodeJS.ErrnoException) => {

      if (error.code === "EADDRINUSE") {

        logger.error(
          `Port ${env.port} is already in use. Please stop existing process.`
        );

      } else {

        logger.error(
          "Server error:",
          error
        );

      }

      process.exit(1);
    }
  );


  let shuttingDown = false;


  const shutdown = async (
    signal: string
  ) => {


    if (shuttingDown) {
      return;
    }


    shuttingDown = true;


    logger.info(
      `Received ${signal}. Shutting down gracefully...`
    );


    server.close(
      async () => {

        try {

          await disconnectDatabase();

          await disconnectRedis();


          logger.info(
            "Backend shutdown completed"
          );


          process.exit(0);


        } catch (error) {


          logger.error(
            "Shutdown error",
            error
          );


          process.exit(1);

        }

      }
    );


    // Force shutdown after 10 seconds
    setTimeout(
      () => {

        logger.error(
          "Force shutdown due to timeout"
        );

        process.exit(1);

      },
      10000
    );

  };


  process.on(
    "SIGINT",
    () => shutdown("SIGINT")
  );


  process.on(
    "SIGTERM",
    () => shutdown("SIGTERM")
  );


  process.on(
    "uncaughtException",
    (error) => {

      logger.error(
        "Uncaught Exception",
        error
      );

      shutdown("uncaughtException");

    }
  );


  process.on(
    "unhandledRejection",
    (reason) => {

      logger.error(
        "Unhandled Promise Rejection",
        reason
      );

    }
  );

}


bootstrap()
  .catch(
    async (err) => {

      logger.error(
        "Failed to start backend server",
        err
      );


      await disconnectDatabase();

      await disconnectRedis();


      process.exit(1);

    }
  );