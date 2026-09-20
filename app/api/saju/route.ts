import { NextRequest } from "next/server";
import { analyzeSaju, SajuInputError } from "@/lib/saju/analyze";
import { streamInterpretation } from "@/lib/gemini/interpret";
import { saveReading } from "@/lib/supabase/readings";
import type { BirthInput, Calendar, FortuneType, Gender } from "@/types/saju";

export const runtime = "nodejs";

const CALENDARS: Calendar[] = ["solar", "lunar"];
const GENDERS: Gender[] = ["male", "female"];
const FORTUNE_TYPES: FortuneType[] = ["general", "love", "wealth", "career", "health"];

class RequestValidationError extends Error {}

function parseBody(body: unknown): { input: BirthInput; fortuneType: FortuneType; targetYear?: number } {
  if (!body || typeof body !== "object") {
    throw new RequestValidationError("요청 본문이 올바르지 않습니다.");
  }
  const b = body as Record<string, unknown>;

  const calendar = (b.calendar as Calendar) ?? "solar";
  if (!CALENDARS.includes(calendar)) {
    throw new RequestValidationError("calendar는 solar 또는 lunar여야 합니다.");
  }
  const gender = b.gender as Gender;
  if (!GENDERS.includes(gender)) {
    throw new RequestValidationError("gender는 male 또는 female이어야 합니다.");
  }
  if (typeof b.birthDate !== "string" || !b.birthDate) {
    throw new RequestValidationError("birthDate는 필수입니다.");
  }
  const fortuneType = (b.fortuneType as FortuneType) ?? "general";
  if (!FORTUNE_TYPES.includes(fortuneType)) {
    throw new RequestValidationError("fortuneType 값이 올바르지 않습니다.");
  }
  const targetYear = typeof b.targetYear === "number" ? b.targetYear : undefined;

  const input: BirthInput = {
    name: typeof b.name === "string" ? b.name : undefined,
    calendar,
    isLeapMonth: Boolean(b.isLeapMonth),
    birthDate: b.birthDate,
    birthTime: typeof b.birthTime === "string" && b.birthTime ? b.birthTime : undefined,
    gender,
    birthCity: typeof b.birthCity === "string" ? b.birthCity : undefined
  };

  return { input, fortuneType, targetYear };
}

function ndjson(obj: unknown): Uint8Array {
  return new TextEncoder().encode(`${JSON.stringify(obj)}\n`);
}

export async function POST(request: NextRequest) {
  let parsed;
  try {
    parsed = parseBody(await request.json());
  } catch (error) {
    const message = error instanceof Error ? error.message : "요청을 처리할 수 없습니다.";
    return Response.json({ error: message }, { status: 400 });
  }

  const { input, fortuneType, targetYear } = parsed;

  let analysis;
  try {
    analysis = analyzeSaju(input);
  } catch (error) {
    if (error instanceof SajuInputError) {
      return Response.json({ error: error.message }, { status: 400 });
    }
    return Response.json({ error: "사주 계산 중 오류가 발생했습니다." }, { status: 500 });
  }

  // database.md §5: 계산 직후, Gemini 해석 전에 저장. saveReading은 내부에서 에러를 삼키므로
  // 실패해도 사용자 응답에 영향이 없고, await하지 않아 응답 시작을 늦추지도 않는다.
  void saveReading(analysis, { gender: input.gender, fortuneType });

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      controller.enqueue(ndjson({ type: "analysis", analysis, fortuneType, targetYear }));

      try {
        const geminiStream = await streamInterpretation(analysis, fortuneType, targetYear);
        for await (const chunk of geminiStream) {
          const text = chunk.text;
          if (text) {
            controller.enqueue(ndjson({ type: "delta", text }));
          }
        }
        controller.enqueue(ndjson({ type: "done" }));
      } catch (error) {
        // design.md §2 "오류 메시지는 쉬운 말로": Gemini/SDK 원시 에러(영문 JSON 등)를
        // 그대로 노출하지 않는다. 상세 내용은 서버 로그로만 남긴다.
        console.error("[api/saju] interpretation stream failed:", error);
        controller.enqueue(
          ndjson({ type: "error", message: "풀이를 만드는 중 문제가 생겼어요. 잠시 후 다시 시도해 주세요." })
        );
      } finally {
        controller.close();
      }
    }
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "application/x-ndjson; charset=utf-8",
      "Cache-Control": "no-cache"
    }
  });
}
