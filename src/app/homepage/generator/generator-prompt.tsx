"use client";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useSvgGenerate } from "@/hooks/mutations/svg";
import { useSvgStore } from "@/store/svg";
import { Loader2, MousePointerClick } from "lucide-react";
import { useState } from "react";

export default function GeneratorPrompt() {
  const setGeneratedSvg = useSvgStore((state) => state.setGeneratedSvg);
  const [prompt, setPrompt] = useState("");

  const { mutate, isPending } = useSvgGenerate();

  const handleGenerate = () => {
    if (prompt.length >= 0) {
      mutate(prompt, {
        onSuccess: () => setGeneratedSvg(prompt)
      });
    }
  };

  return (
    <div className="flex flex-col">
      <div className="mb-5">
        <Textarea
          placeholder="e.g., A pencil that represents editing"
          className="min-h-[120px] resize-none rounded-md border border-border bg-background p-4 text-base shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background dark:border-slate-800 dark:bg-slate-900 dark:placeholder:text-slate-500"
          value={prompt}
          onChange={(event) => setPrompt(event.target.value)}
          aria-label="SVG generation prompt"
        />
      </div>

      <div className="flex justify-end">
        <Button
          onClick={handleGenerate}
          className="h-12 bg-gradient-to-r from-primary to-secondary transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:opacity-60 dark:text-primary-foreground"
          disabled={isPending || !prompt.trim()}
        >
          {isPending ? (
            <>
              <Loader2 className="mr-1 animate-spin" />
              <span>Generating...</span>
            </>
          ) : (
            <>
              <MousePointerClick className="mr-1" />
              <span className="text-base">Generate</span>
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
