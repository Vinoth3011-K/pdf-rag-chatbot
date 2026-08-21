import "express-async-errors";

import fs from "fs";
import path from "path";
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

  // Enable trust proxy for reverse proxies (e.g. Render, Nginx) so req.protocol / req.get('host') are accurate
  app.set("trust proxy", 1);

  // Security
  app.use(
    helmet({
      crossOriginResourcePolicy: false,
    })
  );

  // CORS — build allowed origins from env var + defaults + Vercel dynamic matching
  const configuredOrigins = env.corsOrigin
    ? env.corsOrigin.split(",").map((o) => o.trim()).filter(Boolean)
    : [];

  const defaultOrigins = [
    "http://localhost:3000",
    "http://localhost:3001",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:3001",
  ];

  const allowedOrigins = Array.from(new Set([...defaultOrigins, ...configuredOrigins]));

  const corsOptions: cors.CorsOptions = {
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. mobile apps, curl, server-to-server, Postman)
      if (!origin) {
        return callback(null, true);
      }

      // Check explicit allowed origins list
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      // Allow any Vercel deployment URL (*.vercel.app)
      if (
        /^https:\/\/[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*\.vercel\.app$/.test(origin) ||
        origin.endsWith(".vercel.app")
      ) {
        return callback(null, true);
      }

      // If origin is not allowed, reject gracefully without crashing the preflight pipeline
      logger.warn(`CORS blocked request from origin: ${origin}`);
      return callback(null, false);
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "X-Requested-With",
      "Accept",
      "Origin",
      "Cookie",
      "Cache-Control",
      "Pragma",
      "Range",
      "X-Session-Id",
    ],
    exposedHeaders: ["Content-Disposition", "Content-Length", "X-Session-Id"],
    optionsSuccessStatus: 200,
    maxAge: 86400, // 24 hours preflight cache
  };

  // Handle OPTIONS preflight for all routes BEFORE other middleware
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

  // Health Check Route
  app.get("/", (_req, res) => {
    res.status(200).json({
      success: true,
      message: "PDF RAG Backend API is running 🚀",
      service: "Node.js Backend",
      environment: env.nodeEnv,
    });
  });

  app.get("/health", (_req, res) => {
    res.status(200).json({
      success: true,
      status: "healthy",
      timestamp: new Date().toISOString(),
    });
  });

  // ==========================
  // Static Files (Uploaded PDFs)
  // ==========================
  if (!fs.existsSync(env.upload.dir)) {
    fs.mkdirSync(env.upload.dir, { recursive: true });
  }

  // Middleware for uploads route to ensure cross-origin access for Python AI service & frontend
  app.use(
    "/uploads",
    (_req, res, next) => {
      res.setHeader("Access-Control-Allow-Origin", "*");
      res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
      next();
    },
    express.static(env.upload.dir, {
      dotfiles: "ignore",
      etag: true,
      maxAge: "1d",
      setHeaders: (res, filePath) => {
        if (filePath.endsWith(".pdf")) {
          res.setHeader("Content-Type", "application/pdf");
        }
      }
    })
  );

  // Explicit route handler to ensure reliable file download and clear logging on Render
  app.get("/uploads/:filename", (req, res) => {
    const filename = path.basename(req.params.filename);
    const filePath = path.join(env.upload.dir, filename);

    if (fs.existsSync(filePath)) {
      res.setHeader("Access-Control-Allow-Origin", "*");
      res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
      res.setHeader("Content-Type", "application/pdf");
      return res.sendFile(filePath);
    }

    logger.warn(`PDF requested but not found at: ${filePath}`);
    return res.status(404).json({
      success: false,
      message: `File not found: ${filename}`
    });
  });

  // ==========================
  // API Routes
  // ==========================
  app.use("/api", routes);

  // Error Handling
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
