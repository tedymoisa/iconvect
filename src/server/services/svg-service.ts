import { type ICONVECT_AI_MODELS } from "@/lib/constants";
import { tryCatch } from "@/lib/try-catch";
import { type GenerationConfig, HarmBlockThreshold, HarmCategory } from "@google/genai";
import OpenAI from "openai";
import { geminiClient } from "../gemini";
import { openaiClient } from "../openai";

const systemInstruction = `
Act as an SVG code generator. Strict rules to be followed:
1. Default style for elements: xmlns='http://www.w3.org/2000/svg', viewBox='0 0 24 24', fill='currentColor', stroke-width='1'. Apply unless prompt specifies otherwise.
2. Design: Complex and iconic but visually clear. Define and separate shapes effectively using thin strokes or white spaces.
3. Output ONLY raw SVG code, starting precisely with '<svg>' and ending precisely with '</svg>'.
4. Don't add comments or explanations inside the output. The entire response must be only the SVG code itself.
`;
const safetySettings = [
  { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE }
];
const generationConfig: GenerationConfig = {
  temperature: 0.4,
  topP: 0.95,
  maxOutputTokens: 8192,
  responseMimeType: "text/plain"
};

export const svgService = {
  geminiSvg: async (model: ICONVECT_AI_MODELS, prompt: string) => {
    // 1. Generate SVG with Gemini
    const { data: result, error: geminiError } = await tryCatch(
      geminiClient.models.generateContent({
        model: model,
        contents: {
          role: "user",
          parts: [{ text: prompt }]
        },
        config: {
          systemInstruction: [{ text: systemInstruction }],
          thinkingConfig: { includeThoughts: false },
          ...generationConfig,
          ...safetySettings
        }
      })
    );

    if (geminiError) {
      console.error("Gemini API Error:", geminiError);
      throw new Error("Failed to generate SVG: Error from AI model.");
    }

    const candidate = result.candidates?.[0];
    if (!candidate) {
      console.error("Gemini Error: No candidates found in response.", result);
      throw new Error("Failed to generate SVG: No response from AI model.");
    }

    const part = candidate.content?.parts?.[0];
    const rawSvg = part?.text;

    if (!rawSvg || typeof rawSvg !== "string" || rawSvg.trim().length === 0) {
      console.error("Gemini Error: No text part found in the candidate.", candidate);
      throw new Error("Failed to generate SVG: Empty response from AI model.");
    }

    console.log("Raw SVG received from Gemini:", rawSvg);

    return svgService.stripXmlCodeBlock(rawSvg);
  },

  openaiSvg: async (model: ICONVECT_AI_MODELS, prompt: string) => {
    const { data: completion, error: openAiError } = await tryCatch(
      openaiClient.chat.completions.create({
        model: model,
        messages: [
          {
            role: "system",
            content: systemInstruction
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 1000
      })
    );

    if (openAiError) {
      if (openAiError instanceof OpenAI.APIError) {
        console.error("OpenAI API Error:", openAiError.status, openAiError.name, openAiError.message);
        throw new Error(`Failed to communicate with AI service: ${openAiError.message}`);
      }
      throw new Error("Failed to generate SVG: Error from AI model.");
    }

    const choice = completion.choices?.[0];
    const rawSvg = choice?.message?.content;

    if (!rawSvg || rawSvg.trim().length === 0) {
      console.error("OpenAI Error: No content found in response.", completion);
      throw new Error("Failed to generate SVG: Empty response from AI model.");
    }

    console.log("Raw content received from OpenAI:", rawSvg);

    return svgService.stripXmlCodeBlock(rawSvg);
  },

  stripXmlCodeBlock: (input: string): string => {
    const trimmedInput = input.trim();
    const codeBlockRegex = /^```(?:xml)?\s*([\s\S]*?)\s*```$/i;
    const match = codeBlockRegex.exec(trimmedInput); // Use exec()

    if (match && typeof match[1] === "string") {
      return match[1].trim();
    } else {
      return input;
    }
  }
};
