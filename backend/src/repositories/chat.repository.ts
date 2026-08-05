import { ChatMessage, ChatSession, MessageRole, Prisma } from "@prisma/client";
import { prisma } from "@config/prisma";

export class ChatRepository {
  createSession(title?: string): Promise<ChatSession> {
    return prisma.chatSession.create({ data: { title } });
  }

  findSessionById(id: string): Promise<ChatSession | null> {
    return prisma.chatSession.findUnique({ where: { id } });
  }

  async getRecentHistory(sessionId: string, limit = 10): Promise<ChatMessage[]> {
    const messages = await prisma.chatMessage.findMany({
      where: { sessionId },
      orderBy: { createdAt: "desc" },
      take: limit
    });
    return messages.reverse();
  }

  createMessage(data: Prisma.ChatMessageCreateInput): Promise<ChatMessage> {
    return prisma.chatMessage.create({ data });
  }

  createMessageWithSources(
    sessionId: string,
    role: MessageRole,
    content: string,
    suggestedQuestions: string[],
    sources: { documentId: string; pageNumber?: number | null; snippet?: string | null; score?: number | null }[]
  ): Promise<ChatMessage> {
    return prisma.chatMessage.create({
      data: {
        sessionId,
        role,
        content,
        suggestedQuestions,
        sources: {
          create: sources.map((s) => ({
            documentId: s.documentId,
            pageNumber: s.pageNumber,
            snippet: s.snippet,
            score: s.score
          }))
        }
      },
      include: { sources: true }
    });
  }

  findMessagesBySession(sessionId: string) {
    return prisma.chatMessage.findMany({
      where: { sessionId },
      orderBy: { createdAt: "asc" },
      include: { sources: { include: { document: true } } }
    });
  }

  countDistinctSessions(): Promise<number> {
    return prisma.chatSession.count();
  }

  countMessagesByRole(role: MessageRole): Promise<number> {
    return prisma.chatMessage.count({ where: { role } });
  }
}

export const chatRepository = new ChatRepository();
