"use client";
import { useRef } from "react";
import Image from "next/image";
import { gsap, useGSAP } from "@/lib/gsap";

const TRAITS = [
  { img: "/media/robo-3.jpg", word: "soft.", line: "knit on the outside, gentle on the inside." },
  { img: "/media/robo-2.jpg", word: "smart.", line: "learns your vibe, one hangout at a time." },
  { img: "/media/robo-1.jpg", word: "yours.", line: "one robo, tuned entirely to you." },
];

export function Traits() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(min-width: 768px) and (prefers-reduced-motion: no-preference)", () => {
        const track = root.current!.querySelector<HTMLElement>(".track")!;
        const xTween = gsap.to(track, {
          x: () => -(track.scrollWidth - window.innerWidth),
          ease: "none",
          scrollTrigger: {
            trigger: root.current,
            pin: true,
            anticipatePin: 1,
            scrub: 1.2,
            end: () => `+=${track.scrollWidth - window.innerWidth}`,
            invalidateOnRefresh: true,
          },
        });
        gsap.utils.toArray<HTMLElement>(".card").forEach((card) => {
          gsap.from(card.querySelector(".card-word"), {
            yPercent: 60, opacity: 0, ease: "none",
            scrollTrigger: {
              trigger: card, containerAnimation: xTween,
              start: "left 80%", end: "left 40%", scrub: true,
            },
          });
        });
      });
    },
    { scope: root }
  );

  return (
    <section ref={root} className="overflow-hidden bg-ink py-24 md:h-screen md:py-0">
      <div className="track flex flex-col gap-16 px-6 md:h-full md:w-max md:flex-row md:items-center md:gap-[8vw] md:px-[12vw]">
        <h2 className="headline shrink-0 text-6xl text-mist md:text-[7vw]">
          three things<br />
          <span className="text-glow">to know.</span>
        </h2>
        {TRAITS.map((t) => (
          <article key={t.word} className="card relative shrink-0 md:w-[34vw]">
            <div className="relative aspect-[3/4] overflow-hidden rounded-3xl">
              <Image src={t.img} alt={`robo — ${t.word}`} fill sizes="(max-width: 768px) 90vw, 34vw"
                className="object-cover" />
            </div>
            <h3 className="card-word headline mt-6 text-5xl text-mist md:text-6xl">{t.word}</h3>
            <p className="mt-2 max-w-xs font-body text-knit">{t.line}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
