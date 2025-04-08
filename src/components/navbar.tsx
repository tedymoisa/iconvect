"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

export default function Navbar() {
  const { data: session } = useSession();
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isCursorAtTop, setIsCursorAtTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY > lastScrollY && currentScrollY > 50 && !isCursorAtTop) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }

      setLastScrollY(currentScrollY);
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (e.clientY <= 200) {
        setIsCursorAtTop(true);
        setIsVisible(true);
      } else {
        setIsCursorAtTop(false);

        if (window.scrollY > 250) {
          setIsVisible(false);
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, [lastScrollY, isCursorAtTop]);

  return (
    <nav
      className={`fixed left-0 top-0 z-50 w-full transition-transform duration-300 ease-in-out ${
        isVisible ? "translate-y-0" : "-translate-y-full"
      }`}
    >
      <div className="mx-auto my-8 max-w-6xl rounded-lg border border-border bg-background p-4 shadow-lg dark:border-border_dark dark:bg-slate-900 sm:p-6 md:p-8">
        <h1 className="text-xl font-semibold text-primary">Vecto</h1>
        <p className="text-sm text-foreground-muted dark:text-foreground-muted_dark">
          {session ? "Logged in" : "Logged out"}
        </p>
        <p>Credits: {session?.user.credits}</p>
      </div>
    </nav>
  );
}
