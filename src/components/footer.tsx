"use client";

import React from "react";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="mx-auto flex h-16 max-w-5xl items-center justify-center">
      <p className="text-muted-foreground text-sm">© {year} IconVect. All rights reserved.</p>
    </footer>
  );
}
