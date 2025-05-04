"use client";

import { AI_MODELS } from "@/lib/constants";
import { scrollPage } from "@/lib/utils";
import { useDialogStore } from "@/store/dialog";
import { useSessionStore } from "@/store/session";
import { useSvgStore } from "@/store/svg";
import { api } from "@/trpc/react";
import { useSession } from "next-auth/react";
import type { FormEvent } from "react";
import { useCallback, useRef, useState } from "react";
import GenerateButton from "./prompt/generate-button";
import GenerationPending from "./prompt/generation-pending";
import ModelSelector from "./prompt/model-selector";
import PromptTextarea from "./prompt/prompt-textarea";

export default function Prompt() {
  console.log("Prompt");

  const { update } = useSession();
  const [prompt, setPrompt] = useState("");

  const session = useSessionStore((s) => s.session);
  const setGeneratedSvg = useSvgStore((s) => s.setGeneratedSvg);
  const setIsOpen = useDialogStore((s) => s.setIsOpen);

  const formRef = useRef<HTMLFormElement>(null);

  const { mutate, isPending } = api.svg.generate.useMutation({
    onSuccess: async () => {
      await update();
    }
  });

  const handleGenerate = useCallback(
    (event: FormEvent) => {
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
    },
    [session, prompt, mutate, setGeneratedSvg, setIsOpen]
  );

  if (isPending) {
    return <GenerationPending />;
  }

  return (
    <form ref={formRef} onSubmit={handleGenerate}>
      <PromptTextarea prompt={prompt} setPrompt={setPrompt} formRef={formRef} />
      <div className="mt-3 flex flex-col-reverse gap-2 sm:flex-row sm:items-end sm:justify-between">
        <ModelSelector isPending={isPending} />
        <GenerateButton isPending={isPending} prompt={prompt} />
      </div>
    </form>
  );
}
