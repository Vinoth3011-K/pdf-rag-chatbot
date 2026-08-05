import { MessageRole } from "@prisma/client";
import { Response } from "express";
import { chatRepository } from "@repositories/chat.repository";
import { ApiError } from "@utils/ApiError";
import { publishChatRequest, subscribeToChatStream } from "@redis/pubsub.service";
import { ChatHistoryItem } from "@redis/types";

export class ChatService {
  async streamAnswer(sessionIdInput: string | undefined, userMessage: string, res: Response): Promise<void> {
    const session = sessionIdInput
      ? await chatRepository.findSessionById(sessionIdInput)
      : await chatRepository.createSession();

    if (!session) throw ApiError.notFound("Chat session not found");

    await chatRepository.createMessage({
      session: { connect: { id: session.id } },
      role: MessageRole.USER,
      content: userMessage
    });

    const recentHistory = await chatRepository.getRecentHistory(session.id, 10);
    const history: ChatHistoryItem[] = recentHistory.map((m) => ({
      role: m.role,
      content: m.content
    }));

    res.writeHead(200, {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no"
    });

    const send = (event: string, data: unknown) => {
      res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
    };

    send("session", { sessionId: session.id });

    const requestId = await publishChatRequest({
      sessionId: session.id,
      message: userMessage,
      history
    });

    await new Promise<void>((resolve) => {
      subscribeToChatStream(
        requestId,
        (chunk) => {
          send("token", { content: chunk.content });
        },
        async (final) => {
          await chatRepository.createMessageWithSources(
            session.id,
            MessageRole.ASSISTANT,
            final.answer,
            final.suggestedQuestions,
            final.sources.map((s) => ({
              documentId: s.documentId,
              pageNumber: s.pageNumber,
              snippet: s.snippet,
              score: s.score
            }))
          );

          send("done", {
            answer: final.answer,
            sources: final.sources,
            suggestedQuestions: final.suggestedQuestions
          });
          res.end();
          resolve();
        },
        (err) => {
          send("error", { message: err.message });
          res.end();
          resolve();
        }
      );
    });
  }

  async getHistory(sessionId: string) {
    const session = await chatRepository.findSessionById(sessionId);
    if (!session) throw ApiError.notFound("Chat session not found");
    return chatRepository.findMessagesBySession(sessionId);
  }
}

export const chatService = new ChatService();
