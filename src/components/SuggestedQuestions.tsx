"use client";

import { SUGGESTED_QUESTIONS } from "@/lib/constants";

interface SuggestedQuestionsProps {
  onSelect: (question: string) => void;
  disabled: boolean;
}

export function SuggestedQuestions({ onSelect, disabled }: SuggestedQuestionsProps) {
  return (
    <div className="welcome-panel">
      <div className="welcome-editorial">
        <span className="welcome-eyebrow">Una voce immaginata · non una citazione storica</span>
        <h2>ANNIBALE</h2>
        <p className="welcome-voice">
          Per me, ogni battaglia cominciava molto prima del primo passo.
        </p>
        <p>Chiedimi della strategia, dei miei viaggi, di Roma o del mondo in cui vissi.</p>
      </div>

      <div className="suggestion-list" aria-label="Spunti per iniziare">
        {SUGGESTED_QUESTIONS.slice(0, 4).map((question, index) => (
          <button
            className="suggestion-link"
            type="button"
            key={question}
            onClick={() => onSelect(question)}
            disabled={disabled}
          >
            <span className="suggestion-index" aria-hidden="true">0{index + 1}</span>
            <span>{question}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
