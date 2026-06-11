"use client";
import { useRef } from "react";
import { gsap, SplitText, useGSAP } from "@/lib/gsap";

export function Cta() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    (_, contextSafe) => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const split = SplitText.create(".cta-title", { type: "chars" });
        gsap.from(split.chars, {
          yPercent: 120, opacity: 0, stagger: 0.05, duration: 0.8, ease: "back.out(1.6)",
          scrollTrigger: { trigger: root.current, start: "top 70%", toggleActions: "play none none reverse" },
        });
      });
      // magnetic button — desktop pointer only
      mm.add("(min-width: 768px) and (pointer: fine) and (prefers-reduced-motion: no-preference)", () => {
        const btn = root.current!.querySelector<HTMLElement>(".magnetic")!;
        const xTo = gsap.quickTo(btn, "x", { duration: 0.4, ease: "power3" });
        const yTo = gsap.quickTo(btn, "y", { duration: 0.4, ease: "power3" });
        const move = contextSafe!((e: MouseEvent) => {
          const r = btn.getBoundingClientRect();
          const dx = e.clientX - (r.left + r.width / 2);
          const dy = e.clientY - (r.top + r.height / 2);
          const dist = Math.hypot(dx, dy);
          if (dist < 160) { xTo(dx * 0.35); yTo(dy * 0.35); }
          else { xTo(0); yTo(0); }
        });
        window.addEventListener("mousemove", move);
        return () => window.removeEventListener("mousemove", move);
      });
    },
    { scope: root }
  );

  return (
    <section ref={root} className="relative flex h-screen flex-col items-center justify-center overflow-hidden bg-ink">
      <video
        className="absolute inset-0 h-full w-full object-cover opacity-40"
        src="/media/fog.mp4" autoPlay muted loop playsInline aria-hidden
      />
      <div className="relative z-10 flex flex-col items-center gap-12 text-center">
        <h2 className="cta-title headline overflow-hidden text-[18vw] text-mist md:text-[12vw]">
          say hi.
        </h2>
        <a
          href="#"
          className="magnetic rounded-full bg-glow px-10 py-5 font-body text-lg font-semibold text-ink shadow-[0_0_60px_rgba(255,143,160,0.45)] transition-shadow hover:shadow-[0_0_90px_rgba(255,143,160,0.7)]"
        >
          preorder robo
        </a>
      </div>
      <footer className="absolute bottom-6 font-body text-xs text-knit">
        © 2026 robo · made with claude
      </footer>
    </section>
  );
}
