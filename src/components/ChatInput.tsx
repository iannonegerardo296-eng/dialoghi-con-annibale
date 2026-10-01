"use client";

import { useEffect, useRef } from "react";
import { ArrowUp, LoaderCircle } from "lucide-react";

interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  disabled: boolean;
}

export function ChatInput({ value, onChange, onSubmit, disabled }: ChatInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    textarea.style.height = "auto";
    textarea.style.height = `${Math.min(textarea.scrollHeight, 160)}px`;
  }, [value]);

  return (
    <div className="composer-wrap">
      <div className="composer">
        <label className="sr-only" htmlFor="chat-prompt">
          Scrivi un messaggio ad Annibale
        </label>

        <textarea
          id="chat-prompt"
          ref={textareaRef}
          rows={1}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault();
              onSubmit();
            }
          }}
          placeholder="Parla con Annibale…"
          maxLength={4000}
          disabled={disabled}
        />

        <button
          className="send-button"
          type="button"
          onClick={onSubmit}
          disabled={disabled || !value.trim()}
          aria-label={disabled ? "Annibale sta elaborando la risposta" : "Invia messaggio"}
        >
          {disabled ? <LoaderCircle size={18} className="spinner" /> : <ArrowUp size={18} />}
          <span className="send-label">{disabled ? "Attendi" : "Invia"}</span>
        </button>
      </div>
      <p className="input-hint">Invio per inviare <span>·</span> Maiusc + Invio per andare a capo</p>
    </div>
  );
}
