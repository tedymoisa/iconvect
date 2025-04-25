import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles } from "lucide-react";
import GeneratorPrompt from "./generator/generator-prompt";

export default function SvgGenerator() {
  return (
    <Card className="relative overflow-hidden border border-border bg-card shadow-lg shadow-purple-950/20">
      <div className="absolute left-0 top-0 h-1 w-full bg-primary"></div>

      <CardHeader className="relative flex flex-row items-start gap-x-4 space-y-0 border-b border-border pb-6 pt-8">
        <div className="mt-1 flex-shrink-0 rounded-full bg-primary/10 p-2">
          <Sparkles className="h-5 w-5 text-purple-400" />
        </div>
        <div className="flex-grow">
          <CardTitle className="bg-gradient-to-br from-purple-400 to-purple-600 bg-clip-text text-xl font-semibold tracking-tight text-transparent md:text-2xl">
            What can I generate for you?
          </CardTitle>
          <p className="mt-1 text-base text-muted-foreground">
            Describe the vector graphic you want to generate using natural language.
          </p>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <GeneratorPrompt />
      </CardContent>
    </Card>
  );
}
