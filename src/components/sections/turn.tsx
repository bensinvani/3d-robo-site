"use client";
import { gsap } from "@/lib/gsap";
import { SequenceCanvas } from "@/components/sequence-canvas";

const BEATS = [
  { at: 0.25, text: "robo hears you." },
  { at: 0.55, text: "robo gets you." },
  { at: 0.85, text: "robo's got you." },
];

export function Turn() {
  return (
    <SequenceCanvas
      name="turn"
      frames={200}
      poster="/media/robo-1.jpg"
      scrollLength="+=200%"
      buildTimeline={(tl) => {
        gsap.utils.toArray<HTMLElement>(".beat").forEach((el, i) => {
          const { at } = BEATS[i];
          tl.fromTo(el, { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.08, ease: "power2.out" }, at - 0.08);
          if (i < BEATS.length - 1) {
            tl.to(el, { opacity: 0, y: -40, duration: 0.08, ease: "power1.in" }, at + 0.1);
          }
        });
      }}
    >
      <div className="absolute inset-0 flex items-center justify-start ps-[8vw]">
        <div className="relative h-32 w-full max-w-xl">
          {BEATS.map((b) => (
            <p key={b.text} className="beat headline absolute text-5xl text-mist opacity-0 drop-shadow-[0_2px_24px_rgba(22,24,29,0.45)] first:opacity-100 md:text-7xl">
              {b.text}
            </p>
          ))}
        </div>
      </div>
    </SequenceCanvas>
  );
}
