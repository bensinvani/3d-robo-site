"use client";
import { useRef, useState } from "react";
import { SequenceCanvas } from "@/components/sequence-canvas";

// Threshold-toggled beats: visibility flips at scroll zones, but the MOTION runs on a
// CSS transition's own clock — smooth regardless of how notchy the scroll input is.
const BEATS = [
  { show: 0.12, hide: 0.38, text: "robo hears you." },
  { show: 0.42, hide: 0.68, text: "robo gets you." },
  { show: 0.72, hide: 1.01, text: "robo's got you." },
];

export function Turn() {
  const [active, setActive] = useState(-1);
  const activeRef = useRef(-1);

  const onProgress = (p: number) => {
    const idx = BEATS.findIndex((b) => p >= b.show && p < b.hide);
    if (idx !== activeRef.current) {
      activeRef.current = idx;
      setActive(idx); // state only when the visible beat actually changes
    }
  };

  return (
    <SequenceCanvas
      name="turn"
      frames={201}
      poster="/media/turn-poster.webp"
      scrollLength="+=200%"
      onProgress={onProgress}
    >
      <div className="absolute inset-0 flex items-center justify-start ps-[8vw]">
        <div className="relative h-32 w-full max-w-xl">
          {BEATS.map((b, i) => (
            <p
              key={b.text}
              className={`beat headline absolute text-5xl text-mist drop-shadow-[0_2px_24px_rgba(22,24,29,0.45)] transition-all duration-500 ease-out md:text-7xl ${
                i === active
                  ? "translate-y-0 opacity-100"
                  : i < active || active === -1
                    ? "-translate-y-6 opacity-0"
                    : "translate-y-6 opacity-0"
              } ${i === 0 && active === -1 ? "max-md:translate-y-0 max-md:opacity-100" : ""}`}
            >
              {b.text}
            </p>
          ))}
        </div>
      </div>
    </SequenceCanvas>
  );
}
