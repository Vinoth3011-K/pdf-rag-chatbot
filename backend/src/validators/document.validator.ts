import { z } from "zod";

export const listDocumentsSchema = z.object({
  query: z.object({
    search: z.string().optional(),
    status: z.enum(["PENDING", "PROCESSING", "READY", "FAILED"]).optional(),
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(10)
  }),
  body: z.object({}).optional(),
  params: z.object({}).optional()
});

export const documentIdParamSchema = z.object({
  params: z.object({
    id: z.string().uuid("Invalid document id")
  }),
  body: z.object({}).optional(),
  query: z.object({}).optional()
});
