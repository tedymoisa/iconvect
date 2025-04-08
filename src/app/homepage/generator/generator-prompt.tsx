"use client";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useSvgGenerate } from "@/hooks/mutations/svg";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import SvgPreview from "./svg-preview";
import { MOCK_SVG } from "@/lib/constants";

export default function GeneratorPrompt() {
  const { mutate, isPending, isSuccess } = useSvgGenerate();
  const [prompt, setPrompt] = useState("");

  const handleGenerate = () => {
    if (prompt.length >= 0) {
      mutate();
    }
  };

  return (
    <>
      <div className="mb-5">
        <Textarea
          placeholder="e.g., A minimalist logo of a mountain range at sunset"
          className="min-h-[120px] resize-none rounded-md border border-border bg-background p-4 text-base shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background dark:border-slate-800 dark:bg-slate-900 dark:placeholder:text-slate-500"
          value={prompt}
          onChange={(event) => setPrompt(event.target.value)}
          aria-label="SVG generation prompt"
        />
      </div>

      <div className="flex justify-end">
        <Button
          onClick={handleGenerate}
          className="bg-gradient-to-r from-primary to-secondary text-primary-foreground transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:opacity-60"
          size="lg"
          disabled={isPending || !prompt.trim()}
        >
          {isPending ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Generating...
            </>
          ) : (
            "Generate SVG"
          )}
        </Button>
      </div>
      {isSuccess && <SvgPreview svgContent={MOCK_SVG} />}
    </>
  );
}
