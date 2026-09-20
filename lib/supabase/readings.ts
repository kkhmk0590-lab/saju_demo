import { getSupabaseClient } from "@/lib/supabase/client";
import type { FortuneType, Gender, SajuAnalysis } from "@/types/saju";
import type { SajuReadingInsert, SajuReadingRow } from "@/types/database";

const YIN_YANG_EN: Record<"양" | "음", "yang" | "yin"> = { 양: "yang", 음: "yin" };

/**
 * database.md §5: `SajuResult` + 최소 메타(gender, fortuneType)만 받는다 — `SajuInput`(생년월일시 등)은
 * 함수 시그니처상 애초에 받을 수 없다. 계산 직후, Gemini 해석 전에 호출하고 실패해도 사용자
 * 응답에 영향을 주지 않도록 이 함수 내부에서 에러를 전부 삼킨다(호출부는 절대 await 실패를 겪지 않음).
 */
export async function saveReading(
  analysis: SajuAnalysis,
  meta: { gender: Gender; fortuneType: FortuneType }
): Promise<void> {
  try {
    const supabase = getSupabaseClient();
    const payload: SajuReadingInsert = {
      pillars: analysis.pillars,
      day_master_stem: analysis.dayMaster.stem,
      day_master_element: analysis.dayMaster.elementKo,
      day_master_yin_yang: YIN_YANG_EN[analysis.dayMaster.yinYang],
      day_master_strength: analysis.dayMaster.strength,
      five_elements: analysis.fiveElements,
      dominant_elements: analysis.dominantElements,
      weak_elements: analysis.weakElements,
      yongsin_primary: analysis.yongsin.primaryKo,
      yongsin_secondary: analysis.yongsin.secondaryKo,
      time_accuracy: analysis.timeAccuracy,
      gender: meta.gender,
      fortune_type: meta.fortuneType
    };

    const { error } = await supabase.from("saju_readings").insert(payload);
    if (error) {
      console.error("[supabase] saveReading failed:", error.message);
    }
  } catch (error) {
    console.error("[supabase] saveReading failed:", error);
  }
}

/** 통계 페이지용 — database.md §5: 전체 row를 select해 애플리케이션 레벨에서 집계한다. */
export async function fetchAllReadings(): Promise<SajuReadingRow[]> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.from("saju_readings").select("*");

  if (error) {
    throw new Error(`통계 데이터를 불러오지 못했습니다: ${error.message}`);
  }

  return (data ?? []) as SajuReadingRow[];
}
