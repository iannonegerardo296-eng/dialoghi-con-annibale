"use client";

import { Compass, RotateCcw } from "lucide-react";

interface HeaderProps {
  onNewConversation: () => void;
  hasConversation: boolean;
}

export function Header({ onNewConversation, hasConversation }: HeaderProps) {
  return (
    <header className="site-header">
      <div className="brand">
        <div className="brand-seal" aria-hidden="true">
          <Compass size={20} strokeWidth={1.5} />
        </div>

        <div>
          <p className="eyebrow">Storia · Mediterraneo antico</p>
          <h1>Dialoghi con Annibale</h1>
          <p className="brand-subtitle">Annibale Barca, in conversazione</p>
        </div>
      </div>

      <div className="header-actions">
        <span className="reconstruction-badge">
          <span aria-hidden="true" />
          Ricostruzione AI
        </span>

        <button
          className="button button-quiet new-conversation"
          type="button"
          onClick={onNewConversation}
          disabled={!hasConversation}
          aria-label="Avvia una nuova conversazione"
        >
          <RotateCcw size={16} aria-hidden="true" />
          <span>Nuova conversazione</span>
        </button>
      </div>
    </header>
  );
}
