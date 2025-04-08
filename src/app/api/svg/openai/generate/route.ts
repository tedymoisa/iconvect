import { type ApiResponse } from "@/lib/types/api-response";
import { formatZodError, readBody, validate } from "@/lib/utils";
import { auth } from "@/server/auth";
import { openaiClient } from "@/server/openai";
import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const defaultModel = "gpt-4o-mini";
const systemPrompt =
  "You are an SVG generator for web apps. Output SVGs with viewBox='0 0 24 24', stroke='black', fill='none', and stroke-width='2'. Optimize for web development and ensure compatibility(always add xmlns='http://www.w3.org/2000/svg'). Respond with only the SVG code (from <svg> to </svg>) and no extra text. Enclose the SVG in ```.";

const svgGenerateSchema = z.object({
  prompt: z.string().max(255)
});
export type SvgGenerate = z.infer<typeof svgGenerateSchema>;

export async function POST(req: NextRequest) {
  const authSession = await auth();
  if (!authSession) return NextResponse.json<ApiResponse<string>>({ result: "Not authenticated" }, { status: 401 });

  const body = await readBody<SvgGenerate>(req);
  const { error, data } = validate(body, svgGenerateSchema);
  if (error) {
    return NextResponse.json<ApiResponse<string>>(
      {
        result: "Validation error",
        errors: formatZodError(error)
      },
      { status: 400 }
    );
  }

  const completion = await openaiClient.chat.completions.create({
    model: process.env.OPENAI_MODEL ?? defaultModel,
    messages: [
      {
        role: "system",
        content: systemPrompt
      },
      {
        role: "user",
        content: data.prompt
      }
    ]
  });

  if (completion.choices.length === 0 || !completion.choices[0]?.message.content) {
    return NextResponse.json<ApiResponse<string>>({ result: "Error generating svg" }, { status: 422 });
  }

  const svg = completion.choices[0].message.content;

  return NextResponse.json<ApiResponse<string>>({ result: svg }, { status: 200 });
}
