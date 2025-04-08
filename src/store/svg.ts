import { create } from "zustand";

interface SvgState {
  generatedSvg: string | null;
  setGeneratedSvg: (svg: string) => void;
}

export const useSvgStore = create<SvgState>()((set) => ({
  generatedSvg: null,
  setGeneratedSvg: (svg) => set(() => ({ generatedSvg: svg }))
}));
