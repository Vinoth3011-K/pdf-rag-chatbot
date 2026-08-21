import path from "path";
import { Request, Response } from "express";
import { DocumentStatus } from "@prisma/client";
import { documentService } from "@services/document.service";
import { asyncHandler } from "@middlewares/errorHandler";
import { ApiError } from "@utils/ApiError";
import { env } from "@config/env";

export const uploadDocument = asyncHandler(async (req: Request, res: Response) => {
  if (!req.file) {
    throw ApiError.badRequest("No PDF file uploaded");
  }

  if (!req.user) {
    throw ApiError.unauthorized();
  }

  // Convert relative upload path to absolute path
  const absolutePath = path.resolve(req.file.path);
  const filename = req.file.filename || path.basename(req.file.path);
  const host = req.get("x-forwarded-host") || req.get("host");
  const protocol = req.headers["x-forwarded-proto"] === "https" || req.protocol === "https" ? "https" : req.protocol;
  const baseUrl = (env.backendUrl || `${protocol}://${host}`).replace(/\/$/, "");
  const fileUrl = `${baseUrl}/uploads/${filename}`;

  console.log("========== PDF Upload ==========");
  console.log("Original Path :", req.file.path);
  console.log("Absolute Path :", absolutePath);
  console.log("File URL      :", fileUrl);
  console.log("================================");

  const document = await documentService.uploadAndProcess(req.user.sub, {
    originalName: req.file.originalname,
    storedPath: absolutePath,
    fileUrl,
    sizeBytes: req.file.size,
    mimeType: req.file.mimetype
  });

  res.status(201).json({
    success: true,
    data: document
  });
});

export const listDocuments = asyncHandler(async (req: Request, res: Response) => {
  const { search, status, page, limit } = req.query as unknown as {
    search?: string;
    status?: DocumentStatus;
    page: number;
    limit: number;
  };

  const result = await documentService.list({
    search,
    status,
    page,
    limit
  });

  res.status(200).json({
    success: true,
    data: result.items,
    pagination: result.pagination
  });
});

export const getDocument = asyncHandler(async (req: Request, res: Response) => {
  const document = await documentService.getById(req.params.id);

  res.status(200).json({
    success: true,
    data: document
  });
});

export const deleteDocument = asyncHandler(async (req: Request, res: Response) => {
  await documentService.delete(req.params.id);

  res.status(200).json({
    success: true,
    data: {
      message: "Document deleted successfully"
    }
  });
});

export const reprocessDocument = asyncHandler(async (req: Request, res: Response) => {
  const baseUrl = env.backendUrl || `${req.protocol}://${req.get("host")}`;
  const document = await documentService.reprocess(req.params.id, baseUrl);

  res.status(200).json({
    success: true,
    data: document
  });
});
