"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import { gsap } from "gsap";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import type { ChatMessageData } from "@/lib/chatTypes";

interface ChatMessageProps {
  message: ChatMessageData;
  animate?: boolean;
}

const TYPING_INTERVAL_MS = 18;

function formatMessageContent(text: string, isTyping: boolean): ReactNode[] {
  const parts: ReactNode[] = [];
  const boldPattern = /\*\*([\s\S]+?)\*\*/g;
  let cursor = 0;
  let match: RegExpExecArray | null;

  while ((match = boldPattern.exec(text)) !== null) {
    if (match.index > cursor) parts.push(text.slice(cursor, match.index));
    parts.push(<strong key={`bold-${match.index}`}>{match[1]}</strong>);
    cursor = match.index + match[0].length;
  }

  const remaining = text.slice(cursor);
  if (isTyping) {
    const openMarker = remaining.lastIndexOf("**");
    if (openMarker >= 0) {
      if (openMarker > 0) parts.push(remaining.slice(0, openMarker));
      parts.push(<strong key={`bold-open-${cursor}`}>{remaining.slice(openMarker + 2)}</strong>);
    } else {
      parts.push(remaining.endsWith("*") ? remaining.slice(0, -1) : remaining);
    }
  } else {
    parts.push(remaining);
  }

  return parts;
}

export function ChatMessage({ message, animate = false }: ChatMessageProps) {
  const messageRef = useRef<HTMLElement>(null);
  const reducedMotion = useReducedMotion();
  const isAssistant = message.role === "assistant";
  const characters = useMemo(() => Array.from(message.content), [message.content]);
  const [displayTime, setDisplayTime] = useState("");
  const [visibleCharacters, setVisibleCharacters] = useState(
    animate ? 0 : message.content.length,
  );

  useEffect(() => {
    setDisplayTime(
      new Intl.DateTimeFormat("it-IT", {
        hour: "2-digit",
        minute: "2-digit",
      }).format(message.createdAt),
    );
  }, [message.createdAt]);

  useEffect(() => {
    const contentCharacters = Array.from(message.content);

    if (!animate) {
      setVisibleCharacters(message.content.length);
      return;
    }

    if (reducedMotion) {
      setVisibleCharacters(message.content.length);
      return;
    }

    setVisibleCharacters(0);
    const startedAt = performance.now();
    let frame = 0;

    const reveal = (now: number) => {
      const nextCount = Math.min(
        contentCharacters.length,
        Math.floor((now - startedAt) / TYPING_INTERVAL_MS),
      );
      setVisibleCharacters(nextCount);
      if (nextCount < contentCharacters.length) {
        frame = requestAnimationFrame(reveal);
      }
    };

    frame = requestAnimationFrame(reveal);
    return () => cancelAnimationFrame(frame);
  }, [animate, message.content, reducedMotion]);

  useEffect(() => {
    if (reducedMotion || !messageRef.current) return;

    const context = gsap.context(() => {
      gsap.fromTo(
        messageRef.current,
        { y: 10, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.36, ease: "power2.out" },
      );
    }, messageRef);

    return () => context.revert();
  }, [message.id, reducedMotion]);

  return (
    <article
      className={`chat-message chat-message--${message.role}`}
      ref={messageRef}
      aria-label={isAssistant ? "Risposta di Annibale" : "Il tuo messaggio"}
    >
      {isAssistant && <div className="message-seal" aria-hidden="true">H</div>}

      <div className="message-body">
        <div className="message-meta">
          <strong>{isAssistant ? "Annibale" : "Tu"}</strong>
          <time dateTime={new Date(message.createdAt).toISOString()}>
            {displayTime || "\u00a0"}
          </time>
        </div>

        <p>
          {formatMessageContent(
            characters.slice(0, visibleCharacters).join(""),
            animate && visibleCharacters < characters.length,
          )}
          {animate && visibleCharacters < characters.length && (
            <span className="typing-cursor" aria-hidden="true" />
          )}
        </p>

        {isAssistant && message.sources && visibleCharacters >= characters.length && (
          <aside className="chat-sources" aria-label="Fonti web consultate">
            <span className="chat-sources-title">Fonti consultate · apri l’estratto per verificare</span>
            <ul>
              {message.sources.map((source, index) => (
                <li key={source.url}>
                  <details className="chat-source-item">
                    <summary>
                      <span className="source-number">[{index + 1}]</span>
                      <span>{source.title}</span>
                      <span
                        className="source-language"
                        title={source.language === "Wikipedia (inglese)" ? "Fonte in inglese" : "Fonte in italiano"}
                      >
                        {source.language === "Wikipedia (inglese)" ? "EN" : "IT"}
                      </span>
                    </summary>
                    <p>{source.excerpt}</p>
                    <a className="chat-source-link" href={source.url} target="_blank" rel="noreferrer">
                      Apri la voce completa
                    </a>
                  </details>
                </li>
              ))}
            </ul>
          </aside>
        )}
      </div>
    </article>
  );
}
