"use client";

// src/components/PreviewCard.tsx (or similar path)
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, Clipboard, Eye, Code } from "lucide-react"; // Icons
import SyntaxHighlighter from "react-syntax-highlighter";
// Choose a style (e.g., atomOneDark for dark, atomOneLight for light)
// You might need conditional logic or a theme-aware style later
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
      <Card className="mt-8 overflow-hidden border border-border bg-background shadow-md dark:border-border_dark dark:bg-background_dark">
        <div className="p-6 md:p-8">
          {/* Header with Toggle */}
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-foreground dark:text-foreground_dark">Generated Output</h3>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowCode(false)}
                aria-pressed={!showCode}
                className={` ${
                  !showCode
                    ? "bg-slate-100 dark:bg-slate-800"
                    : "text-foreground-muted hover:bg-slate-100/80 dark:hover:bg-slate-800/80"
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
                  showCode
                    ? "bg-slate-100 dark:bg-slate-800"
                    : "text-foreground-muted hover:bg-slate-100/80 dark:hover:bg-slate-800/80"
                }`}
              >
                <Code className="mr-1.5 h-4 w-4" />
                Code
              </Button>
            </div>
          </div>

          {/* Content Area (Preview or Code) */}
          <div className="rounded-md border border-border dark:border-border_dark">
            {showCode ? (
              // Code View
              <div className="relative">
                <SyntaxHighlighter
                  language="xml" // 'xml' usually works well for SVG
                  style={atomOneDark} // Choose your theme
                  customStyle={{
                    margin: 0, // Remove default margin
                    padding: "1.5rem", // Add padding
                    maxHeight: "400px", // Limit height
                    overflow: "auto", // Enable scrolling
                    backgroundColor: "hsl(var(--muted))", // Use theme color
                    borderRadius: "calc(var(--radius) - 1px)" // Match parent border
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
                  className="absolute right-3 top-3 h-7 w-7 text-foreground-muted hover:bg-background/80 dark:hover:bg-background_dark/80"
                  aria-label="Copy SVG code"
                >
                  {copied ? <Check className="h-4 w-4 text-green-500" /> : <Clipboard className="h-4 w-4" />}
                </Button>
              </div>
            ) : (
              // Preview View
              <div
                className="flex min-h-[200px] items-center justify-center overflow-hidden bg-slate-50 p-6 dark:bg-slate-900/80" // Slightly different bg for preview area
                // Render the SVG string directly
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
