"use client";

import { useEffect, useRef } from "react";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { gsap } from "gsap";
import Link from "next/link";
import { useReducedMotion } from "@/hooks/useReducedMotion";

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
    if (!hero || reducedMotion) return;

    const context = gsap.context(() => {
      gsap.fromTo(
        ".hero-reveal",
        { opacity: 0, y: 18 },
        {
          opacity: 1,
          y: 0,
          duration: 0.75,
          stagger: 0.11,
          ease: "power3.out",
          clearProps: "all",
        },
      );
      gsap.fromTo(
        ".hero-medallion",
        { opacity: 0, scale: 0.9, rotation: -8 },
        { opacity: 1, scale: 1, rotation: 0, duration: 1.2, delay: 0.25, ease: "power2.out" },
      );
      gsap.to(".hero-medallion-ring", {
        rotation: 360,
        duration: 90,
        repeat: -1,
        ease: "none",
        transformOrigin: "50% 50%",
      });
      gsap.to(".hero-medallion-glow", {
        opacity: 0.72,
        scale: 1.08,
        duration: 3.6,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });
    }, hero);

    return () => context.revert();
  }, [reducedMotion]);

  return (
    <section className="landing-hero" ref={heroRef} aria-labelledby="hero-title">
      <div className="hero-copy">
        <div className="hero-kicker hero-reveal">
          <span className="hero-kicker-rule" />
          <span>Una voce dal Mediterraneo antico</span>
        </div>

        <h2 className="hero-title hero-reveal" id="hero-title">
          La storia non è
          <br />
          <em>mai una linea retta.</em>
        </h2>

        <p className="hero-description hero-reveal">
          Attraversa date, luoghi e scelte decisive della Seconda guerra punica.
          Incontra Annibale in un dialogo storico guidato dalle fonti e attento
          a ciò che non possiamo sapere con certezza.
        </p>

        <div className="hero-actions hero-reveal">
          <Link className="hero-primary-action" href="/chat">
            Entra nel dialogo
            <ArrowRight size={16} aria-hidden="true" />
          </Link>
          <a className="hero-secondary-action" href="#historical-note">
            Il metodo storico
            <ArrowUpRight size={15} aria-hidden="true" />
          </a>
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

      <div className="hero-medallion" aria-hidden="true">
        <div className="hero-medallion-glow" />
        <div className="hero-medallion-ring">
          <span className="hero-medallion-tick hero-medallion-tick--top" />
          <span className="hero-medallion-tick hero-medallion-tick--bottom" />
          <span className="hero-medallion-tick hero-medallion-tick--left" />
          <span className="hero-medallion-tick hero-medallion-tick--right" />
        </div>
        <div className="hero-medallion-center">
          <span className="hero-medallion-name">Barca</span>
          <span className="hero-medallion-era">III · secolo a.C.</span>
        </div>
      </div>
    </section>
  );
}
