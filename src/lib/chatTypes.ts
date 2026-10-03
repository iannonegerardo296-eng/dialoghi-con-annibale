export type MessageRole = "user" | "assistant";

export interface ChatMessageData {
  id: string;
  role: MessageRole;
  content: string;
  createdAt: number;
  sources?: WebSource[];
  isHistoricalFallback?: boolean;
}

export interface ApiMessage {
  role: MessageRole;
  content: string;
}

export type ResponseDetail = "brief" | "normal" | "detailed";

export interface WebSource {
  title: string;
  url: string;
  excerpt: string;
  language: string;
}

export interface ChatRequest {
  messages: ApiMessage[];
  detailLevel: ResponseDetail;
}

export interface ChatResponse {
  response: string;
  sources: WebSource[];
  isHistoricalFallback?: boolean;
}

export interface ChatErrorResponse {
  error: string;
}
