import { Card } from "@/components/ui/card";
import { Sparkles } from "lucide-react";
import GeneratorPrompt from "./generator/generator-prompt";

export default function SvgGenerator() {
  return (
    <Card className="overflow-hidden border border-border bg-background shadow-md dark:border-border_dark dark:bg-background_dark">
      <div className="p-6 md:p-8">
        <div className="mb-4 flex items-center gap-3">
          <Sparkles className="h-6 w-6 shrink-0 text-primary dark:text-secondary" />
          <h2 className="text-xl font-semibold text-foreground dark:text-foreground_dark md:text-2xl">
            What can I generate for you?
          </h2>
        </div>
        <p className="mb-6 text-base text-foreground-muted dark:text-foreground-muted_dark">
          Describe the vector graphic you want to generate using natural language.
        </p>

        <GeneratorPrompt />
      </div>
    </Card>
  );
}
