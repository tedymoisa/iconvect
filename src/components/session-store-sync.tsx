import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useSessionStore } from "@/store/session";

export function SessionStoreSync() {
  const { data: session } = useSession();
  const setSession = useSessionStore((s) => s.setSession);

  useEffect(() => {
    setSession(session ?? null);
  }, [session, setSession]);

  return null;
}
