"use client";

import { useEffect, useRef, useState, type RefObject } from "react";

type Options = {
  sectionRef: RefObject<HTMLElement | null>;
  canvasRef: RefObject<HTMLCanvasElement | null>;
  frameCount: number;
  framePath: (i: number) => string;
  /** Called every render tick with clamped scroll progress 0..1 (for text overlays). */
  onProgress?: (progress: number) => void;
  /** Gate loading entirely (mobile/reduced-motion poster tiers). Defaults true. */
  enabled?: boolean;
  /** Report eager-batch load progress 0..1 (drives the site loader). */
  onLoadProgress?: (p: number) => void;
  /** Become interactive after this many frames; the rest stream in the background. */
  eagerCount?: number;
};

/**
 * Sticky-canvas frame-sequence scrubber (the proven architecture):
 * tall section + sticky viewport + native scroll math. The frame index is a
 * DIRECT function of the Lenis-lerped scroll position — Lenis is the ONLY
 * smoothing layer, which is what gives the seamless wheel feel. Frames are
 * HTMLImageElements so the browser manages decode caching (no GB-scale
 * bitmap retention). Draws only when the frame index changes.
 */
export function useFrameSequence({
  sectionRef,
  canvasRef,
  frameCount,
  framePath,
  onProgress,
  enabled = true,
  onLoadProgress,
  eagerCount,
}: Options) {
  const framesRef = useRef<HTMLImageElement[]>([]);
  const tickingRef = useRef(false);
  const currentFrameRef = useRef(-1);
  const onProgressRef = useRef(onProgress);
  const onLoadProgressRef = useRef(onLoadProgress);
  useEffect(() => {
    onProgressRef.current = onProgress;
    onLoadProgressRef.current = onLoadProgress;
  });

  const [loaded, setLoaded] = useState(false);

  // Preload — eager batch becomes interactive; the rest streams in behind it.
  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;
    const imgs: HTMLImageElement[] = new Array(frameCount);
    const eager = Math.min(eagerCount ?? frameCount, frameCount);

    const load = (from: number, to: number, onEach?: () => void) => {
      for (let i = from; i <= to; i++) {
        const img = new Image();
        img.src = framePath(i);
        img.onload = () => {
          if (!cancelled) onEach?.();
        };
        imgs[i - 1] = img;
      }
    };

    let eagerLoaded = 0;
    load(1, eager, () => {
      eagerLoaded++;
      onLoadProgressRef.current?.(eagerLoaded / eager);
      if (eagerLoaded === eager) {
        setLoaded(true);
        if (eager < frameCount) load(eager + 1, frameCount);
      }
    });

    framesRef.current = imgs;
    return () => {
      cancelled = true;
    };
  }, [enabled, frameCount, framePath, eagerCount]);

  // Scrub — RAF-ticking scroll handler, direct DOM, no React state on scroll.
  useEffect(() => {
    if (!loaded) return;
    const canvas = canvasRef.current;
    const section = sectionRef.current;
    if (!canvas || !section) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resizeCanvas = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = window.innerWidth + "px";
      canvas.style.height = window.innerHeight + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const drawFrame = (index: number) => {
      const img = framesRef.current[index];
      if (!img?.complete) return;
      const cw = window.innerWidth;
      const ch = window.innerHeight;
      const imgRatio = img.naturalWidth / img.naturalHeight;
      const canvasRatio = cw / ch;
      let drawW: number, drawH: number;
      if (canvasRatio > imgRatio) {
        drawW = cw;
        drawH = cw / imgRatio;
      } else {
        drawH = ch;
        drawW = ch * imgRatio;
      }
      if (window.innerWidth <= 768) {
        drawW *= 1.3;
        drawH *= 1.3;
      }
      ctx.clearRect(0, 0, cw, ch);
      ctx.drawImage(img, (cw - drawW) / 2, (ch - drawH) / 2, drawW, drawH);
    };

    const render = () => {
      const rect = section.getBoundingClientRect();
      const scrollableHeight = section.offsetHeight - window.innerHeight;
      const progress = Math.min(1, Math.max(0, -rect.top / scrollableHeight));
      const frameIndex = Math.min(frameCount - 1, Math.floor(progress * frameCount));
      if (frameIndex !== currentFrameRef.current) {
        currentFrameRef.current = frameIndex;
        drawFrame(frameIndex);
      }
      onProgressRef.current?.(progress);
    };

    const handleScroll = () => {
      if (tickingRef.current) return;
      tickingRef.current = true;
      requestAnimationFrame(() => {
        render();
        tickingRef.current = false;
      });
    };
    const handleResize = () => {
      resizeCanvas();
      currentFrameRef.current = -1;
      render();
    };

    resizeCanvas();
    render();
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleResize);
    };
  }, [loaded, canvasRef, sectionRef, frameCount]);

  return { loaded };
}
