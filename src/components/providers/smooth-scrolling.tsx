"use client";
import { ReactLenis, useLenis } from "lenis/react";
import "lenis/dist/lenis.css";
import { useEffect } from "react";
import { ScrollTrigger } from "@/lib/gsap";

// ONE smoothing layer: Lenis lerp on its own RAF (autoRaf default). Canvas
// sequences read the lerped scroll directly; ScrollTrigger (traits pin,
// entrances) just gets notified.
function ScrollTriggerSync() {
  useLenis(ScrollTrigger.update);
  useEffect(() => {
    window.history.scrollRestoration = "manual"; // choreographed pages start at beat 1
    document.fonts.ready.then(() => ScrollTrigger.refresh());
  }, []);
  return null;
}

export function SmoothScrolling({ children }: { children: React.ReactNode }) {
  // Safari/iOS stutters with aggressive syncTouch; higher lerp smooths it.
  const isSafari =
    typeof navigator !== "undefined" &&
    /^((?!chrome|android).)*safari/i.test(navigator.userAgent);

  return (
    <ReactLenis
      root
      options={{
        lerp: isSafari ? 0.1 : 0.08,
        smoothWheel: true,
        syncTouch: !isSafari,
        anchors: true,
      }}
    >
      <ScrollTriggerSync />
      {children}
    </ReactLenis>
  );
}
