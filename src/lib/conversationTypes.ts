import type { ChatMessageData } from "@/lib/chatTypes";

export interface StoredConversation {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  messages: ChatMessageData[];
}

export interface ConversationStore {
  conversations: StoredConversation[];
  activeId: string | null;
}
