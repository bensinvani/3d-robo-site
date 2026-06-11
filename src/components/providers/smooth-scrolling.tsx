"use client";
import { ReactLenis, type LenisRef } from "lenis/react";
import "lenis/dist/lenis.css";
import { useEffect, useRef } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";

export function SmoothScrolling({ children }: { children: React.ReactNode }) {
  const lenisRef = useRef<LenisRef>(null);

  useEffect(() => {
    // a scroll-choreographed page must start at its first beat
    window.history.scrollRestoration = "manual";
    const update = (time: number) => lenisRef.current?.lenis?.raf(time * 1000);
    gsap.ticker.add(update);
    gsap.ticker.lagSmoothing(0);
    lenisRef.current?.lenis?.on("scroll", ScrollTrigger.update);
    document.fonts.ready.then(() => ScrollTrigger.refresh());
    return () => gsap.ticker.remove(update);
  }, []);

  return (
    <ReactLenis
      root
      ref={lenisRef}
      options={{ autoRaf: false, lerp: 0.06, duration: 1.4, syncTouch: true, anchors: true }}
    >
      {children}
    </ReactLenis>
  );
}
