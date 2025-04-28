"use client";

import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSvgStore } from "@/store/svg";
import { Check, Code, Copy, Eye } from "lucide-react";
import { useTheme } from "next-themes";
import { useState } from "react";
import SyntaxHighlighter from "react-syntax-highlighter";
import { atomOneLight, gradientDark } from "react-syntax-highlighter/dist/esm/styles/hljs";

export default function SvgPreview() {
  const { generatedSvg } = useSvgStore();

  if (generatedSvg !== null) {
    return (
      <div className="mt-10">
        <Tabs defaultValue="preview">
          <div className="mb-6 flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
            <h3 className="text-foreground text-lg font-semibold md:text-xl">Generated Output</h3>
            <TabsList>
              <TabsTrigger value="preview" className="cursor-pointer">
                <Eye className="mr-1.5 size-4" />
                <span>Preview</span>
              </TabsTrigger>
              <TabsTrigger value="code" className="cursor-pointer">
                <Code className="mr-1.5 size-4" />
                <span>Code</span>
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="preview" className="flex items-center justify-center">
            <PreviewTab svg={generatedSvg} />
          </TabsContent>
          <TabsContent value="code">
            <CodeTab svg={generatedSvg} />
          </TabsContent>
        </Tabs>
      </div>
    );
  }
}

function PreviewTab({ svg }: { svg: string }) {
  return (
    <div className="w-full overflow-hidden rounded-xs border">
      <div className="size-full bg-[url(/svg/grid-dark.svg)] bg-[length:50px_50px] bg-repeat dark:bg-[url(/svg/grid-light.svg)]">
        <div className="flex size-full justify-center bg-gradient-to-tr from-zinc-50 via-zinc-50/[.85] to-zinc-50 dark:from-zinc-950 dark:via-zinc-950/[.85] dark:to-zinc-950">
          <div className="size-48" dangerouslySetInnerHTML={{ __html: svg }} aria-label="SVG preview" />
        </div>
      </div>
    </div>
  );
}

function CodeTab({ svg }: { svg: string }) {
  const { theme } = useTheme();
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(svg).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1000);
    });
  };

  return (
    <div className="rounded-xs border">
      <div className="bg-accent flex items-center justify-between px-2">
        <code>svg</code>
        <Button
          variant="ghost"
          size="icon"
          onClick={copyToClipboard}
          className="text-muted-foreground/70 hover:text-muted-foreground top-2 right-5 size-8 transition-colors"
          aria-label="Copy SVG code"
        >
          {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
        </Button>
      </div>
      <div className="overflow-hidde relative">
        <SyntaxHighlighter
          language="xml"
          style={theme === "light" ? atomOneLight : gradientDark}
          customStyle={{
            fontSize: "15px",
            maxHeight: "18rem",
            padding: "1rem",
            overflow: "auto",
            background: "var(--card)"
          }}
        >
          {svg}
        </SyntaxHighlighter>
      </div>
    </div>
  );
}
