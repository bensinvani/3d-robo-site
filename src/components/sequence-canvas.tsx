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

// Decoded bitmaps cost ~6 MB each at 1600px — decoding a whole 200-frame
// sequence is ~1.2 GB. Keep compressed blobs (~50 KB each), decode a sliding
// window around the playhead, evict behind it.
const AHEAD = 24, BEHIND = 12, KEEP = 48;

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
          const blobs: (Blob | null)[] = [];
          const bitmaps = new Map<number, ImageBitmap>();
          const decoding = new Set<number>();
          const state = { frame: 0 };
          let raf = 0;

          // exact frame if decoded, else nearest ready — fast scrolls show a
          // near frame for a tick instead of a blank canvas
          const nearestReady = (t: number) => {
            if (bitmaps.has(t)) return t;
            for (let d = 1; d < frames; d++) {
              if (bitmaps.has(t - d)) return t - d;
              if (bitmaps.has(t + d)) return t + d;
            }
            return -1;
          };

          const draw = () => {
            const idx = nearestReady(Math.round(state.frame));
            if (idx < 0) return;
            const img = bitmaps.get(idx)!;
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

          const decode = (i: number) => {
            if (i < 0 || i >= frames || bitmaps.has(i) || decoding.has(i) || !blobs[i]) return;
            decoding.add(i);
            createImageBitmap(blobs[i]!)
              .then((b) => { bitmaps.set(i, b); decoding.delete(i); scheduleDraw(); })
              .catch(() => decoding.delete(i));
          };

          const ensureWindow = () => {
            const f = Math.round(state.frame);
            for (let i = f - BEHIND; i <= f + AHEAD; i++) decode(i);
            for (const [i, b] of bitmaps) {
              if (Math.abs(i - f) > KEEP) { b.close(); bitmaps.delete(i); }
            }
          };

          // preload COMPRESSED blobs only — full sequence ≈ a dozen MB, not GBs
          let loaded = 0;
          Promise.all(
            Array.from({ length: frames }, (_, i) =>
              fetch(src(name, i))
                .then((r) => (r.ok ? r.blob() : null))
                .catch(() => null)
                .then((b) => { blobs[i] = b; report(name, ++loaded / frames); })
            )
          ).then(ensureWindow);

          const setSize = () => {
            const dpr = Math.min(devicePixelRatio, 1.5); // 2x dpr doubles GPU cost for invisible gain here
            el.width = el.clientWidth * dpr;
            el.height = el.clientHeight * dpr;
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
              anticipatePin: 1, // kills the 1-frame snap when the pin engages
              scrub: 1.2,       // cinematic inertia; 0.5 reads steppy on wheel mice
              // a sequence you've scrolled past shouldn't keep ~200 MB decoded
              onLeave: () => { bitmaps.forEach((b) => b.close()); bitmaps.clear(); },
              onLeaveBack: () => { bitmaps.forEach((b) => b.close()); bitmaps.clear(); },
            },
          });
          tl.to(state, {
            frame: frames - 1,
            ease: "none",
            duration: 1,
            onUpdate: () => { ensureWindow(); scheduleDraw(); },
          }, 0);
          buildTimeline?.(tl);

          return () => {
            removeEventListener("resize", setSize);
            cancelAnimationFrame(raf);
            bitmaps.forEach((b) => b.close());
            bitmaps.clear();
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
