"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSvgStore } from "@/store/svg";
import { Check, Clipboard, Code, Eye } from "lucide-react";
import { useState } from "react";
import SyntaxHighlighter from "react-syntax-highlighter";
import { atomOneDark } from "react-syntax-highlighter/dist/esm/styles/hljs";

export default function SvgPreview() {
  const { generatedSvg } = useSvgStore();

  if (generatedSvg !== null) {
    return (
      <Card className="border-border bg-card relative mt-8 overflow-hidden border shadow-lg shadow-purple-950/20">
        <div className="bg-primary absolute top-0 left-0 h-1 w-full"></div>

        <Tabs defaultValue="preview" className="px-6 pt-8 pb-6 md:px-8 md:pt-10 md:pb-8">
          <div className="mb-6 flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
            <h3 className="text-foreground text-lg font-semibold md:text-xl">Generated Output</h3>
            <TabsList>
              <TabsTrigger value="preview">
                <Eye className="mr-1.5 size-4" />
                <span>Preview</span>
              </TabsTrigger>
              <TabsTrigger value="code">
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
      </Card>
    );
  }
}

function PreviewTab({ svg }: { svg: string }) {
  return <div className="size-48" dangerouslySetInnerHTML={{ __html: svg }} aria-label="SVG preview" />;
}

function CodeTab({ svg }: { svg: string }) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(svg).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="border-border relative overflow-hidden rounded-lg border">
      <SyntaxHighlighter
        language="xml"
        style={atomOneDark}
        customStyle={{
          fontSize: "13px",
          maxHeight: "18rem",
          background: "none",
          padding: "3rem 0.5rem 0.5rem",
          overflow: "auto"
        }}
      >
        {svg}
      </SyntaxHighlighter>
      <Button
        variant="ghost"
        size="icon"
        onClick={copyToClipboard}
        className="text-muted-foreground/70 hover:text-muted-foreground absolute top-2 right-5 size-8 transition-colors"
        aria-label="Copy SVG code"
      >
        {copied ? <Check className="size-4 text-green-500" /> : <Clipboard className="size-4" />}
      </Button>
    </div>
  );
}
