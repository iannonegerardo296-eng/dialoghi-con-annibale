"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown, ScrollText } from "lucide-react";
import { gsap } from "gsap";
import { useReducedMotion } from "@/hooks/useReducedMotion";

const TIMELINE = [
  { year: "circa 247 a.C.", detail: "Cartagine o la Spagna cartaginese: nascita approssimativa di Annibale." },
  { year: "218 a.C.", detail: "Iberia e Alpi: partenza dalla Spagna e attraversamento delle montagne verso l'Italia." },
  { year: "217 a.C.", detail: "Lago Trasimeno, in Umbria: scontro decisivo contro i romani." },
  { year: "216 a.C.", detail: "Canne, in Puglia: battaglia di fama straordinaria contro un esercito romano molto più numeroso." },
  { year: "212-211 a.C.", detail: "Campania e provincia meridionale: lotta per Capua e il controllo del sud dell'Italia." },
  { year: "202 a.C.", detail: "Zama, in Africa: sconfitta finale di Cartagine contro Scipione." },
  { year: "circa 183 a.C.", detail: "Bithynia o altre aree del mondo greco-orientale: esilio, morte e ultimo riflesso della sua carriera." },
];

export function HistoricalContext() {
  const [open, setOpen] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    const content = contentRef.current;
    if (!content || !open) return;

    if (reducedMotion) {
      gsap.set(content, { opacity: 1, y: 0 });
      return;
    }

    const context = gsap.context(() => {
      gsap.fromTo(content, { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 0.32, ease: "power2.out" });
      gsap.fromTo(
        ".timeline li",
        { opacity: 0, x: -7 },
        {
          opacity: 1,
          x: 0,
          duration: 0.3,
          stagger: 0.055,
          delay: 0.06,
          ease: "power2.out",
          clearProps: "all",
        },
      );
    }, content);

    return () => context.revert();
  }, [open, reducedMotion]);

  return (
    <section className={`history-card${open ? " history-card--open" : ""}`}>
      <button
        className="history-toggle"
        type="button"
        aria-expanded={open}
        aria-controls="history-details"
        onClick={() => setOpen((current) => !current)}
      >
        <span className="history-icon" aria-hidden="true">
          <ScrollText size={17} />
        </span>

        <span>
          <span className="eyebrow">Coordinate essenziali</span>
          <strong>Contesto storico</strong>
        </span>

        <ChevronDown className="history-chevron" size={17} aria-hidden="true" />
      </button>

      {open && (
        <div className="history-content" id="history-details" ref={contentRef}>
          <ol className="timeline">
            {TIMELINE.map((item) => (
              <li key={item.year}>
                <span className="timeline-year">{item.year}</span>
                <p>{item.detail}</p>
              </li>
            ))}
          </ol>

          <p className="timeline-caveat">Le date antiche possono variare secondo le fonti e le convenzioni adottate.</p>
        </div>
      )}
    </section>
  );
}
