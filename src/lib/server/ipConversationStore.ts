import "server-only";
import { createHmac } from "node:crypto";
import { neon, type NeonQueryFunction } from "@neondatabase/serverless";
import type { ConversationStore } from "@/lib/conversationTypes";

const RETENTION_MS = 90 * 24 * 60 * 60 * 1000;

let schemaReady: Promise<void> | undefined;

function getDatabase() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is required to store conversations.");
  }

  return neon(connectionString);
}

async function getReadyDatabase() {
  const db = getDatabase();
  schemaReady ??= db`
    CREATE TABLE IF NOT EXISTS ip_conversations (
      ip_hash TEXT PRIMARY KEY,
      store_json JSONB NOT NULL,
      updated_at BIGINT NOT NULL
    )
  `
    .then(() => undefined)
    .catch((error: unknown) => {
      schemaReady = undefined;
      throw error;
    });

  await schemaReady;
  return db;
}

function getIpHash(ip: string): string {
  const secret = process.env.CHAT_STORAGE_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("CHAT_STORAGE_SECRET must contain at least 32 characters.");
  }

  return createHmac("sha256", secret).update(ip).digest("hex");
}

async function removeExpiredArchives(db: NeonQueryFunction<false, false>): Promise<void> {
  await db`
    DELETE FROM ip_conversations
    WHERE updated_at < ${Date.now() - RETENTION_MS}
  `;
}

export async function readConversationStore(ip: string): Promise<ConversationStore> {
  const db = await getReadyDatabase();
  await removeExpiredArchives(db);
  const rows = await db`
    SELECT store_json
    FROM ip_conversations
    WHERE ip_hash = ${getIpHash(ip)}
    LIMIT 1
  `;

  if (!rows[0]) return { conversations: [], activeId: null };
  const stored = rows[0].store_json;
  return (typeof stored === "string" ? JSON.parse(stored) : stored) as ConversationStore;
}

export async function writeConversationStore(ip: string, store: ConversationStore): Promise<void> {
  const db = await getReadyDatabase();
  await removeExpiredArchives(db);
  await db`
    INSERT INTO ip_conversations (ip_hash, store_json, updated_at)
    VALUES (${getIpHash(ip)}, ${JSON.stringify(store)}::jsonb, ${Date.now()})
    ON CONFLICT (ip_hash) DO UPDATE SET
      store_json = EXCLUDED.store_json,
      updated_at = EXCLUDED.updated_at
  `;
}

export async function clearConversationStore(ip: string): Promise<void> {
  const db = await getReadyDatabase();
  await db`
    DELETE FROM ip_conversations
    WHERE ip_hash = ${getIpHash(ip)}
  `;
}
