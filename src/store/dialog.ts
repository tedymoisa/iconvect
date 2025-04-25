import { create } from "zustand";

interface DialogStore {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

export const useDialogStore = create<DialogStore>((set) => ({
  isOpen: false,
  setIsOpen: (isOpen) => set({ isOpen })
}));
