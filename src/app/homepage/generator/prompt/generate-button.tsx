import { Button } from "@/components/ui/button";
import { Loader2, Sparkles } from "lucide-react";
import { memo } from "react";

const GenerateButton = memo(({ isPending, prompt }: { isPending: boolean; prompt: string }) => {
  console.log("GenerateButton");

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
});

export default GenerateButton;
