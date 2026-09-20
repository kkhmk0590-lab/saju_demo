import type { FiveElementCounts, FiveElementKey, FortuneType, Gender, SajuAnalysis } from "@/types/saju";

/**
 * `saju_readings` 테이블 매핑 — database.md §2.
 * `SajuInput`(생년월일시 등 민감정보)은 절대 포함하지 않는다: 이 타입 자체가 가드 역할을 한다.
 */
export interface SajuReadingInsert {
  pillars: SajuAnalysis["pillars"];
  day_master_stem: string;
  day_master_element: string;
  day_master_yin_yang: "yang" | "yin";
  day_master_strength: "strong" | "weak" | "balanced";
  five_elements: FiveElementCounts;
  dominant_elements: FiveElementKey[];
  weak_elements: FiveElementKey[];
  yongsin_primary: string | null;
  yongsin_secondary: string | null;
  time_accuracy: "known" | "unknown";
  gender: Gender | null;
  fortune_type: FortuneType;
}

export interface SajuReadingRow extends SajuReadingInsert {
  id: string;
  created_at: string;
}
