import { z } from "zod";

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters")
  }),
  query: z.object({}).optional(),
  params: z.object({}).optional()
});

export type LoginInput = z.infer<typeof loginSchema>["body"];

export const refreshSchema = z.object({
  body: z.object({
    refreshToken: z.string().optional()
  }),
  query: z.object({}).optional(),
  params: z.object({}).optional()
});
