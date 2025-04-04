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
      <div className="bg-background border-border dark:border-border_dark mx-auto my-8 max-w-6xl rounded-lg border p-4 shadow-lg dark:bg-slate-900 sm:p-6 md:p-8">
        <h1 className="text-primary text-xl font-semibold">Vecto</h1>
        <p className="text-foreground-muted dark:text-foreground-muted_dark text-sm">
          {session ? "Logged in" : "Logged out"}
        </p>
      </div>
    </nav>
  );
}
