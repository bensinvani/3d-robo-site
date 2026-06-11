import { create } from "zustand";

interface PreloadState {
  /** 0..1 per named sequence; loader waits on "hero" only */
  progress: Record<string, number>;
  ready: boolean;
  report: (name: string, value: number) => void;
  setReady: () => void;
}

export const usePreload = create<PreloadState>((set) => ({
  progress: {},
  ready: false,
  report: (name, value) =>
    set((s) => ({ progress: { ...s.progress, [name]: value } })),
  setReady: () => set({ ready: true }),
}));
