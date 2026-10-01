"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { BookOpenText, MessageSquareText, Plus, Settings2, Trash2 } from "lucide-react";
import Link from "next/link";
import { AnnibalAvatar, type AvatarStatus } from "@/components/AnnibalAvatar";
import { ChatWindow } from "@/components/ChatWindow";
import { HistoricalContext } from "@/components/HistoricalContext";
import { MAX_HISTORY_MESSAGES, STORAGE_KEY, toApiMessages } from "@/lib/constants";
import type { ChatMessageData, ChatResponse, ResponseDetail, WebSource } from "@/lib/chatTypes";
import type { ConversationStore, StoredConversation } from "@/lib/conversationTypes";

const CONVERSATIONS_STORAGE_KEY = "dialoghi-annibale-conversations-v1";
const EMPTY_MESSAGES: ChatMessageData[] = [];

function isStoredMessage(value: unknown): value is ChatMessageData {
  if (typeof value !== "object" || value === null) return false;
  const message = value as Record<string, unknown>;
  return (
    typeof message.id === "string" &&
    (message.role === "user" || message.role === "assistant") &&
    typeof message.content === "string" &&
    typeof message.createdAt === "number"
  );
}

function isStoredConversation(value: unknown): value is StoredConversation {
  if (typeof value !== "object" || value === null) return false;
  const conversation = value as Record<string, unknown>;
  return (
    typeof conversation.id === "string" &&
    typeof conversation.title === "string" &&
    typeof conversation.createdAt === "number" &&
    typeof conversation.updatedAt === "number" &&
    Array.isArray(conversation.messages) &&
    conversation.messages.every(isStoredMessage)
  );
}

function isConversationStore(value: unknown): value is ConversationStore {
  if (typeof value !== "object" || value === null) return false;
  const store = value as Record<string, unknown>;
  return (
    Array.isArray(store.conversations) &&
    store.conversations.every(isStoredConversation) &&
    (store.activeId === null ||
      (typeof store.activeId === "string" &&
        store.conversations.some((conversation) => conversation.id === store.activeId)))
  );
}

function isWebSource(value: unknown): value is WebSource {
  if (typeof value !== "object" || value === null) return false;
  const source = value as Record<string, unknown>;
  if (
    typeof source.title !== "string" ||
    typeof source.url !== "string" ||
    typeof source.excerpt !== "string" ||
    typeof source.language !== "string"
  ) {
    return false;
  }

  try {
    const url = new URL(source.url);
    return (
      url.protocol === "https:" &&
      (url.hostname === "wikipedia.org" || url.hostname.endsWith(".wikipedia.org"))
    );
  } catch {
    return false;
  }
}

function createMessage(role: ChatMessageData["role"], content: string): ChatMessageData {
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    role,
    content,
    createdAt: Date.now(),
  };
}

function createConversation(messages: ChatMessageData[] = []): StoredConversation {
  const now = Date.now();
  const firstQuestion = messages.find((message) => message.role === "user")?.content;
  return {
    id: `${now}-${Math.random().toString(36).slice(2, 8)}`,
    title: firstQuestion?.trim().slice(0, 54) || "Nuova conversazione",
    createdAt: messages[0]?.createdAt ?? now,
    updatedAt: messages.at(-1)?.createdAt ?? now,
    messages,
  };
}

