import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(__dirname, "../../../.env") });
dotenv.config();

function required(key: string, fallback?: string): string {
  const value = process.env[key] ?? fallback;
  if (value === undefined) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

const resolveUploadDir = (): string => {
  if (process.env.UPLOAD_DIR) {
    return path.isAbsolute(process.env.UPLOAD_DIR)
      ? process.env.UPLOAD_DIR
      : path.resolve(process.cwd(), process.env.UPLOAD_DIR);
  }
  return path.resolve(process.cwd(), "uploads");
};

export const env = {
  nodeEnv: process.env.NODE_ENV || "development",
  isProduction: process.env.NODE_ENV === "production",

  port: parseInt(process.env.PORT || process.env.BACKEND_PORT || "4000", 10),
  backendUrl: process.env.BACKEND_URL || "",
  corsOrigin: process.env.CORS_ORIGIN || "http://localhost:3000",

  databaseUrl: required("DATABASE_URL", "postgresql://raguser:ragpassword@localhost:5432/pdf_rag_db"),

  redisUrl: process.env.REDIS_URL || "redis://localhost:6379",

  jwt: {
    accessSecret: required("JWT_ACCESS_SECRET", "dev_access_secret"),
    refreshSecret: required("JWT_REFRESH_SECRET", "dev_refresh_secret"),
    accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || "15m",
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "7d"
  },

  upload: {
    dir: resolveUploadDir(),
    maxSizeMb: parseInt(process.env.MAX_UPLOAD_SIZE_MB || "25", 10)
  }
};
