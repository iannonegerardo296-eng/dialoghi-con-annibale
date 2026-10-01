import type { ApiMessage } from "@/lib/chatTypes";

export const STORAGE_KEY = "dialoghi-annibale-conversation-v1";
export const MAX_HISTORY_MESSAGES = 18;
export const MAX_MESSAGE_LENGTH = 4000;
export const MAX_REQUEST_CHARACTERS = 12000;

export const SUGGESTED_QUESTIONS = [
  "Come sei riuscito ad attraversare le Alpi?",
  "Perché Roma vinse la Seconda guerra punica?",
  "Raccontami la battaglia di Canne.",
  "Cosa pensavi di Scipione l’Africano?",
  "Qual era il rapporto tra te e Cartagine?",
  "Quale fu il tuo errore più grande?",
  "Che consiglio daresti a un giovane stratega?",
  "Come vedevi i popoli italici alleati di Roma?",
];

export const toApiMessages = (
  messages: Array<{ role: "user" | "assistant"; content: string }>,
): ApiMessage[] =>
  messages.slice(-MAX_HISTORY_MESSAGES).map(({ role, content }) => ({ role, content }));