export default function Home() {
  const [conversationStore, setConversationStore] = useState<ConversationStore>({
    conversations: [],
    activeId: null,
  });
  const [historyLoaded, setHistoryLoaded] = useState(false);
  const [storageReady, setStorageReady] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [animatedMessageId, setAnimatedMessageId] = useState<string | null>(null);
  const [detailLevel, setDetailLevel] = useState<ResponseDetail>("normal");
  const saveQueue = useRef<Promise<void>>(Promise.resolve());
  const saveTimer = useRef<number | null>(null);

  const activeConversation =
    conversationStore.conversations.find((conversation) => conversation.id === conversationStore.activeId) ??
    null;
  const messages = activeConversation?.messages ?? EMPTY_MESSAGES;

  useEffect(() => {
    let cancelled = false;

    const loadConversations = async () => {
      try {
        const response = await fetch("/api/conversations", { cache: "no-store" });
        const payload: unknown = await response.json();
        if (!response.ok || !isConversationStore(payload)) {
          const message =
            typeof payload === "object" && payload !== null && "error" in payload &&
            typeof payload.error === "string"
              ? payload.error
              : "Non riesco a caricare le conversazioni dal server.";
          throw new Error(message);
        }

        let store = payload;
        if (store.conversations.length === 0) {
          let legacyStore: ConversationStore | null = null;
          let legacyMessages: ChatMessageData[] = [];
          try {
            const savedStore = window.localStorage.getItem(CONVERSATIONS_STORAGE_KEY);
            if (savedStore) {
              const parsed: unknown = JSON.parse(savedStore);
              if (isConversationStore(parsed)) legacyStore = parsed;
            }
            if (!legacyStore || legacyStore.conversations.length === 0) {
              const parsedMessages: unknown = JSON.parse(
                window.localStorage.getItem(STORAGE_KEY) ?? "[]",
              );
              if (Array.isArray(parsedMessages) && parsedMessages.every(isStoredMessage)) {
                legacyMessages = parsedMessages;
              }
            }
          } catch {
            legacyStore = null;
            legacyMessages = [];
          }

          const conversations = legacyStore?.conversations.length
            ? legacyStore.conversations
                .filter((conversation) => conversation.messages.length > 0)
                .map((conversation) => ({
                  ...conversation,
                  messages: conversation.messages.slice(-100),
                }))
                .slice(0, 40)
            : legacyMessages.length
              ? [createConversation(legacyMessages.slice(-100))]
              : [];
          const activeId =
            legacyStore?.activeId && conversations.some((item) => item.id === legacyStore?.activeId)
              ? legacyStore.activeId
              : conversations[0]?.id ?? null;
          store = conversations.length
            ? { conversations, activeId }
            : { conversations: [createConversation()], activeId: null };
          if (store.activeId === null) store.activeId = store.conversations[0].id;

          if (conversations.length > 0) {
            const migration = await fetch("/api/conversations", {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(store),
            });
            if (!migration.ok) {
              throw new Error("Non riesco a trasferire la cronologia esistente al server.");
            }
          }
        }

        if (cancelled) return;
        window.localStorage.removeItem(CONVERSATIONS_STORAGE_KEY);
        window.localStorage.removeItem(STORAGE_KEY);
        setConversationStore(store);
        setStorageReady(true);
      } catch (loadError) {
        if (cancelled) return;
        setError(
          loadError instanceof Error
            ? loadError.message
            : "Non riesco a caricare le conversazioni dal server.",
        );
      } finally {
        if (!cancelled) setHistoryLoaded(true);
      }
    };

    void loadConversations();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!historyLoaded || !storageReady) return;
    let cancelled = false;
    saveTimer.current = window.setTimeout(() => {
      saveTimer.current = null;
      saveQueue.current = saveQueue.current
        .catch(() => undefined)
        .then(async () => {
          if (cancelled) return;
          const response = await fetch("/api/conversations", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(conversationStore),
          });
          if (!response.ok) {
            const payload: unknown = await response.json();
            const message =
              typeof payload === "object" && payload !== null && "error" in payload &&
              typeof payload.error === "string"
                ? payload.error
                : "Non riesco a salvare le conversazioni sul server.";
            throw new Error(message);
          }
        })
        .catch((saveError: unknown) => {
          if (!cancelled) {
            setError(
              saveError instanceof Error
                ? saveError.message
                : "Non riesco a salvare le conversazioni sul server.",
            );
          }
        });
    }, 250);

    return () => {
      cancelled = true;
      if (saveTimer.current !== null) {
        window.clearTimeout(saveTimer.current);
        saveTimer.current = null;
      }
    };
  }, [conversationStore, historyLoaded, storageReady]);

  const sendMessage = useCallback(
    async (draft = input) => {
      const content = draft.trim();
      if (!content || loading || !storageReady || !activeConversation) return;

      const userMessage = createMessage("user", content);
      const nextMessages = [...messages, userMessage].slice(-100);
      const conversationId = activeConversation.id;
      setConversationStore((current) => ({
        ...current,
        conversations: current.conversations.map((conversation) =>
          conversation.id === conversationId
            ? {
                ...conversation,
                title:
                  conversation.title === "Nuova conversazione"
                    ? content.slice(0, 54)
                    : conversation.title,
                updatedAt: userMessage.createdAt,
                messages: nextMessages,
              }
            : conversation,
        ),
      }));
      setInput("");
      setError(null);
      setLoading(true);

      try {
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: toApiMessages(nextMessages.slice(-MAX_HISTORY_MESSAGES)),
            detailLevel,
          }),
        });

        const payload: unknown = await response.json();

        if (!response.ok) {
          const message =
            typeof payload === "object" &&
            payload !== null &&
            "error" in payload &&
            typeof payload.error === "string"
              ? payload.error
              : "Non è stato possibile completare la richiesta.";

          throw new Error(message);
        }

        if (
          typeof payload !== "object" ||
          payload === null ||
          !("response" in payload) ||
          typeof payload.response !== "string" ||
          !payload.response.trim() ||
          !("sources" in payload) ||
          !Array.isArray(payload.sources) ||
          !payload.sources.every(isWebSource)
        ) {
          throw new Error("La risposta ricevuta non è valida. Riprova.");
        }

        const answer = payload as ChatResponse;
        const assistantMessage = {
          ...createMessage("assistant", answer.response),
          ...(answer.sources.length > 0 ? { sources: answer.sources } : {}),
        };
        setConversationStore((current) => ({
          ...current,
          conversations: current.conversations.map((conversation) =>
            conversation.id === conversationId
              ? {
                  ...conversation,
                  updatedAt: assistantMessage.createdAt,
                  messages: [...conversation.messages, assistantMessage].slice(-100),
                }
              : conversation,
          ),
        }));
        setAnimatedMessageId(assistantMessage.id);
      } catch (requestError) {
        setError(
          requestError instanceof Error
            ? requestError.message
            : "Si è verificato un errore imprevisto. Riprova.",
        );
      } finally {
        setLoading(false);
      }
    },
    [activeConversation, detailLevel, input, loading, messages, storageReady],
  );

  const startNewConversation = () => {
    const conversation = createConversation();
    setConversationStore((current) => ({
      conversations: [
        conversation,
        ...current.conversations.filter((item) => item.messages.length > 0).slice(0, 39),
      ],
      activeId: conversation.id,
    }));
    setInput("");
    setError(null);
    setAnimatedMessageId(null);
  };

  const selectConversation = (conversationId: string) => {
    setConversationStore((current) => ({ ...current, activeId: conversationId }));
    setInput("");
    setError(null);
    setAnimatedMessageId(null);
  };

  const clearConversationArchive = async () => {
    if (
      !storageReady ||
      loading ||
      !window.confirm(
        "Vuoi eliminare tutte le conversazioni condivise con chi usa questo stesso IP?",
      )
    ) {
      return;
    }

    setLoading(true);
    setError(null);
    try {
      if (saveTimer.current !== null) {
        window.clearTimeout(saveTimer.current);
        saveTimer.current = null;
      }
      await saveQueue.current.catch(() => undefined);
      const response = await fetch("/api/conversations", { method: "DELETE" });
      const payload: unknown = await response.json();
      if (!response.ok) {
        const message =
          typeof payload === "object" && payload !== null && "error" in payload &&
          typeof payload.error === "string"
            ? payload.error
            : "Non riesco a eliminare le conversazioni dal server.";
        throw new Error(message);
      }

      const initial = createConversation();
      setConversationStore({ conversations: [initial], activeId: initial.id });
      setInput("");
      setAnimatedMessageId(null);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Non riesco a eliminare le conversazioni dal server.",
      );
    } finally {
      setLoading(false);
    }
  };

  const recentConversations = [...conversationStore.conversations]
    .sort((left, right) => right.updatedAt - left.updatedAt)
    .slice(0, 8);
  const status: AvatarStatus = loading ? "thinking" : "listening";

  return (
    <main className="app-shell">
      <div className="product-layout">
        <aside className="app-sidebar" aria-label="Navigazione conversazioni">
          <Link className="sidebar-brand" href="/" aria-label="Dialoghi con Annibale, torna alla pagina iniziale">
            <span className="sidebar-brand-mark" aria-hidden="true">H</span>
            <span className="sidebar-brand-copy">
              <strong>Dialoghi</strong>
              <small>con Annibale</small>
            </span>
          </Link>

          <button className="sidebar-new" type="button" onClick={startNewConversation} disabled={loading || !storageReady}>
            <Plus size={16} aria-hidden="true" />
            Nuova conversazione
          </button>

          <div className="sidebar-section">
            <span className="sidebar-label">CONVERSAZIONI RECENTI</span>
            {recentConversations.length > 0 ? recentConversations.map((conversation) => (
              <button
                className={`sidebar-conversation${conversation.id === conversationStore.activeId ? " sidebar-conversation--active" : ""}`}
                type="button"
                key={conversation.id}
                onClick={() => selectConversation(conversation.id)}
                disabled={loading}
                aria-current={conversation.id === conversationStore.activeId ? "page" : undefined}
              >
                <MessageSquareText size={15} aria-hidden="true" />
                <span>{conversation.title}</span>
              </button>
            )) : (
              <p className="sidebar-empty">Non ci sono ancora dialoghi salvati per questo IP.</p>
            )}
          </div>
          <p className="sidebar-storage-note">
            La cronologia è condivisa con chi usa lo stesso indirizzo IP.
          </p>
          <button
            className="sidebar-clear"
            type="button"
            onClick={() => void clearConversationArchive()}
            disabled={!storageReady || loading}
          >
            <Trash2 size={14} aria-hidden="true" />
            Elimina archivio condiviso
          </button>

          <a className="sidebar-settings" href="#historical-note">
            <Settings2 size={15} aria-hidden="true" />
            Metodo e fonti
          </a>
        </aside>

        <section className="conversation-column" aria-label="Dialogo con Annibale">
          <header className="conversation-header">
            <div>
              <span className="conversation-kicker">CARTAGINE · III SECOLO A.C.</span>
              <h1>Annibale</h1>
            </div>
            <div className="conversation-header-actions">
              <div className={`character-status${loading ? " character-status--thinking" : ""}`}>
                <span aria-hidden="true" />
                {loading ? "Sta riflettendo" : "Presente"}
              </div>
              <button className="mobile-new-conversation" type="button" onClick={startNewConversation} disabled={loading || !storageReady} aria-label="Nuova conversazione">
                <Plus size={18} aria-hidden="true" />
              </button>
              <button
                className="mobile-clear-conversations"
                type="button"
                onClick={() => void clearConversationArchive()}
                disabled={loading || !storageReady}
                aria-label="Elimina archivio condiviso"
              >
                <Trash2 size={16} aria-hidden="true" />
              </button>
            </div>
          </header>
          <p className="conversation-privacy-mobile">
            Archivio condiviso con chi usa lo stesso indirizzo IP.
          </p>
          <ChatWindow
            messages={messages}
            value={input}
            onChange={setInput}
            onSubmit={() => void sendMessage()}
            onSuggestedQuestion={(question) => void sendMessage(question)}
            loading={loading || !historyLoaded || !storageReady}
            error={error}
            onDismissError={() => setError(null)}
            status={status}
            animatedMessageId={animatedMessageId}
            detailLevel={detailLevel}
            onDetailLevelChange={setDetailLevel}
          />
        </section>

        <aside className="context-rail" aria-label="Contesto storico">
          <div className="portrait-context">
            <AnnibalAvatar status={status} />
          </div>
          <div id="context-card">
            <HistoricalContext />
          </div>
          <div className="history-note" id="historical-note">
            <BookOpenText size={15} aria-hidden="true" />
            <p>Una voce immaginata dalle testimonianze antiche. Fatti e incertezze sono distinti; i sentimenti sono ricostruzioni, non prove.</p>
          </div>
        </aside>
      </div>
    </main>
  );
}
