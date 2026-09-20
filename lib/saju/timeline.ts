import { calculateFourPillars, getBranchTenGod, getTenGod } from "manseryeok";
import type { HeavenlyStem, Pillar } from "manseryeok";
import { toPillarView } from "@/lib/saju/elements";
import type { TimelineEntry } from "@/types/saju";

/**
 * 세운(연도 X의 연주)/월운(연도 X, 월 M의 월주) 계산.
 * saju-engine.md §9: 사람에 의존하지 않는 값이라 이미 검증된 calculateFourPillars를
 * 절기 경계에서 안전한 15일로 호출해 얻는다. 새 계산 로직을 만들지 않는다.
 */
function yearPillarOf(year: number): Pillar {
  return calculateFourPillars({ year, month: 6, day: 15, hour: 12, minute: 0 }).year;
}

function monthPillarOf(year: number, month: number): Pillar {
  return calculateFourPillars({ year, month, day: 15, hour: 12, minute: 0 }).month;
}

function normalizeYearMonth(year: number, month: number): { year: number; month: number } {
  let y = year;
  let m = month;
  while (m < 1) {
    m += 12;
    y -= 1;
  }
  while (m > 12) {
    m -= 12;
    y += 1;
  }
  return { year: y, month: m };
}

function toEntry(key: string, displayLabel: string, isCurrent: boolean, pillar: Pillar, dayMasterStem: HeavenlyStem): TimelineEntry {
  return {
    key,
    displayLabel,
    isCurrent,
    pillar: toPillarView(pillar),
    tenGod: {
      stem: getTenGod(dayMasterStem, pillar.heavenlyStem),
      branch: getBranchTenGod(dayMasterStem, pillar.earthlyBranch)
    }
  };
}

/** design.md §6 "세운 타임라인" 기본값: 올해 기준 앞뒤 2년(총 5년) */
export function buildYearlyTimeline(dayMasterStem: HeavenlyStem, before = 2, after = 2): TimelineEntry[] {
  const currentYear = new Date().getFullYear();
  const entries: TimelineEntry[] = [];

  for (let year = currentYear - before; year <= currentYear + after; year += 1) {
    entries.push(toEntry(String(year), `${year}년`, year === currentYear, yearPillarOf(year), dayMasterStem));
  }

  return entries;
}

/** design.md §6 "세운 타임라인" 기본값: 이번 달 기준 앞뒤 3개월(총 7개월) */
export function buildMonthlyTimeline(dayMasterStem: HeavenlyStem, before = 3, after = 3): TimelineEntry[] {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;
  const entries: TimelineEntry[] = [];

  for (let offset = -before; offset <= after; offset += 1) {
    const { year, month } = normalizeYearMonth(currentYear, currentMonth + offset);
    const key = `${year}-${String(month).padStart(2, "0")}`;
    entries.push(toEntry(key, `${year}년 ${month}월`, offset === 0, monthPillarOf(year, month), dayMasterStem));
  }

  return entries;
}
