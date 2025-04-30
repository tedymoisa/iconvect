"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Textarea } from "@/components/ui/textarea";
import { AI_MODELS } from "@/lib/constants";
import { cn, scrollPage } from "@/lib/utils";
import { useDialogStore } from "@/store/dialog";
import { useModelStore } from "@/store/model";
import { useSvgStore } from "@/store/svg";
import { api } from "@/trpc/react";
import { ChevronDown, Loader2, Sparkles, X } from "lucide-react";
import { useSession } from "next-auth/react";
import type { FormEvent } from "react";
import { useEffect, useRef, useState } from "react";
import SvgLoading from "./svg-loading";

export default function GeneratorPrompt() {
  console.log("generator prompt");
  const { data: session, update } = useSession();
  const [prompt, setPrompt] = useState("");

  const { setGeneratedSvg } = useSvgStore();
  const { setIsOpen } = useDialogStore();

  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const { mutate, isPending } = api.svg.generate.useMutation({
    onSuccess: async () => {
      await update();
    }
  });

  const handleGenerate = (event: FormEvent) => {
    event.preventDefault();

    if (session) {
      if (prompt.length > 0) {
        mutate(
          { prompt, model: AI_MODELS.SVG_TURBO },
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

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();

      if (formRef.current) {
        if (typeof formRef.current.requestSubmit === "function") {
          formRef.current.requestSubmit();
        } else {
          formRef.current.submit();
        }
      } else {
        console.warn("Could not find form element ref to submit.");
      }
    }
  };

  useEffect(() => {
    textareaRef.current?.focus();

    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      const lineHeight = parseInt(getComputedStyle(textarea).lineHeight, 10) || 24;
      const maxHeight = lineHeight * 10;
      textarea.style.height = `${Math.min(textarea.scrollHeight, maxHeight)}px`;
      textarea.style.overflowY = textarea.scrollHeight > maxHeight ? "auto" : "hidden";
    }
  }, [prompt]);

  if (isPending) {
    return (
      <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
        <div className="w-full">
          <SvgLoading />
        </div>
        <div className="mx-auto sm:mx-0">
          <Button variant="ghost" size="sm" onClick={() => window.location.reload()}>
            <X className="h-4 w-4" />
            Cancel
          </Button>
        </div>
      </div>
    );
  } else {
    return (
      <form ref={formRef} onSubmit={handleGenerate}>
        <Textarea
          ref={textareaRef}
          placeholder="e.g., A pencil that represents editing"
          className="resize-none border-none shadow-none outline-none focus:border-none focus:ring-0 focus:outline-none focus-visible:border-none focus-visible:ring-0 focus-visible:outline-none"
          value={prompt}
          rows={1}
          aria-label="SVG generation prompt"
          style={{ maxHeight: "calc(1.5em * 10)", overflowY: "auto" }}
          onChange={(event) => setPrompt(event.target.value)}
          onKeyDown={handleKeyDown}
        />
        <div className="mt-3 flex flex-col-reverse gap-2 sm:flex-row sm:items-end sm:justify-between">
          <ModelSelector isPending={isPending} />
          <Button
            type="submit"
            disabled={isPending || !prompt.trim()}
            size="lg"
            className={cn(
              "mx-auto sm:mx-0",
              "w-fit animate-[bg-shine_3s_linear_infinite] rounded-lg border-[1px] bg-[length:200%_100%] tracking-wide shadow",
              "bg-[linear-gradient(110deg,var(--primary),45%,#E4E4E7,55%,var(--primary))]"
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
      </form>
    );
  }
}

const ModelSelector = ({ isPending }: { isPending: boolean }) => {
  const { selectedModel, setSelectedModel } = useModelStore();

  return (
    <div className="mx-auto flex items-center gap-2 sm:mx-0">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="text-muted-foreground focus:border-none focus:ring-0 focus:outline-none focus-visible:ring-0 focus-visible:outline-none"
            size={"sm"}
            disabled={isPending}
          >
            {selectedModel.name} <ChevronDown className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuLabel>Svg Generator Models</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {Object.entries(AI_MODELS).map(([model, option]) => (
            <DropdownMenuItem
              key={model}
              onClick={() => setSelectedModel(option)}
              className={
                selectedModel.name === option.name ? "text-primary cursor-pointer font-bold" : "cursor-pointer"
              }
            >
              <div>
                <div>{option.name}</div>
                <div className="text-muted-foreground text-xs">{option.description}</div>
              </div>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
      <p className="text-muted-foreground text-sm">{selectedModel.description}</p>
    </div>
  );
};
