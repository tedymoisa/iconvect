"use client";

import React from "react";
import IubendaLinks from "./iubenda-links";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="mx-auto flex h-16 max-w-5xl items-center justify-center gap-4 px-4">
      <p className="text-muted-foreground text-xs">© {year} IconVect. All rights reserved.</p>
      <IubendaLinks />
    </footer>
  );
}
