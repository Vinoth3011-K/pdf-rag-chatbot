import fs from "fs";
import multer from "multer";
import path from "path";
import { v4 as uuid } from "uuid";
import { env } from "@config/env";
import { ApiError } from "@utils/ApiError";

if (!fs.existsSync(env.upload.dir)) {
  fs.mkdirSync(env.upload.dir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    if (!fs.existsSync(env.upload.dir)) {
      fs.mkdirSync(env.upload.dir, { recursive: true });
    }
    cb(null, env.upload.dir);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${uuid()}${ext}`);
  }
});

function fileFilter(_req: unknown, file: Express.Multer.File, cb: multer.FileFilterCallback) {
  if (file.mimetype !== "application/pdf") {
    return cb(new Error("Only PDF files are allowed"));
  }
  cb(null, true);
}

export const uploadPdf = multer({
  storage,
  fileFilter,
  limits: { fileSize: env.upload.maxSizeMb * 1024 * 1024 }
}).single("file");

export function handleUploadErrors(err: unknown): never | void {
  if (err instanceof multer.MulterError) {
    throw ApiError.badRequest(`Upload error: ${err.message}`);
  }
  if (err instanceof Error) {
    throw ApiError.badRequest(err.message);
  }
}
