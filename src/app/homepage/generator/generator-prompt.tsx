"use client";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { scrollPage } from "@/lib/utils";
import { useDialogStore } from "@/store/dialog";
import { useSvgStore } from "@/store/svg";
import { api } from "@/trpc/react";
import { Loader2, MousePointerClick } from "lucide-react";
import { useSession } from "next-auth/react";
import { useState } from "react";

export default function GeneratorPrompt() {
  const { data: session } = useSession();
  const { setGeneratedSvg } = useSvgStore();
  const [prompt, setPrompt] = useState("");
  const { setIsOpen } = useDialogStore();

  const { mutate, isPending } = api.post.generate.useMutation();

  const handleGenerate = () => {
    if (session) {
      if (prompt.length >= 0) {
        mutate(undefined, {
          onSuccess: (data) => {
            setGeneratedSvg(data.svg);

            scrollPage(300, 1000);
          }
        });
      }
    } else {
      setIsOpen(true);
    }
  };

  return (
    <div className="flex flex-col">
      <div className="mb-5">
        <Textarea
          placeholder="e.g., A pencil that represents editing"
          className="border-border focus-visible:border-primary focus-visible:ring-ring/40 min-h-[120px] resize-none text-base transition-colors duration-200 ease-in-out focus-visible:ring-2 focus-visible:outline-hidden" // Keep ring but make border primary on focus
          value={prompt}
          onChange={(event) => setPrompt(event.target.value)}
          aria-label="SVG generation prompt"
        />
      </div>
      <div className="flex justify-end">
        <Button
          onClick={handleGenerate}
          className="h-12 px-6 text-base"
          disabled={isPending || !prompt.trim()}
          size="lg"
        >
          {isPending ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              <span>Generating...</span>
            </>
          ) : (
            <>
              <MousePointerClick className="mr-2 h-5 w-5" />
              <span>Generate</span>
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
