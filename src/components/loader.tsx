"use client";
import { useEffect, useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { usePreload } from "@/lib/store";

/** Branded loader: robo's eyes blink while the hero sequence preloads. Real progress, no fake spinner. */
export function Loader() {
  const root = useRef<HTMLDivElement>(null);
  const bar = useRef<HTMLDivElement>(null);
  const ready = usePreload((s) => s.ready);
  const setReady = usePreload((s) => s.setReady);

  useGSAP(
    () => {
      gsap.to(".eye", {
        scaleY: 0.1,
        duration: 0.12,
        yoyo: true,
        repeat: -1,
        repeatDelay: 2.2,
        transformOrigin: "center",
        stagger: 0.04,
      });
    },
    { scope: root }
  );

  useEffect(() => {
    // drive the bar from store progress; finish when hero sequence is in
    const unsub = usePreload.subscribe((s) => {
      const p = s.progress["hero"] ?? 0;
      if (bar.current) bar.current.style.transform = `scaleX(${p})`;
      if (p >= 1 && !s.ready) setReady();
    });
    // safety: never trap the user behind a loader
    const safety = setTimeout(setReady, 6000);
    return () => { unsub(); clearTimeout(safety); };
  }, [setReady]);

  useEffect(() => {
    if (!ready || !root.current) return;
    gsap.timeline()
      .to(".eye", { opacity: 1, boxShadow: "0 0 40px #ff8fa0", duration: 0.25 })
      .to(root.current, { yPercent: -100, duration: 0.9, ease: "power3.inOut" })
      .set(root.current, { display: "none" });
  }, [ready]);

  return (
    <div ref={root} className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-10 bg-ink">
      <div className="flex gap-8">
        <div className="eye h-16 w-7 rounded-full bg-glow opacity-80 shadow-[0_0_24px_#ff8fa0]" />
        <div className="eye h-16 w-7 rounded-full bg-glow opacity-80 shadow-[0_0_24px_#ff8fa0]" />
      </div>
      <div className="h-px w-40 overflow-hidden rounded bg-knit/30">
        <div ref={bar} className="h-full w-full origin-left scale-x-0 bg-glow transition-transform duration-300" />
      </div>
      <p className="font-body text-xs tracking-[0.3em] text-mist/60 uppercase">waking robo</p>
    </div>
  );
}
