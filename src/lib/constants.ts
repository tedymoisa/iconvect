import { env } from "@/env";
import { type AiModelOption } from "@/store/model";

export const apiUrl = env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";

export const MOCK_SVG = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='currentColor' stroke='currentColor' stroke-width='1'>
  <path d='M3,10 C3,6.5 8,4 12,4 C16,4 21,6.5 21,10 V 11.5 H 3 Z' />
  <path d='M3 11.7 V 13.2 C 5 12.5, 7 14, 9 13.5 C 11 13, 13 14.5, 15 14 C 17 13.5, 19 15, 21 14.5 V 11.7 Z' />
  <path d='M3.5 14.7 H 20.5 L 20 16.7 L 4 16.7 Z' />
  <path d='M4 16.9 H 20 L 19.5 19.4 H 4.5 Z' />
  <path d='M4.5 19.6 H 19.5 V 21.6 H 4.5 Z' />
</svg>
`;

export enum ICONVECT_AI_MODELS {
  SVG_TURBO = "gemini-2.5-flash-preview-04-17",
  SVG_PICASSO = "gemini-2.5-pro-preview-04-17"
}

export enum ICONVECT_AI_GENERATORS {
  OPENAI,
  GEMINI
}

export const AI_MODELS: Record<keyof typeof ICONVECT_AI_MODELS, AiModelOption> = {
  SVG_TURBO: {
    name: "SVG Turbo",
    description: "Fast model",
    model: ICONVECT_AI_MODELS.SVG_TURBO,
    generator: ICONVECT_AI_GENERATORS.GEMINI,
    cost: 1
  },
  SVG_PICASSO: {
    name: "SVG Picasso",
    description: "Slow reasoning and accurate",
    model: ICONVECT_AI_MODELS.SVG_PICASSO,
    generator: ICONVECT_AI_GENERATORS.GEMINI,
    cost: 2
  }
};
