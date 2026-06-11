"use client";
import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { usePreload } from "@/lib/store";

interface Props {
  name: string;          // sequence folder under /sequences
  frames: number;
  poster: string;        // LCP-safe fallback; also the mobile/reduced-motion art
  scrollLength: string;  // ScrollTrigger end, e.g. "+=300%"
  /** Append overlay copy animations to the section's ONE pinned timeline.
   *  Author them as .from() tweens so the static (no-JS / poster) tier still reads. */
  buildTimeline?: (tl: gsap.core.Timeline) => void;
  className?: string;
  children?: React.ReactNode;
}

const src = (name: string, i: number) =>
  `/sequences/${name}/frame_${String(i + 1).padStart(4, "0")}.webp`;

export function SequenceCanvas({
  name, frames, poster, scrollLength, buildTimeline, className, children,
}: Props) {
  const wrap = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const report = usePreload((s) => s.report);

  useGSAP(
    () => {
      const el = canvas.current!;
      const mm = gsap.matchMedia();

      mm.add(
        { full: "(min-width: 768px) and (prefers-reduced-motion: no-preference)" },
        (ctx) => {
          if (!ctx.conditions?.full) {
            report(name, 1); // poster tier loads nothing
            return;
          }
          const c2d = el.getContext("2d")!;
          const images: (ImageBitmap | null)[] = [];
          const state = { frame: 0 };
          let raf = 0;
          let loaded = 0;

          const draw = () => {
            const img = images[Math.round(state.frame)];
            if (!img) return;
            const s = Math.max(el.width / img.width, el.height / img.height);
            const w = img.width * s, h = img.height * s;
            c2d.clearRect(0, 0, el.width, el.height);
            c2d.drawImage(img, (el.width - w) / 2, (el.height - h) / 2, w, h);
            el.style.opacity = "1"; // covers the poster once frames render
          };
          const scheduleDraw = () => {
            cancelAnimationFrame(raf);
            raf = requestAnimationFrame(draw);
          };

          Promise.all(
            Array.from({ length: frames }, (_, i) =>
              fetch(src(name, i))
                .then((r) => (r.ok ? r.blob().then(createImageBitmap) : null))
                .catch(() => null)
                .then((b) => { images[i] = b; report(name, ++loaded / frames); })
            )
          ).then(scheduleDraw);

          const setSize = () => {
            el.width = el.clientWidth * Math.min(devicePixelRatio, 2);
            el.height = el.clientHeight * Math.min(devicePixelRatio, 2);
            scheduleDraw();
          };
          setSize();
          addEventListener("resize", setSize);

          // ONE timeline per pinned section: frame scrub + overlay copy together
          const tl = gsap.timeline({
            scrollTrigger: {
              trigger: wrap.current,
              start: "top top",
              end: scrollLength,
              pin: true,
              scrub: 0.5,
            },
          });
          tl.to(state, {
            frame: frames - 1,
            ease: "none",
            duration: 1,
            onUpdate: scheduleDraw,
          }, 0);
          buildTimeline?.(tl);

          return () => {
            removeEventListener("resize", setSize);
            cancelAnimationFrame(raf);
            images.forEach((b) => b?.close());
          };
        }
      );
    },
    { scope: wrap }
  );

  return (
    <div ref={wrap} className={`relative h-screen overflow-hidden ${className ?? ""}`}>
      {/* eslint-disable-next-line @next/next/no-img-element -- intentional plain img: LCP poster under the canvas */}
      <img src={poster} alt="" className="absolute inset-0 h-full w-full object-cover" />
      <canvas ref={canvas} className="absolute inset-0 h-full w-full opacity-0" />
      {children}
    </div>
  );
}
