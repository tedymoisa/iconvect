import { Button } from "@/components/ui/button";
import { Loader2, Sparkles } from "lucide-react";
import { memo } from "react";

type GenerateButtonProps = {
  isPending: boolean;
  prompt: string;
};

const GenerateButton = ({ isPending, prompt }: GenerateButtonProps) => {
  return (
    <Button type="submit" disabled={isPending || !prompt.trim()} size="lg" className="mx-auto sm:mx-0">
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
