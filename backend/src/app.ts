import "express-async-errors";

import express, { Application } from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import cookieParser from "cookie-parser";
import morgan from "morgan";

import { env } from "@config/env";
import { logger } from "@utils/logger";

import routes from "@routes/index";
import { errorHandler, notFoundHandler } from "@middlewares/errorHandler";


export function createApp(): Application {

  const app = express();


  // Security
  app.use(
    helmet({
      crossOriginResourcePolicy: false,
    })
  );

// CORS — build allowed origins from env var (supports comma-separated list)
const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:3001",
  ...(env.corsOrigin
    ? env.corsOrigin.split(",").map((o) => o.trim()).filter(Boolean)
    : []),
];

const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (Postman, server-to-server, curl)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS: Origin not allowed: ${origin}`));
    }
  },
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  // credentials: false (default) — app uses Authorization Bearer header,
  // not cross-origin cookies. Omitting this avoids the CORS preflight
  // conflict: "wildcard + credentials" is invalid per the CORS spec.
};

// Handle OPTIONS preflight for all routes BEFORE any other middleware
app.options("*", cors(corsOptions));

app.use(cors(corsOptions));

  // Middlewares
  app.use(compression());

  app.use(
    express.json({
      limit: "10mb",
    })
  );


  app.use(
    express.urlencoded({
      extended: true,
      limit: "10mb",
    })
  );


  app.use(cookieParser());



  // Logger
  const morganStream = {
    write: (message: string) => {
      if (logger.http) {
        logger.http(message.trim());
      } else {
        logger.info(message.trim());
      }
    },
  };


  app.use(
    morgan(
      env.isProduction ? "combined" : "dev",
      {
        stream: morganStream,
      }
    )
  );



  // ==========================
  // Health Check Route
  // ==========================

  app.get("/", (_req, res) => {

    res.status(200).json({
      success: true,
      message: "PDF RAG Backend API is running 🚀",
      service: "Node.js Backend",
      environment: env.nodeEnv,
    });

  });



  app.get("/health", (_req, res)=>{

    res.status(200).json({

      success:true,
      status:"healthy",
      timestamp:new Date().toISOString()

    });

  });



  // ==========================
  // API Routes
  // ==========================

  app.use("/api", routes);



  // ==========================
  // Error Handling
  // ==========================

  app.use(notFoundHandler);

  app.use(errorHandler);



  return app;

}