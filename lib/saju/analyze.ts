import { calculateFourPillars, getTenGodChart } from "manseryeok";
import type { FourPillars } from "manseryeok";
import { longitudeForCity } from "@/lib/saju/cities";
import {
  countFiveElements,
  elementKeyFromKo,
  getDominantElements,
  getWeakElements,
  estimateDayMasterStrength,
  selectYongsin
} from "@/lib/saju/elements";
import type { BirthInput, PillarView, SajuAnalysis, TenGodPillar } from "@/types/saju";

const UNKNOWN_TIME_LIMITATION =
  "태어난 시간이 없어 시주는 확정하지 않고 연·월·일 중심으로 보수적으로 해석합니다.";

const BIRTH_DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const BIRTH_TIME_RE = /^\d{2}:\d{2}$/;

export class SajuInputError extends Error {}

function parseBirthDate(value: string): { year: number; month: number; day: number } {
  if (!BIRTH_DATE_RE.test(value)) {
    throw new SajuInputError("생년월일 형식이 올바르지 않습니다 (YYYY-MM-DD).");
  }
  const [year, month, day] = value.split("-").map(Number);
  return { year, month, day };
}

function parseBirthTime(value: string): { hour: number; minute: number } {
  if (!BIRTH_TIME_RE.test(value)) {
    throw new SajuInputError("태어난 시각 형식이 올바르지 않습니다 (HH:mm).");
  }
  const [hour, minute] = value.split(":").map(Number);
  if (hour < 0 || hour > 23 || minute < 0 || minute > 59) {
    throw new SajuInputError("태어난 시각 범위가 올바르지 않습니다.");
  }
  return { hour, minute };
}

function toPillarView(korean: string, hanja: string): PillarView {
  return { label: korean, hanja };
}

/**
 * 사주 계산 (계산은 manseryeok, 서비스는 오행 분포·신강신약·용신만 파생).
 * saju-engine.md §3, §4 계약을 그대로 유지한다: 시간 미상이면 hour는 null.
 */
export function analyzeSaju(input: BirthInput): SajuAnalysis {
  if (!input.birthDate) {
    throw new SajuInputError("생년월일은 필수입니다.");
  }

  const { year, month, day } = parseBirthDate(input.birthDate);
  const hasTime = Boolean(input.birthTime);
  const { hour, minute } = hasTime
    ? parseBirthTime(input.birthTime as string)
    : { hour: 12, minute: 0 };

  const longitude = longitudeForCity(input.birthCity);

  const result = calculateFourPillars({
    year,
    month,
    day,
    hour,
    minute,
    isLunar: input.calendar === "lunar",
    isLeapMonth: Boolean(input.isLeapMonth),
    gender: input.gender,
    trueSolarTime: longitude ? { longitude } : undefined
  });

  const pillars: FourPillars = { year: result.year, month: result.month, day: result.day, hour: result.hour };
  const fiveElements = countFiveElements(pillars);
  const dominantElements = getDominantElements(fiveElements);
  const weakElements = getWeakElements(fiveElements);

  const dayElement = elementKeyFromKo(result.dayElement.stem);
  const strength = estimateDayMasterStrength(dayElement, fiveElements);
  const dayMaster = {
    stem: result.day.heavenlyStem,
    element: dayElement,
    elementKo: result.dayElement.stem,
    yinYang: result.dayYinYang.stem,
    strength
  };
  const yongsin = selectYongsin(dayMaster, fiveElements);

  const tenGodChart = getTenGodChart(pillars);
  const tenGods: SajuAnalysis["tenGods"] = {
    year: tenGodChart.year as TenGodPillar,
    month: tenGodChart.month as TenGodPillar,
    day: tenGodChart.day as TenGodPillar,
    hour: hasTime ? (tenGodChart.hour as TenGodPillar) : null
  };

  const timeAccuracy: SajuAnalysis["timeAccuracy"] = hasTime ? "known" : "unknown";
  const limitations: string[] = hasTime ? [] : [UNKNOWN_TIME_LIMITATION];

  return {
    input,
    pillars: {
      year: toPillarView(result.yearString, result.yearHanja),
      month: toPillarView(result.monthString, result.monthHanja),
      day: toPillarView(result.dayString, result.dayHanja),
      hour: hasTime ? toPillarView(result.hourString, result.hourHanja) : null
    },
    dayMaster: {
      stem: dayMaster.stem,
      elementKo: dayMaster.elementKo,
      yinYang: dayMaster.yinYang,
      strength: dayMaster.strength
    },
    fiveElements,
    dominantElements,
    weakElements,
    yongsin,
    tenGods,
    voidBranches: result.voidBranches,
    timeAccuracy,
    limitations
  };
}
