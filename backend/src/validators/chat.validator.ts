import { z } from "zod";

export const sendMessageSchema = z.object({
  body: z.object({
    sessionId: z.string().uuid().optional(),
    message: z.string().min(1, "Message cannot be empty").max(4000)
  }),
  query: z.object({}).optional(),
  params: z.object({}).optional()
});

export const chatHistoryParamSchema = z.object({
  params: z.object({
    sessionId: z.string().uuid("Invalid session id")
  }),
  body: z.object({}).optional(),
  query: z.object({}).optional()
});
