import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Loader2, Sparkles } from "lucide-react";
import { memo } from "react";

type GenerateButtonProps = {
  isPending: boolean;
  prompt: string;
};

const GenerateButton = ({ isPending, prompt }: GenerateButtonProps) => {
  return (
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
  );
};

export default memo(GenerateButton);
