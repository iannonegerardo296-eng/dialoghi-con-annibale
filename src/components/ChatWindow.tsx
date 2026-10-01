"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import type { ChatMessageData } from "@/lib/chatTypes";
import type { ResponseDetail } from "@/lib/chatTypes";
import type { AvatarStatus } from "@/components/AnnibalAvatar";
import { ChatInput } from "@/components/ChatInput";
import { ChatMessage } from "@/components/ChatMessage";
import { ResponseLengthMenu } from "@/components/ResponseLengthMenu";
import { SuggestedQuestions } from "@/components/SuggestedQuestions";
import { useReducedMotion } from "@/hooks/useReducedMotion";

interface ChatWindowProps {
  messages: ChatMessageData[];
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  onSuggestedQuestion: (question: string) => void;
  loading: boolean;
  error: string | null;
  onDismissError: () => void;
  status: AvatarStatus;
  animatedMessageId: string | null;
  detailLevel: ResponseDetail;
  onDetailLevelChange: (level: ResponseDetail) => void;
}

export function ChatWindow({
  messages,
  value,
  onChange,
  onSubmit,
  onSuggestedQuestion,
  loading,
  error,
  onDismissError,
  status,
  animatedMessageId,
  detailLevel,
  onDetailLevelChange,
}: ChatWindowProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLElement>(null);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    const panel = panelRef.current;
    if (!panel || reducedMotion) return;

    const context = gsap.context(() => {
      gsap.fromTo(
        [".chat-topline", ".response-settings", ".composer", ".ai-disclaimer"],
        { opacity: 0, y: 9 },
        {
          opacity: 1,
          y: 0,
          duration: 0.48,
          stagger: 0.08,
          ease: "power2.out",
          clearProps: "all",
        },
      );
    }, panel);

    return () => context.revert();
  }, [reducedMotion]);

  useEffect(() => {
    const container = scrollRef.current;
    if (container) {
      container.scrollTo({ top: container.scrollHeight, behavior: "smooth" });
    }
  }, [messages, loading]);

  return (
    <section className="chat-panel" id="conversation-space" aria-label="Conversazione con Annibale" ref={panelRef}>
      <div className="chat-topline">
        <div>
          <span className="eyebrow">Il campo del dialogo</span>
          <h2>La conversazione</h2>
        </div>

        <span className="conversation-indicator">
          <i aria-hidden="true" />
          {messages.length ? "Dialogo aperto" : "In attesa"}
        </span>
      </div>

      <div className="conversation-scroll" ref={scrollRef} aria-live="polite" aria-relevant="additions text">
        {messages.length === 0 ? (
          <SuggestedQuestions onSelect={onSuggestedQuestion} disabled={loading} />
        ) : (
          <div className="message-list">
            {messages.map((message) => (
              <ChatMessage
                key={message.id}
                message={message}
                animate={message.id === animatedMessageId}
              />
            ))}

            {loading && (
              <div className="thinking-indicator" role="status">
                <span className="thinking-seal" aria-hidden="true">
                  H
                </span>
                <div>
                  <strong>Annibale sta verificando le fonti e riflettendo…</strong>
                  <span className="thinking-caption">Ricerca storica in corso</span>
                  <div className="thinking-dots" aria-hidden="true">
                    <i />
                    <i />
                    <i />
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {error && (
        <div className="error-banner" role="alert">
          <p>{error}</p>
          <button type="button" onClick={onDismissError} aria-label="Chiudi il messaggio di errore">
            ×
          </button>
        </div>
      )}

      <ResponseLengthMenu value={detailLevel} onChange={onDetailLevelChange} />

      <ChatInput value={value} onChange={onChange} onSubmit={onSubmit} disabled={loading} />

      <p className="ai-disclaimer">Le risposte sono generate dall’IA e possono contenere semplificazioni storiche.</p>

      <span className="sr-only" aria-live="polite">
        {status === "thinking" ? "Annibale sta verificando le fonti storiche e preparando la risposta." : ""}
      </span>
    </section>
  );
}
