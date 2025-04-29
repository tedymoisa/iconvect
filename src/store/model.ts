// store.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface ModelOption {
  name: string;
  description: string;
}

interface ModelStore {
  selectedModel: ModelOption;
  setSelectedModel: (model: ModelOption) => void;
}

const defaultModel: ModelOption = {
  name: "Gemini",
  description: "Fast and accurate"
};

export const useModelStore = create<ModelStore>()(
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
