import { MessageRole } from "@prisma/client";
import { documentRepository } from "@repositories/document.repository";
import { chatRepository } from "@repositories/chat.repository";

export class DashboardService {
  async getStats() {
    const [totalDocuments, totalChatSessions, totalQuestionsAsked, recentDocuments] = await Promise.all([
      documentRepository.count(),
      chatRepository.countDistinctSessions(),
      chatRepository.countMessagesByRole(MessageRole.USER),
      documentRepository.findRecent(5)
    ]);

    return {
      totalDocuments,
      totalChatSessions,
      totalQuestionsAsked,
      recentDocuments
    };
  }
}

export const dashboardService = new DashboardService();
