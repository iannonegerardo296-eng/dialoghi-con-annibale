"use client";

import { useEffect, useRef } from "react";
import { ArrowRight } from "lucide-react";
import { gsap } from "gsap";
import Link from "next/link";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { AnnibalAvatar } from "@/components/AnnibalAvatar";

const KEY_DATES = [
  { date: "218 a.C.", place: "Le Alpi" },
  { date: "216 a.C.", place: "Canne" },
  { date: "202 a.C.", place: "Zama" },
];

export function LandingHero() {
  const heroRef = useRef<HTMLElement>(null);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    const hero = heroRef.current;
    if (
      !hero ||
      reducedMotion ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }

    const context = gsap.context(() => {
      const copy = hero.querySelectorAll<HTMLElement>(
        ".hero-kicker, .hero-title, .hero-description, .hero-actions",
      );
      const dates = hero.querySelectorAll<HTMLElement>(".hero-date");
      const portrait = hero.querySelector<HTMLElement>(".hero-portrait");
      const timeline = gsap.timeline();

      timeline.fromTo(
        copy,
        { autoAlpha: 0, y: 14 },
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.52,
          stagger: 0.075,
          ease: "power2.out",
          clearProps: "all",
        },
      );
      timeline.fromTo(
        dates,
        { autoAlpha: 0, y: 8 },
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.36,
          stagger: 0.07,
          ease: "power2.out",
          clearProps: "all",
        },
        "-=0.2",
      );
      if (portrait) {
        timeline.fromTo(
          portrait,
          { autoAlpha: 0, x: 10 },
          {
            autoAlpha: 1,
            x: 0,
            duration: 0.56,
            ease: "power2.out",
            clearProps: "all",
          },
          0.14,
        );
      }
    }, hero);

    return () => context.revert();
  }, [reducedMotion]);

  return (
    <section className="landing-hero" ref={heroRef} aria-labelledby="hero-title">
      <div className="hero-layout">
        <div className="hero-copy">
          <div className="hero-kicker hero-reveal">
            <span className="hero-kicker-rule" />
            <span>Cartagine · III secolo a.C.</span>
          </div>

          <h1 className="hero-title hero-reveal" id="hero-title">
            Incontra Annibale.
            <br />
            <em>Interroga la storia.</em>
          </h1>

          <p className="hero-description hero-reveal">
            Una conversazione con il generale cartaginese, ricostruita con attenzione
            alle fonti. Chiedi delle sue scelte, dei suoi viaggi o del mondo che
            conobbe: ciò che è incerto viene detto apertamente.
          </p>

          <div className="hero-actions hero-reveal">
            <Link className="hero-primary-action" href="/chat">
              Inizia la conversazione
              <ArrowRight size={16} aria-hidden="true" />
            </Link>
          </div>

          <div className="hero-dates hero-reveal" aria-label="Tre date chiave">
            {KEY_DATES.map((item, index) => (
              <div className="hero-date" key={item.date}>
                {index > 0 && <span className="hero-date-divider" aria-hidden="true" />}
                <strong>{item.date}</strong>
                <span>{item.place}</span>
              </div>
            ))}
          </div>
        </div>

        <aside className="hero-portrait hero-reveal" aria-label="Ritratto artistico di Annibale">
          <AnnibalAvatar status="listening" />
          <p>Un volto immaginato dalle fonti, non una ricostruzione autentica.</p>
        </aside>
      </div>
    </section>
  );
}
