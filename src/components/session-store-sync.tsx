import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useSessionStore } from "@/store/session";

export function SessionStoreSync() {
  const { data: session, status } = useSession();
  const setSession = useSessionStore((s) => s.setSession);
  const setStatus = useSessionStore((s) => s.setStatus);

  useEffect(() => {
    setStatus(status);
  }, [status, setStatus]);

  useEffect(() => {
    setSession(session ?? null);
  }, [session, setSession]);

  return null;
}
