import { AI_MODELS, type ICONVECT_AI_GENERATORS, type ICONVECT_AI_MODELS } from "@/lib/constants";
import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface AiModelOption {
  name: string;
  description: string;
  model: ICONVECT_AI_MODELS;
  generator: ICONVECT_AI_GENERATORS;
  cost: number;
}

interface AiModelStore {
  selectedModel: AiModelOption;
  setSelectedModel: (model: AiModelOption) => void;
}

const defaultModel: AiModelOption = AI_MODELS.SVG_TURBO;

export const useModelStore = create<AiModelStore>()(
  persist(
    (set) => ({
      selectedModel: defaultModel,
      setSelectedModel: (model) => set({ selectedModel: model })
    }),
    {
      name: "selected-model"
    }
  )
);
