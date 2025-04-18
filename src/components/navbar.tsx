"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import Logo from "./logo";
import { cn } from "@/lib/utils";

export default function Navbar() {
  const { data: session } = useSession();
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isCursorAtTop, setIsCursorAtTop] = useState(false);

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
        "fixed left-0 top-0 z-50 w-full transition-transform duration-300 ease-in-out",
        isVisible ? "translate-y-0" : "-translate-y-full"
      )}
    >
      <div className="mx-auto my-3 max-w-5xl px-4">
        <div className="bg-card flex h-16 items-center justify-between rounded-lg border border-border p-4 shadow-lg shadow-purple-950/20 sm:px-6">
          <div className="flex items-center gap-x-4">
            <Logo className="h-10 w-auto shrink-0 text-primary md:h-12" />
            <span className="text-muted-foreground hidden border-l border-border pl-4 text-sm sm:block">
              {session ? "Logged in" : "Logged out"}
            </span>
          </div>

          <div className="flex items-center gap-x-4">
            {session && (
              <div className="bg-muted/50 hidden rounded-md border border-border/50 px-3 py-1 text-sm md:block">
                <span className="text-muted-foreground/80 mr-1.5">Credits:</span>
                <span className="font-medium text-primary">{session.user.credits}</span>
              </div>
            )}

            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
              <span className="text-xs font-medium text-primary">U</span>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
