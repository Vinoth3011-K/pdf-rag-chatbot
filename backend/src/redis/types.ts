export interface PdfDeleteRequestMessage {
  documentId: string;
}


export interface PdfProcessRequestMessage {
  requestId: string;
  documentId: string;
  filePath: string;
  chromaCollection: string;
  documentTitle?: string;
}


export interface PdfProcessResponseMessage {
  requestId: string;
  documentId: string;
  status: "READY" | "FAILED";
  pageCount?: number;
  chunkCount?: number;
  errorMessage?: string | null;
}


export interface ChatHistoryItem {
  role: "USER" | "ASSISTANT";
  content: string;
}


export interface ChatRequestMessage {
  requestId: string;
  sessionId: string;
  message: string;
  history: ChatHistoryItem[];
}


export interface ChatStreamChunkMessage {
  requestId: string;
  type: "token" | "done" | "error";
  content: string;
}


export interface ChatSourceItem {
  documentId: string;
  documentTitle: string;
  pageNumber?: number | null;
  snippet?: string | null;
  score?: number | null;
}


export interface ChatResponseMessage {
  requestId: string;
  sessionId: string;
  answer: string;
  sources: ChatSourceItem[];
  suggestedQuestions: string[];
}