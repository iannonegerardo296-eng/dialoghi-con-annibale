"use client";

import { useEffect } from "react";
import { gsap } from "gsap";
import { useReducedMotion } from "@/hooks/useReducedMotion";

export function LandingScrollMotion() {
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    const page = document.querySelector(".landing-page");
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (!page || reducedMotion || mediaQuery.matches || !("IntersectionObserver" in window)) return;

    const revealGroups = [
      {
        section: ".landing-introduction",
        targets: ".landing-introduction-copy, .landing-principles article",
        stagger: 0.09,
      },
      {
        section: ".landing-method",
        targets: ":scope > svg, :scope > p, :scope > a",
        stagger: 0.07,
      },
    ];
    let context: gsap.Context | null = null;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;

          const group = revealGroups.find((item) => entry.target.matches(item.section));
          if (!group) continue;

          const targets = entry.target.querySelectorAll<HTMLElement>(group.targets);
          context?.add(() =>
            gsap.fromTo(
              targets,
              { autoAlpha: 0, y: 15 },
              {
                autoAlpha: 1,
                y: 0,
                duration: 0.48,
                stagger: group.stagger,
                ease: "power2.out",
                clearProps: "all",
              },
            ),
          );
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.16, rootMargin: "0px 0px -6% 0px" },
    );

    context = gsap.context(() => {
      for (const group of revealGroups) {
        const section = page.querySelector(group.section);
        if (section) observer.observe(section);
      }
    }, page);

    return () => {
      observer.disconnect();
      context.revert();
    };
  }, [reducedMotion]);

  return null;
}
