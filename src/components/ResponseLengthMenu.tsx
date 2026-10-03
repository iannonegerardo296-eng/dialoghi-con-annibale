"use client";

import { useEffect, useRef, useState } from "react";
import { Check, ChevronDown } from "lucide-react";
import { gsap } from "gsap";
import type { ResponseDetail } from "@/lib/chatTypes";
import { useReducedMotion } from "@/hooks/useReducedMotion";

const OPTIONS: Array<{
  value: ResponseDetail;
  label: string;
  description: string;
  tooltip: string;
}> = [
  {
    value: "brief",
    label: "Breve",
    description: "1–2 frasi",
    tooltip: "Una risposta essenziale, ideale per un chiarimento rapido.",
  },
  {
    value: "normal",
    label: "Normale",
    description: "2–4 frasi",
    tooltip: "Il giusto contesto storico senza soffermarsi sui dettagli secondari.",
  },
  {
    value: "detailed",
    label: "Approfondita",
    description: "Contesto e dettagli",
    tooltip: "Una spiegazione più ampia con cronologia, protagonisti e incertezze.",
  },
];

interface ResponseLengthMenuProps {
  value: ResponseDetail;
  onChange: (value: ResponseDetail) => void;
}

export function ResponseLengthMenu({ value, onChange }: ResponseLengthMenuProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();
  const selected = OPTIONS.find((option) => option.value === value) ?? OPTIONS[1];

  useEffect(() => {
    if (!open) return;

    const closeOnOutsidePointer = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
      }
    };

    document.addEventListener("pointerdown", closeOnOutsidePointer);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOnOutsidePointer);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [open]);

  useEffect(() => {
    if (!open || !menuRef.current) return;

    if (reducedMotion || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      menuRef.current.style.opacity = "1";
      menuRef.current.style.transform = "translateY(0) scale(1)";
      return;
    }

    const menu = menuRef.current;
    gsap.fromTo(
      menu,
      { autoAlpha: 0, y: -7, scale: 0.98 },
      { autoAlpha: 1, y: 0, scale: 1, duration: 0.2, ease: "power2.out" },
    );

    return () => {
      gsap.killTweensOf(menu);
      gsap.set(menu, { clearProps: "all" });
    };
  }, [open, reducedMotion]);

  return (
    <div className="response-settings">
      <span className="response-settings-label" id="response-detail-label">
        Lunghezza risposta
      </span>
      <span className="sr-only" aria-live="polite">
        Lunghezza selezionata: {selected.label}
      </span>
      <div
        className="response-length-control"
        ref={rootRef}
        onBlur={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
            setOpen(false);
          }
        }}
      >
        <button
          className="response-length-trigger"
          type="button"
          ref={triggerRef}
          aria-haspopup="menu"
          aria-expanded={open}
          aria-controls={open ? "response-length-menu" : undefined}
          aria-labelledby="response-detail-label response-length-selected"
          onClick={() => setOpen((current) => !current)}
        >
          <span id="response-length-selected">{selected.label}</span>
          <ChevronDown size={14} aria-hidden="true" />
        </button>

        {open && (
          <div
            className="response-length-menu"
            id="response-length-menu"
            role="menu"
            aria-labelledby="response-detail-label"
            ref={menuRef}
          >
            {OPTIONS.map((option) => (
              <button
                className="response-length-option"
                type="button"
                key={option.value}
                role="menuitemradio"
                aria-checked={value === option.value}
                aria-describedby={`response-length-tooltip-${option.value}`}
                onKeyDown={(event) => {
                  if (!["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) return;
                  event.preventDefault();
                  const options = menuRef.current?.querySelectorAll<HTMLButtonElement>(
                    '[role="menuitemradio"]',
                  );
                  if (!options?.length) return;

                  const currentIndex = Array.from(options).indexOf(event.currentTarget);
                  const nextIndex =
                    event.key === "Home"
                      ? 0
                      : event.key === "End"
                        ? options.length - 1
                        : (currentIndex + (event.key === "ArrowDown" ? 1 : -1) + options.length) %
                          options.length;
                  options[nextIndex]?.focus();
                }}
                onClick={() => {
                  onChange(option.value);
                  setOpen(false);
                  triggerRef.current?.focus();
                }}
              >
                <span className="response-length-option-copy">
                  <span className="response-length-option-label">{option.label}</span>
                  <span className="response-length-option-description">{option.description}</span>
                </span>
                {value === option.value && <Check size={15} aria-hidden="true" />}
                <span
                  className="response-length-tooltip"
                  id={`response-length-tooltip-${option.value}`}
                  role="tooltip"
                >
                  {option.tooltip}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
