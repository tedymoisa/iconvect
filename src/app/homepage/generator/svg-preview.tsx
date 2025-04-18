"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, Clipboard, Eye, Code } from "lucide-react"; // Icons
import SyntaxHighlighter from "react-syntax-highlighter";
import { atomOneDark } from "react-syntax-highlighter/dist/esm/styles/hljs";
import { useSvgStore } from "@/store/svg";

export default function SvgPreview() {
  const generatedSvg = useSvgStore((state) => state.generatedSvg);
  const [showCode, setShowCode] = useState(false);
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(generatedSvg!).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000); // Reset after 2 seconds
    });
  };

  if (generatedSvg !== null) {
    return (
      <Card className="bg-card mt-8 overflow-hidden border shadow-md">
        <div className="p-6 md:p-8">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-foreground">Generated Output</h3>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowCode(false)}
                aria-pressed={!showCode}
                className={` ${
                  !showCode ? "text-accent-foreground bg-accent" : "text-muted-foreground hover:bg-accent/80"
                }`}
              >
                <Eye className="mr-1.5 h-4 w-4" />
                Preview
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowCode(true)}
                aria-pressed={showCode}
                className={` ${
                  showCode ? "text-accent-foreground bg-accent" : "text-muted-foreground hover:bg-accent/80"
                }`}
              >
                <Code className="mr-1.5 h-4 w-4" />
                Code
              </Button>
            </div>
          </div>

          <div className="rounded-md border">
            {showCode ? (
              <div className="relative">
                <SyntaxHighlighter
                  language="xml"
                  style={atomOneDark}
                  customStyle={{
                    margin: 0,
                    padding: "1.5rem",
                    maxHeight: "400px",
                    overflow: "auto",
                    backgroundColor: "hsl(var(--muted))",
                    borderRadius: "calc(var(--radius) - 2px)"
                  }}
                  wrapLongLines={true}
                  className="text-sm"
                >
                  {generatedSvg}
                </SyntaxHighlighter>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={copyToClipboard}
                  className="text-muted-foreground absolute right-3 top-3 h-7 w-7 hover:bg-accent/80"
                  aria-label="Copy SVG code"
                >
                  {copied ? <Check className="h-4 w-4 text-green-500" /> : <Clipboard className="h-4 w-4" />}
                </Button>
              </div>
            ) : (
              <div
                className="bg-muted/50 flex min-h-[200px] items-center justify-center overflow-hidden p-6"
                dangerouslySetInnerHTML={{ __html: generatedSvg }}
                aria-label="SVG preview"
              />
            )}
          </div>
        </div>
      </Card>
    );
  }
}
