import { Router } from "express";
import * as chatController from "@controllers/chat.controller";
import { validate } from "@middlewares/validate";
import { chatHistoryParamSchema, sendMessageSchema } from "@validators/chat.validator";
import rateLimit from "express-rate-limit";

const router = Router();

// Public chat endpoints do not require login, but are rate-limited to
// prevent abuse of the downstream LLM calls.
const chatLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many messages sent. Please slow down." }
});

router.post("/", chatLimiter, validate(sendMessageSchema), chatController.sendMessage);
router.get("/history/:sessionId", validate(chatHistoryParamSchema), chatController.getChatHistory);

export default router;
