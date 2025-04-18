"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, Clipboard, Eye, Code } from "lucide-react"; // Icons
import SyntaxHighlighter from "react-syntax-highlighter";
import { atomOneDark } from "react-syntax-highlighter/dist/esm/styles/hljs";
import { useSvgStore } from "@/store/svg";
import { cn } from "@/lib/utils";

export default function SvgPreview() {
  const generatedSvg = useSvgStore((state) => state.generatedSvg);
  const [showCode, setShowCode] = useState(false);
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(generatedSvg!).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  if (generatedSvg !== null) {
    return (
      <Card className="bg-card relative mt-8 overflow-hidden border border-border shadow-lg shadow-purple-950/20">
        <div className="absolute left-0 top-0 h-1 w-full bg-primary"></div>

        <div className="px-6 pb-6 pt-8">
          <div className="mb-5 flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
            <h3 className="text-lg font-semibold text-foreground">Generated Output</h3>
            <div className="flex flex-shrink-0 items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowCode(false)}
                aria-pressed={!showCode}
                className={cn(
                  "text-muted-foreground hover:bg-accent/80",
                  !showCode && "text-accent-foreground bg-accent"
                )}
              >
                <Eye className="mr-1.5 h-4 w-4" />
                Preview
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowCode(true)}
                aria-pressed={showCode}
                className={cn(
                  "text-muted-foreground hover:bg-accent/80",
                  showCode && "text-accent-foreground bg-accent"
                )}
              >
                <Code className="mr-1.5 h-4 w-4" />
                Code
              </Button>
            </div>
          </div>

          <div className="overflow-hidden rounded-md border border-border">
            <div className="grid [grid-template-areas:'content']">
              <div
                className={cn(
                  "relative transition-opacity duration-200 [grid-area:content]",
                  !showCode && "pointer-events-none opacity-0"
                )}
                aria-hidden={!showCode}
              >
                <SyntaxHighlighter
                  language="xml"
                  style={atomOneDark}
                  customStyle={{
                    margin: 0,
                    padding: "1.25rem",
                    maxHeight: "400px",
                    overflow: "auto",
                    backgroundColor: "hsl(var(--muted) / 0.5)",
                    minHeight: "200px"
                  }}
                  wrapLongLines={true}
                  className="text-sm"
                >
                  {generatedSvg || ""}
                </SyntaxHighlighter>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={copyToClipboard}
                  className={cn(
                    "text-muted-foreground absolute right-2 top-2 h-8 w-8 hover:bg-accent/80",
                    !showCode && "pointer-events-none"
                  )}
                  aria-label="Copy SVG code"
                  tabIndex={!showCode ? -1 : 0}
                >
                  {copied ? <Check className="h-4 w-4 text-green-500" /> : <Clipboard className="h-4 w-4" />}
                </Button>
              </div>

              <div
                className={cn(
                  "bg-muted/30 flex min-h-[200px] items-center justify-center overflow-hidden p-6 transition-opacity duration-200 [grid-area:content]",
                  showCode && "pointer-events-none opacity-0"
                )}
                dangerouslySetInnerHTML={{ __html: generatedSvg || "" }}
                aria-label="SVG preview"
                aria-hidden={showCode}
              />
            </div>
          </div>
        </div>
      </Card>
    );
  }
}
