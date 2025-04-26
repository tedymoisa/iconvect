import { env } from "@/env";
import { GoogleGenAI } from "@google/genai";

export const geminiClient = new GoogleGenAI({ apiKey: env.GOOGLE_API_KEY });
