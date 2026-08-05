export type DocumentStatus = "PENDING" | "PROCESSING" | "READY" | "FAILED";

export interface Document {
  id: string;
  title: string;
  originalFileName: string;
  filePath: string;
  fileSizeBytes: number;
  mimeType: string;
  status: DocumentStatus;
  pageCount: number | null;
  chunkCount: number | null;
  errorMessage: string | null;
  uploadedById: string;
  createdAt: string;
  updatedAt: string;
}

export interface DashboardStats {
  totalDocuments: number;
  totalChatSessions: number;
  totalQuestionsAsked: number;
  recentDocuments: Document[];
}

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: string;
}

export interface ChatSource {
  documentId: string;
  documentTitle: string;
  pageNumber?: number | null;
  snippet?: string | null;
  score?: number | null;
}

export interface ChatMessage {
  id: string;
  role: "USER" | "ASSISTANT";
  content: string;
  suggestedQuestions: string[];
  sources: ChatSource[];
  createdAt: string;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  pagination?: Pagination;
  message?: string;
}
