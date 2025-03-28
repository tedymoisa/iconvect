import { GoogleGenerativeAI } from "@google/generative-ai";

export const geminiClient = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);
