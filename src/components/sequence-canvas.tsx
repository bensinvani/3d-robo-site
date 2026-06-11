"use client";
import { useCallback, useEffect, useRef, useSyncExternalStore } from "react";
import { useFrameSequence } from "@/lib/use-frame-sequence";
import { usePreload } from "@/lib/store";

const subscribeMedia = (cb: () => void) => {
  const a = matchMedia("(min-width: 768px)");
  const b = matchMedia("(prefers-reduced-motion: reduce)");
  a.addEventListener("change", cb);
  b.addEventListener("change", cb);
  return () => {
    a.removeEventListener("change", cb);
    b.removeEventListener("change", cb);
  };
};
const getMediaSnapshot = () =>
  matchMedia("(min-width: 768px)").matches &&
  !matchMedia("(prefers-reduced-motion: reduce)").matches;

interface Props {
  name: string;          // sequence folder under /sequences
  frames: number;
  poster: string;        // LCP poster; also the mobile/reduced-motion art
  heightVh?: number;     // tall-section scroll runway (sticky architecture)
  /** Scroll progress 0..1 every tick — threshold overlays + direct-DOM fades. */
  onProgress?: (p: number) => void;
  className?: string;
  children?: React.ReactNode;
}

export function SequenceCanvas({
  name, frames, poster, heightVh = 400, onProgress, className, children,
}: Props) {
  const section = useRef<HTMLElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const report = usePreload((s) => s.report);
  // full tier = desktop + motion OK; SSR snapshot is false (poster tier first paint)
  const enabled = useSyncExternalStore(subscribeMedia, getMediaSnapshot, () => false);

  useEffect(() => {
    if (!enabled) report(name, 1); // poster tier loads nothing
  }, [enabled, name, report]);

  const framePath = useCallback(
    (i: number) => `/sequences/${name}/frame_${String(i).padStart(4, "0")}.webp`,
    [name]
  );
  const onLoadProgress = useCallback((p: number) => report(name, p), [name, report]);

  const { loaded } = useFrameSequence({
    sectionRef: section,
    canvasRef: canvas,
    frameCount: frames,
    framePath,
    onProgress,
    enabled,
    onLoadProgress,
    eagerCount: Math.min(80, frames), // interactive fast; rest streams in behind
  });

  return (
    <section
      ref={section}
      style={{ height: enabled ? `${heightVh}vh` : "100vh" }}
      className={className}
    >
      <div
        className="sticky top-0 h-screen overflow-hidden"
        style={{ willChange: "transform", transform: "translateZ(0)" }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element -- intentional plain img: LCP poster under the canvas */}
        <img src={poster} alt="" className="absolute inset-0 h-full w-full object-cover" />
        <canvas
          ref={canvas}
          className={`absolute inset-0 h-full w-full transition-opacity duration-300 ${loaded ? "opacity-100" : "opacity-0"}`}
          style={{ willChange: "contents" }}
        />
        {children}
      </div>
    </section>
  );
}
