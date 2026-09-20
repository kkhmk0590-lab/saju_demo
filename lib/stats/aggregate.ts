import type { SajuReadingRow } from "@/types/database";
import type { FortuneType } from "@/types/saju";
import { CATEGORICAL_PALETTE } from "@/lib/stats/palette";

export interface CountDatum {
  key: string;
  label: string;
  value: number;
  color: string;
}

const ELEMENT_ORDER: { key: string; label: string }[] = [
  { key: "목", label: "목" },
  { key: "화", label: "화" },
  { key: "토", label: "토" },
  { key: "금", label: "금" },
  { key: "수", label: "수" }
];

const STRENGTH_ORDER: { key: SajuReadingRow["day_master_strength"]; label: string }[] = [
  { key: "strong", label: "신강" },
  { key: "balanced", label: "균형" },
  { key: "weak", label: "신약" }
];

const FORTUNE_ORDER: { key: FortuneType; label: string }[] = [
  { key: "general", label: "종합" },
  { key: "love", label: "연애" },
  { key: "wealth", label: "재물" },
  { key: "career", label: "직업" },
  { key: "health", label: "건강" }
];

function countByOrder<T extends string>(
  rows: SajuReadingRow[],
  pick: (row: SajuReadingRow) => T,
  order: { key: T; label: string }[]
): CountDatum[] {
  const counts = new Map<string, number>();
  for (const row of rows) {
    const key = pick(row);
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  return order.map(({ key, label }, index) => ({
    key,
    label,
    value: counts.get(key) ?? 0,
    color: CATEGORICAL_PALETTE[index % CATEGORICAL_PALETTE.length]
  }));
}

/** 일간(그 사람의 오행 정체성) 분포 — database.md §2 day_master_element */
export function aggregateDayMasterElement(rows: SajuReadingRow[]): CountDatum[] {
  return countByOrder(rows, (row) => row.day_master_element, ELEMENT_ORDER);
}

/** 신강·신약·균형 분포 — database.md §2 day_master_strength */
export function aggregateStrength(rows: SajuReadingRow[]): CountDatum[] {
  return countByOrder(rows, (row) => row.day_master_strength, STRENGTH_ORDER);
}

/** 인기 주제 분포 — database.md §2 fortune_type */
export function aggregateFortuneType(rows: SajuReadingRow[]): CountDatum[] {
  return countByOrder(rows, (row) => row.fortune_type as FortuneType, FORTUNE_ORDER);
}
