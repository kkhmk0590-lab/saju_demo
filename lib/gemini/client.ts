import { GoogleGenAI } from "@google/genai";

let cachedClient: GoogleGenAI | null = null;

/** Gemini는 반드시 서버(Route Handler)에서만 호출한다 (architecture.md §5). */
export function getGeminiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY가 설정되지 않았습니다. .env.local을 확인하세요.");
  }
  if (!cachedClient) {
    cachedClient = new GoogleGenAI({ apiKey });
  }
  return cachedClient;
}

export const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-3.6-flash";
