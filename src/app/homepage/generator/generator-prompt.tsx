"use client";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn, scrollPage } from "@/lib/utils";
import { useDialogStore } from "@/store/dialog";
import { useSvgStore } from "@/store/svg";
import { api } from "@/trpc/react";
import { Loader2, Sparkles } from "lucide-react";
import { useSession } from "next-auth/react";
import { useEffect, useRef, useState } from "react";

export default function GeneratorPrompt() {
  const { data: session } = useSession();
  const { setGeneratedSvg } = useSvgStore();
  const [prompt, setPrompt] = useState("");
  const { setIsOpen } = useDialogStore();

  const { mutate, isPending } = api.gemini.generate.useMutation();

  const handleGenerate = () => {
    if (session) {
      if (prompt.length >= 0) {
        mutate(
          { prompt },
          {
            onSuccess: (data) => {
              setGeneratedSvg(data);

              scrollPage(300, 1000);
            }
          }
        );
      }
    } else {
      setIsOpen(true);
    }
  };

  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      const lineHeight = parseInt(getComputedStyle(textarea).lineHeight, 10) || 24;
      const maxHeight = lineHeight * 10;
      textarea.style.height = `${Math.min(textarea.scrollHeight, maxHeight)}px`;
      textarea.style.overflowY = textarea.scrollHeight > maxHeight ? "auto" : "hidden";
    }
  }, [prompt]);

  return (
    <div className="flex flex-col gap-4 sm:flex-row">
      <Textarea
        ref={textareaRef}
        placeholder="e.g., A pencil that represents editing"
        className="text-l w-full resize-none border-none shadow-none outline-none focus:border-none focus:ring-0 focus:outline-none focus-visible:border-none focus-visible:ring-0 focus-visible:outline-none"
        value={prompt}
        rows={1}
        onChange={(event) => setPrompt(event.target.value)}
        aria-label="SVG generation prompt"
        style={{ maxHeight: "calc(1.5em * 10)", overflowY: "auto" }}
      />
      <Button
        onClick={handleGenerate}
        disabled={isPending || !prompt.trim()}
        size="lg"
        className={cn(
          "mx-auto w-fit animate-[bg-shine_3s_linear_infinite] rounded-lg border-[1px] bg-[length:200%_100%] tracking-wide shadow",
          "bg-[linear-gradient(110deg,var(--primary),45%,#E4E4E7,55%,var(--primary))]",
          "cursor-pointer"
        )}
      >
        {isPending ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            <span>Generating...</span>
          </>
        ) : (
          <>
            <Sparkles className="mr-2 h-5 w-5" />
            <span>Generate</span>
          </>
        )}
      </Button>
    </div>
  );
}
