import { NextRequest, NextResponse } from "next/server";
import type { ChatMessageData, WebSource } from "@/lib/chatTypes";
import type { ConversationStore, StoredConversation } from "@/lib/conversationTypes";
import { getClientIp } from "@/lib/clientIp";
import {
  clearConversationStore,
  readConversationStore,
  writeConversationStore,
} from "@/lib/server/ipConversationStore";

export const runtime = "nodejs";

const MAX_PAYLOAD_BYTES = 2_000_000;
const MAX_CONVERSATIONS = 40;
const MAX_MESSAGES_PER_CONVERSATION = 100;

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
    return url.protocol === "https:" &&
      (url.hostname === "wikipedia.org" || url.hostname.endsWith(".wikipedia.org"));
  } catch {
    return false;
  }
}

function isStoredMessage(value: unknown): value is ChatMessageData {
  if (typeof value !== "object" || value === null) return false;
  const message = value as Record<string, unknown>;
  return (
    typeof message.id === "string" &&
    message.id.length <= 100 &&
    (message.role === "user" || message.role === "assistant") &&
    typeof message.content === "string" &&
    message.content.length <= 12_000 &&
    typeof message.createdAt === "number" &&
    (!("sources" in message) ||
      (Array.isArray(message.sources) && message.sources.every(isWebSource)))
  );
}

function isStoredConversation(value: unknown): value is StoredConversation {
  if (typeof value !== "object" || value === null) return false;
  const conversation = value as Record<string, unknown>;
  return (
    typeof conversation.id === "string" &&
    conversation.id.length <= 100 &&
    typeof conversation.title === "string" &&
    conversation.title.length <= 120 &&
    typeof conversation.createdAt === "number" &&
    typeof conversation.updatedAt === "number" &&
    Array.isArray(conversation.messages) &&
    conversation.messages.length <= MAX_MESSAGES_PER_CONVERSATION &&
    conversation.messages.every(isStoredMessage)
  );
}

function isConversationStore(value: unknown): value is ConversationStore {
  if (typeof value !== "object" || value === null) return false;
  const store = value as Record<string, unknown>;
  if (!(
    Array.isArray(store.conversations) &&
    store.conversations.length <= MAX_CONVERSATIONS &&
    store.conversations.every(isStoredConversation) &&
    (store.activeId === null ||
      (typeof store.activeId === "string" &&
        store.conversations.some((conversation) => conversation.id === store.activeId)))
  )) {
    return false;
  }

  const totalCharacters = store.conversations.reduce(
    (total, conversation) =>
      total + conversation.messages.reduce((sum, message) => sum + message.content.length, 0),
    0,
  );
  return totalCharacters <= 1_500_000;
}

function unavailableIpResponse() {
  return NextResponse.json(
    { error: "Non riesco a identificare il tuo IP. Configura il proxy per inoltrare l’indirizzo reale." },
    { status: 503 },
  );
}

export async function GET(request: NextRequest) {
  const ip = getClientIp(request.headers);
  if (!ip) return unavailableIpResponse();

  try {
    return NextResponse.json(await readConversationStore(ip), {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    console.error("Unable to read IP-scoped conversations.", error);
    return NextResponse.json(
      { error: "Non riesco a caricare le conversazioni dal server." },
      { status: 500 },
    );
  }
}

export async function PUT(request: NextRequest) {
  const ip = getClientIp(request.headers);
  if (!ip) return unavailableIpResponse();

  const contentLength = Number(request.headers.get("content-length") ?? 0);
  if (contentLength > MAX_PAYLOAD_BYTES) {
    return NextResponse.json({ error: "La cronologia è troppo grande." }, { status: 413 });
  }

  try {
    const text = await request.text();
    if (Buffer.byteLength(text, "utf8") > MAX_PAYLOAD_BYTES) {
      return NextResponse.json({ error: "La cronologia è troppo grande." }, { status: 413 });
    }

    const payload: unknown = JSON.parse(text);
    if (!isConversationStore(payload)) {
      return NextResponse.json({ error: "Formato della cronologia non valido." }, { status: 400 });
    }

    await writeConversationStore(ip, payload);
    return NextResponse.json({ saved: true }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    if (error instanceof SyntaxError) {
      return NextResponse.json({ error: "Il formato della richiesta non è valido." }, { status: 400 });
    }
    console.error("Unable to save IP-scoped conversations.", error);
    return NextResponse.json(
      { error: "Non riesco a salvare le conversazioni sul server." },
      { status: 500 },
    );
  }
}

export async function DELETE(request: NextRequest) {
  const ip = getClientIp(request.headers);
  if (!ip) return unavailableIpResponse();

  try {
    await clearConversationStore(ip);
    return NextResponse.json({ deleted: true }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("Unable to delete IP-scoped conversations.", error);
    return NextResponse.json(
      { error: "Non riesco a eliminare le conversazioni dal server." },
      { status: 500 },
    );
  }
}
