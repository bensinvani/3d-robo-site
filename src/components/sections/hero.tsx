"use client";
import { useRef } from "react";
import { SplitText } from "@/lib/gsap";
import { SequenceCanvas } from "@/components/sequence-canvas";

export function Hero() {
  const copy = useRef<HTMLDivElement>(null);

  return (
    <SequenceCanvas
      name="hero"
      frames={200}
      poster="/media/robo-2.jpg"
      scrollLength="+=300%"
      buildTimeline={(tl) => {
        const split = SplitText.create(".hero-title", { type: "lines", mask: "lines" });
        tl.from(split.lines, {
          yPercent: 110, stagger: 0.02, duration: 0.1, ease: "power3.out",
        }, 0.02)
          .from(".hero-sub", { opacity: 0, y: 30, duration: 0.08, ease: "power2.out" }, 0.1)
          .to(copy.current, { yPercent: -60, opacity: 0, duration: 0.25, ease: "power1.in" }, 0.65);
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
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 font-body text-[10px] tracking-[0.4em] text-mist/50 uppercase">
        scroll
      </div>
    </SequenceCanvas>
  );
}
