import { getGeminiClient, GEMINI_MODEL } from "@/lib/gemini/client";
import { buildSystemPrompt } from "@/lib/prompt/systemPrompt";
import { buildInputBlock } from "@/lib/prompt/inputBlock";
import type { FortuneType, SajuAnalysis } from "@/types/saju";

/**
 * 계산 결과를 해석 프롬프트로 조립해 Gemini를 스트리밍 호출한다.
 * interpretation-prompt.md §4 조립 순서: 시스템 프롬프트(§1) + 입력 포맷(§2) + 출력 구조(§3, 시스템 프롬프트에 포함).
 */
export async function streamInterpretation(
  analysis: SajuAnalysis,
  fortuneType: FortuneType,
  targetYear?: number
) {
  const client = getGeminiClient();
  const userContent = buildInputBlock(analysis, fortuneType, targetYear);

  return client.models.generateContentStream({
    model: GEMINI_MODEL,
    contents: userContent,
    config: {
      systemInstruction: buildSystemPrompt(),
      temperature: 0.7
    }
  });
}
