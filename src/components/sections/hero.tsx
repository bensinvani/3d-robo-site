"use client";
import { useRef } from "react";
import { gsap, SplitText, useGSAP } from "@/lib/gsap";
import { SequenceCanvas } from "@/components/sequence-canvas";
import { usePreload } from "@/lib/store";

export function Hero() {
  const copy = useRef<HTMLDivElement>(null);

  // entrance plays once, after the loader leaves — not tied to scroll
  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const split = SplitText.create(".hero-title", { type: "lines", mask: "lines" });
        gsap.set(split.lines, { yPercent: 110 });
        gsap.set(".hero-sub", { opacity: 0, y: 30 });
        const play = () => {
          gsap.timeline({ delay: 0.7 }) // lands as the loader slides away
            .to(split.lines, { yPercent: 0, stagger: 0.1, duration: 1, ease: "power3.out" })
            .to(".hero-sub", { opacity: 1, y: 0, duration: 0.7, ease: "power2.out" }, "-=0.5");
        };
        if (usePreload.getState().ready) play();
        else {
          const unsub = usePreload.subscribe((s) => { if (s.ready) { unsub(); play(); } });
          return () => unsub();
        }
      });
    },
    { scope: copy }
  );

  return (
    <SequenceCanvas
      name="hero"
      frames={201}
      poster="/media/hero-poster.webp"
      scrollLength="+=300%"
      buildTimeline={(tl) => {
        // scroll owns only the exit; entrance already played on load
        tl.to(copy.current, { yPercent: -60, opacity: 0, duration: 0.25, ease: "power1.in" }, 0.6)
          .to(".hero-scroll-hint", { opacity: 0, duration: 0.05 }, 0.02);
      }}
    >
      <div ref={copy} className="absolute inset-0 flex flex-col items-center justify-end pb-[12vh] text-center">
        <h1 className="hero-title headline text-[16vw] text-mist drop-shadow-[0_2px_30px_rgba(22,24,29,0.35)] md:text-[11vw]">
          meet robo.
        </h1>
        <p className="hero-sub mt-6 max-w-md font-body text-base text-mist/85 md:text-lg">
          a little companion with a big heart — built to listen, learn, and hang out.
        </p>
      </div>
      <div className="hero-scroll-hint absolute bottom-6 left-1/2 -translate-x-1/2 font-body text-[10px] tracking-[0.4em] text-mist/50 uppercase">
        scroll
      </div>
    </SequenceCanvas>
  );
}
