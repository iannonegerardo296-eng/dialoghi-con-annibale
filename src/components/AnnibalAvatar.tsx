"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { useReducedMotion } from "@/hooks/useReducedMotion";

export type AvatarStatus = "listening" | "thinking";

interface AnnibalAvatarProps {
  status: AvatarStatus;
}

const STATUS_LABELS: Record<AvatarStatus, string> = {
  listening: "In ascolto",
  thinking: "Sta riflettendo",
};

export function AnnibalAvatar({ status }: AnnibalAvatarProps) {
  const portraitRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    const portrait = portraitRef.current;
    if (!portrait) return;

    const context = gsap.context(() => {
      if (reducedMotion) {
        gsap.set(".portrait-bob", { y: 0, rotation: 0 });
        gsap.set(".portrait-glow", { opacity: 0.45 });
        return;
      }

      gsap.killTweensOf(".portrait-bob, .portrait-glow");

      if (status === "thinking") {
        gsap.to(".portrait-bob", {
          y: 3,
          rotation: -1.1,
          duration: 0.8,
          ease: "power2.inOut",
          yoyo: true,
          repeat: 1,
        });
        gsap.to(".portrait-glow", { opacity: 0.23, duration: 0.6 });
        return;
      }

      gsap.to(".portrait-bob", {
        y: -4,
        rotation: 0.35,
        duration: 3.8,
        ease: "sine.inOut",
        yoyo: true,
        repeat: -1,
      });

      gsap.to(".portrait-glow", {
        opacity: 0.56,
        duration: 2.4,
      });
    }, portrait);

    return () => context.revert();
  }, [reducedMotion, status]);

  return (
    <section className={`portrait-card portrait-card--${status}`} aria-label="Ritratto artistico di Annibale">
      <div className="portrait-art" ref={portraitRef}>
        <div className="portrait-glow" aria-hidden="true" />
        <div className="portrait-bob">
          <Image
            src="/avatar-placeholder.svg"
            alt="Ritratto illustrato, non realistico, di un comandante cartaginese"
            className="portrait-image"
            width={360}
            height={410}
            priority
            unoptimized
          />
        </div>

        <span className="portrait-caption">Rappresentazione artistica</span>
      </div>

      <div className="portrait-info">
        <div className="portrait-heading">
          <span className={`status-dot status-dot--${status}`} aria-hidden="true" />
          <span>{STATUS_LABELS[status]}</span>
        </div>

        <h2>Annibale Barca</h2>
        <p>Generale cartaginese</p>
        <span className="portrait-dates">247–circa 183 a.C.</span>
      </div>

      <div className="portrait-motto">
        <span className="motto-line" aria-hidden="true" />
        <p>Strategia, adattamento, memoria.</p>
      </div>
    </section>
  );
}
