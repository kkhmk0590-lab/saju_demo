export type Calendar = "solar" | "lunar";
export type Gender = "male" | "female";
export type FortuneType = "general" | "love" | "wealth" | "career" | "health";
export type FiveElementKey = "wood" | "fire" | "earth" | "metal" | "water";

/** 사용자 입력 (docs/product/service-plan.md §5 플로우 기준) */
export interface BirthInput {
  name?: string;
  calendar: Calendar;
  isLeapMonth?: boolean;
  birthDate: string; // YYYY-MM-DD
  /** 모르면 undefined → 시주 미확정 처리 */
  birthTime?: string; // HH:mm
  gender: Gender;
  /** 진태양시 보정용 출생 시군구 (선택) */
  birthCity?: string;
}

export interface AnalyzeOptions {
  fortuneType: FortuneType;
  targetYear?: number;
}

/** 글자 하나(천간 또는 지지)의 표시 정보 — design.md §6 "사주 여덟 글자 카드" */
export interface SajuCharacter {
  hangul: string; // 예: "경"
  hanja: string; // 예: "庚"
  element: FiveElementKey;
}

export interface PillarView {
  label: string; // 한글 간지, 예: "경오"
  hanja: string; // 한자 간지, 예: "庚午"
  stem: SajuCharacter;
  branch: SajuCharacter;
}

/** 세운·월운 타임라인 한 항목 — saju-engine.md §9 */
export interface TimelineEntry {
  key: string; // "2026" 또는 "2026-03"
  displayLabel: string; // "2026년" 또는 "2026년 3월"
  isCurrent: boolean;
  pillar: PillarView;
  tenGod: TenGodPillar;
}

export interface FiveElementCounts {
  wood: number;
  fire: number;
  earth: number;
  metal: number;
  water: number;
}

export interface DayMasterView {
  stem: string; // 한글 천간, 예: "기"
  elementKo: string; // 오행 한글, 예: "토"
  yinYang: "양" | "음";
  /** 신강신약 — 단순 오행 개수 휴리스틱 (saju-engine.md §3-2 참고, 추후 고도화 대상) */
  strength: "strong" | "balanced" | "weak";
}

export interface YongsinView {
  primary: FiveElementKey;
  primaryKo: string; // 예: "목(木)"
  secondary: FiveElementKey;
  secondaryKo: string;
  reasoning: string;
}

export interface TenGodPillar {
  stem: string; // 십신 한글 (일주는 "일간")
  branch: string;
}

/** analyzeSaju() 결과 — interpretation-prompt.md §2 입력 포맷의 원본 데이터 */
export interface SajuAnalysis {
  input: BirthInput;
  pillars: {
    year: PillarView;
    month: PillarView;
    day: PillarView;
    /** 시간 미상이면 null */
    hour: PillarView | null;
  };
  dayMaster: DayMasterView;
  fiveElements: FiveElementCounts;
  dominantElements: FiveElementKey[];
  weakElements: FiveElementKey[];
  yongsin: YongsinView;
  tenGods: {
    year: TenGodPillar;
    month: TenGodPillar;
    day: TenGodPillar;
    hour: TenGodPillar | null;
  };
  voidBranches: string[];
  timeAccuracy: "known" | "unknown";
  limitations: string[];
  /** "오늘"을 중심으로 한 세운·월운 타임라인 — 생년월일과 무관, 일간에만 의존 (saju-engine.md §9) */
  monthlyTimeline: TimelineEntry[];
  yearlyTimeline: TimelineEntry[];
}

export interface FortuneResult {
  label: string;
  summary: string;
}

export interface SajuApiResponse {
  analysis: SajuAnalysis;
  fortuneType: FortuneType;
  targetYear?: number;
  interpretation: string;
}
