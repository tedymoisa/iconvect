"use client";

import { cn } from "@/lib/utils";
import { useDialogStore } from "@/store/dialog";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import Logo from "./logo";
import { Button } from "./ui/button";
import UserProfileIcon from "./user-profile-menu";

export default function Navbar() {
  const { data: session } = useSession();
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isCursorAtTop, setIsCursorAtTop] = useState(false);
  const { setIsOpen } = useDialogStore();

  useEffect(() => {
    const scrollHideThreshold = 50;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const scrollingDown = currentScrollY > lastScrollY;

      if (!isCursorAtTop) {
        if (scrollingDown && currentScrollY > scrollHideThreshold) {
          setIsVisible(false);
        } else if (!scrollingDown || currentScrollY <= scrollHideThreshold) {
          setIsVisible(true);
        }
      } else {
        setIsVisible(true);
      }

      setLastScrollY(Math.max(0, currentScrollY));
    };

    const mouseTopZone = 125;

    const handleMouseMove = (e: MouseEvent) => {
      if (e.clientY <= mouseTopZone) {
        if (!isCursorAtTop) {
          setIsCursorAtTop(true);
          setIsVisible(true);
        }
      } else {
        if (isCursorAtTop) {
          setIsCursorAtTop(false);
          if (window.scrollY > scrollHideThreshold) {
            setIsVisible(false);
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, [lastScrollY, isCursorAtTop]);

  return (
    <nav
      className={cn(
        "fixed top-0 left-0 z-50 w-full transition-transform duration-300 ease-in-out",
        isVisible ? "translate-y-0" : "-translate-y-full"
      )}
    >
      <div className="mx-auto my-3 max-w-5xl px-4">
        <div className="border-border bg-card flex h-16 items-center justify-between rounded-lg border p-4 shadow-lg shadow-purple-950/20 sm:px-6">
          <div className="flex items-center gap-x-4">
            <Logo className="text-primary h-10 w-auto shrink-0 md:h-12" />
            <span className="border-border text-muted-foreground hidden border-l pl-4 text-sm sm:block">
              Custom Icons for your projects
            </span>
          </div>

          <div className="flex items-center gap-x-4">
            {session && (
              <div className="border-border/50 bg-muted/50 hidden rounded-md border px-3 py-1 text-sm md:block">
                <span className="text-muted-foreground/80 mr-1.5">Credits:</span>
                <span className="text-primary font-medium">{session.user.credits}</span>
              </div>
            )}
            {session ? <UserProfileIcon session={session} /> : <Button onClick={() => setIsOpen(true)}>Login</Button>}
          </div>
        </div>
      </div>
    </nav>
  );
}
