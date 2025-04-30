import { type ICONVECT_AI_MODELS } from "@/lib/constants";
import { tryCatch } from "@/lib/try-catch";
import { type GenerationConfig, HarmBlockThreshold, HarmCategory } from "@google/genai";
import DOMPurify from "dompurify";
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

    console.log("Raw SVG received from Gemini:", rawSvg.substring(0, 100));

    // 2. Sanitize SVG
    const { data: sanitizedSvg, error: sanitizeError } = await tryCatch(svgService.sanitizeSvg(rawSvg));
    if (sanitizeError) {
      throw new Error("Generated SVG was invalid or could not be sanitized.");
    }

    console.log("SVG sanitized correctly.");

    return sanitizedSvg;
  },

  openaiSvg: async (model: ICONVECT_AI_MODELS, prompt: string) => {
    // 1. Generate SVG with OpenAi
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

    // 2. Sanitize SVG
    const { data: sanitizedSvg, error: sanitizeError } = await tryCatch(svgService.sanitizeSvg(rawSvg));
    if (sanitizeError) {
      throw new Error("Generated SVG was invalid or could not be sanitized.");
    }

    console.log("SVG sanitized correctly.");

    return sanitizedSvg;
  },

  sanitizeSvg: async (rawAiResponse: string): Promise<string> => {
    if (!rawAiResponse || typeof rawAiResponse !== "string") {
      throw new Error("Invalid input provided for SVG extraction.");
    }

    let potentialSvg: string | null = null;

    const fenceRegex = /```(?:xml|svg)\s*([\s\S]*?)\s*```/;
    const fenceMatch = fenceRegex.exec(rawAiResponse);

    if (fenceMatch?.[1]) {
      potentialSvg = fenceMatch[1].trim();
    } else {
      const rawSvgRegex = /<svg[\s\S]*?<\/svg>/i;
      const rawMatch = rawSvgRegex.exec(rawAiResponse);
      if (rawMatch?.[0]) {
        potentialSvg = rawMatch[0].trim();
      }
    }

    if (!potentialSvg) {
      throw new Error("Could not extract SVG code using fence or raw tag regex.");
    }

    if (potentialSvg.length === 0) {
      throw new Error("Extracted potential SVG content is empty.");
    }

    const { data: sanitizedSvg, error } = await tryCatch(
      Promise.resolve(
        DOMPurify.sanitize(potentialSvg, {
          USE_PROFILES: { svg: true, svgFilters: true }
        })
      )
    );

    if (error) {
      throw new Error(`Error during SVG sanitization: ${error.message}`);
    }

    if (!sanitizedSvg || sanitizedSvg.trim().length === 0) {
      throw new Error("SVG Sanitization resulted in an empty string.");
    }

    return sanitizedSvg;
  }
};
