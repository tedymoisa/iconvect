"use client";

import { TextLoader } from "@/components/loading";
import React from "react";

export default function SvgLoading() {
  return (
    <TextLoader
      messages={[
        "Please wait a few seconds",
        "Your icon is being generated",
        "Almost there, preparing your SVG",
        "Just a moment, finalizing your icon",
        "Hang tight, your SVG is almost ready"
      ]}
      direction="horizontal"
    />
  );
}
