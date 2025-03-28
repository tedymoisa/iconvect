import { ApiResponse } from "@/lib/types/api-response";
import { extractAndSanitizeSvg, formatZodError, readBody, sanitizeSvg, validate } from "@/lib/utils";
import { auth } from "@/server/auth";
import { geminiClient } from "@/server/gemini";
import { HarmBlockThreshold, HarmCategory } from "@google/generative-ai";
import { NextResponse } from "next/server";
import { NextAuthRequest } from "node_modules/next-auth/lib";
import { z } from "zod";

const defaultModel = "gemini-2.5-pro-exp-03-25";
const systemInstruction = `
Act as an SVG code generator.
Strict rules:
1. Root <svg> MUST have: xmlns='http://www.w3.org/2000/svg' and viewBox='0 0 24 24'.
2. Default style for elements: stroke='black', fill='none', stroke-width='1'. Apply unless prompt specifies otherwise.
3. Output ONLY raw SVG code, starting with <svg> and ending with </svg>. Keep the svg simple but efficient.
4. NO other text, explanations, or comments outside the code block.
`;
const safetySettings = [
  { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE }
];
const generationConfig = {
  temperature: 0.4,
  topK: 32,
  topP: 1,
  maxOutputTokens: 8192,
  responseMimeType: "text/plain"
};

const svgGenerateSchema = z.object({
  prompt: z.string().max(255)
});
export type SvgGenerate = z.infer<typeof svgGenerateSchema>;

export const POST = auth(async function POST(req: NextAuthRequest) {
  if (!req.auth) return NextResponse.json<ApiResponse<string>>({ result: "Not authenticated" }, { status: 401 });

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

  const model = geminiClient.getGenerativeModel({
    model: process.env.GOOGLE_GEMINI_MODEL ?? defaultModel,
    systemInstruction: systemInstruction,
    generationConfig,
    safetySettings
  });
  const { response } = await model.generateContent(data.prompt);

  if (!response.candidates || response.candidates.length === 0 || !response.candidates[0]) {
    return NextResponse.json<ApiResponse<string>>({ result: "Error generating svg" }, { status: 422 });
  }

  const candidate = response.candidates[0];
  const parts = candidate.content.parts;

  if (parts.length === 0 || !parts[0]) {
    return NextResponse.json<ApiResponse<string>>({ result: "Error generating svg" }, { status: 422 });
  }

  const svg = parts[0].text;

  if (!svg || svg.length === 0) {
    return NextResponse.json<ApiResponse<string>>({ result: "Error generating svg" }, { status: 422 });
  }

  return NextResponse.json<ApiResponse<string>>({ result: extractAndSanitizeSvg(svg)! }, { status: 200 });
});
