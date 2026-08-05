import { Request, Response } from "express";
import { chatService } from "@services/chat.service";
import { asyncHandler } from "@middlewares/errorHandler";

export const sendMessage = asyncHandler(async (req: Request, res: Response) => {
  const { sessionId, message } = req.body;
  await chatService.streamAnswer(sessionId, message, res);
});

export const getChatHistory = asyncHandler(async (req: Request, res: Response) => {
  const history = await chatService.getHistory(req.params.sessionId);
  res.status(200).json({ success: true, data: history });
});
