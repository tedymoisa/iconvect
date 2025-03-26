"use client";

import { useState, useEffect } from "react";

export default function Navbar() {
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
    <div
      className={`fixed left-0 top-0 w-full transition-transform duration-300 ${
        isVisible ? "translate-y-0" : "-translate-y-full"
      }`}
    >
      <div className="mx-20 my-8 rounded-lg bg-purple-600 bg-opacity-10 p-14 shadow-sm shadow-purple-600/50 ring-1 ring-purple-800/30 backdrop-blur-md">
        <h1>Navbar</h1>
      </div>
    </div>
  );
}
