import type { Session } from "next-auth";
import { create } from "zustand";

type SessionStatus = "loading" | "authenticated" | "unauthenticated";

interface SessionStore {
  session: Session | null;
  status: SessionStatus;
  setSession: (session: Session | null) => void;
  setStatus: (status: SessionStatus) => void;
}

export const useSessionStore = create<SessionStore>((set) => ({
  status: "loading",
  session: null,
  setSession: (session) => set({ session }),
  setStatus: (status) => set({ status })
}));
