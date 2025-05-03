import { Textarea } from "@/components/ui/textarea";
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";

type PromptTextareaProps = {
  prompt: string;
  setPrompt: (prompt: string) => void;
  formRef: React.RefObject<HTMLFormElement>;
};

function PromptTextarea({ prompt, setPrompt, formRef }: PromptTextareaProps) {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const [localValue, setLocalValue] = useState(prompt);
  console.log("PromptTextarea");

  useEffect(() => {
    setLocalValue(prompt);
  }, [prompt]);

  const debounce = <F extends (arg: string) => void>(func: F, wait: number): ((arg: string) => void) => {
    let timeout: ReturnType<typeof setTimeout>;
    return (arg: string) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        func(arg);
      }, wait);
    };
  };

  const debouncedSetPrompt = useMemo(() => debounce(setPrompt, 300), [setPrompt]);

  const handleChange = useCallback(
    (event: React.ChangeEvent<HTMLTextAreaElement>) => {
      setLocalValue(event.target.value);
      debouncedSetPrompt(event.target.value);
    },
    [debouncedSetPrompt]
  );

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (event.key === "Enter" && !event.shiftKey) {
        event.preventDefault();
        if (formRef.current) {
          if (typeof formRef.current.requestSubmit === "function") {
            formRef.current.requestSubmit();
          } else {
            formRef.current.submit();
          }
        }
      }
    },
    [formRef]
  );

  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      const lineHeight = parseInt(getComputedStyle(textarea).lineHeight, 10) || 24;
      const maxHeight = lineHeight * 10;
      textarea.style.height = `${Math.min(textarea.scrollHeight, maxHeight)}px`;
      textarea.style.overflowY = textarea.scrollHeight > maxHeight ? "auto" : "hidden";
    }
  }, [localValue]);

  return (
    <Textarea
      ref={textareaRef}
      placeholder="e.g., A pencil that represents editing"
      className="resize-none border-none shadow-none outline-none focus:border-none focus:ring-0 focus:outline-none focus-visible:border-none focus-visible:ring-0 focus-visible:outline-none"
      value={localValue}
      rows={1}
      aria-label="SVG generation prompt"
      style={{ maxHeight: "calc(1.5em * 10)", overflowY: "auto" }}
      onChange={handleChange}
      onKeyDown={handleKeyDown}
    />
  );
}

export default memo(PromptTextarea);
