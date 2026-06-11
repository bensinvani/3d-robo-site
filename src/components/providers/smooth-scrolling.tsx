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
      options={{
        autoRaf: false,
        // duration+easing mode (NOT lerp): fixed-curve glide per input that
        // accumulates across wheel notches — lerp mode restarts its decay every
        // notch and reads pulsy/snappy on stepped mouse wheels
        duration: 1.35,
        easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // easeOutExpo
        wheelMultiplier: 0.9,
        syncTouch: true,
        anchors: true,
      }}
    >
      {children}
    </ReactLenis>
  );
}
