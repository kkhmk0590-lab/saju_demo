import {
  EARTHLY_BRANCHES,
  EARTHLY_BRANCHES_HANJA,
  HEAVENLY_STEMS,
  HEAVENLY_STEMS_HANJA,
  getEarthlyBranchElement,
  getHeavenlyStemElement
} from "manseryeok";
import type { EarthlyBranch, FourPillars, HeavenlyStem, FiveElement as ManFiveElement, Pillar } from "manseryeok";
import type { DayMasterView, FiveElementCounts, FiveElementKey, PillarView, SajuCharacter, YongsinView } from "@/types/saju";

const ELEMENT_KO_TO_KEY: Record<ManFiveElement, FiveElementKey> = {
  목: "wood",
  화: "fire",
  토: "earth",
  금: "metal",
  수: "water"
};

const ELEMENT_KEY_TO_KO: Record<FiveElementKey, string> = {
  wood: "목(木)",
  fire: "화(火)",
  earth: "토(土)",
  metal: "금(金)",
  water: "수(水)"
};

const CYCLE: FiveElementKey[] = ["wood", "fire", "earth", "metal", "water"];

/** 나를 낳아주는 오행(인성) */
function generatingOf(element: FiveElementKey): FiveElementKey {
  const idx = CYCLE.indexOf(element);
  return CYCLE[(idx + 4) % 5];
}

/** 내가 낳는 오행(식상) */
function generatedOf(element: FiveElementKey): FiveElementKey {
  const idx = CYCLE.indexOf(element);
  return CYCLE[(idx + 1) % 5];
}

/** 내가 극하는 오행(재성) */
function controllingOf(element: FiveElementKey): FiveElementKey {
  const idx = CYCLE.indexOf(element);
  return CYCLE[(idx + 2) % 5];
}

export function countFiveElements(pillars: FourPillars): FiveElementCounts {
  const counts: FiveElementCounts = { wood: 0, fire: 0, earth: 0, metal: 0, water: 0 };

  for (const pillar of Object.values(pillars)) {
    counts[ELEMENT_KO_TO_KEY[getHeavenlyStemElement(pillar.heavenlyStem)]] += 1;
    counts[ELEMENT_KO_TO_KEY[getEarthlyBranchElement(pillar.earthlyBranch)]] += 1;
  }

  return counts;
}

export function getDominantElements(counts: FiveElementCounts): FiveElementKey[] {
  const max = Math.max(...Object.values(counts));
  return CYCLE.filter((element) => counts[element] === max && max > 0);
}

export function getWeakElements(counts: FiveElementCounts): FiveElementKey[] {
  const min = Math.min(...Object.values(counts));
  return CYCLE.filter((element) => counts[element] === min);
}

/**
 * 신강신약 — 오행 개수만 보는 단순 휴리스틱 (saju-engine.md §3-2, §7 참고).
 * 월지 강약·계절·지장간은 미반영. domain-knowledge.md §8 보강 후 고도화 대상.
 */
export function estimateDayMasterStrength(
  dayElement: FiveElementKey,
  counts: FiveElementCounts
): DayMasterView["strength"] {
  const supporting = counts[dayElement] + counts[generatingOf(dayElement)] * 0.7;

  if (supporting >= 3.5) return "strong";
  if (supporting <= 1.5) return "weak";
  return "balanced";
}

/**
 * 용신 — 신약하면 나를 돕는 오행(인성), 신강하면 내가 극하는 오행(재성)을 1차 조율점으로 둔다.
 * domain-knowledge.md §9 원칙의 단순화 버전. 유파별 정밀 판단은 서비스 범위 밖(MVP).
 */
export function selectYongsin(
  dayMaster: { element: FiveElementKey; elementKo: string; strength: DayMasterView["strength"] },
  counts: FiveElementCounts
): YongsinView {
  const weakElements = getWeakElements(counts);
  const controlling = controllingOf(dayMaster.element);
  const generated = generatedOf(dayMaster.element);
  const primary = dayMaster.strength === "strong" ? controlling : generatingOf(dayMaster.element);
  const secondary = weakElements.includes(generated) ? generated : weakElements[0];

  return {
    primary,
    primaryKo: ELEMENT_KEY_TO_KO[primary],
    secondary,
    secondaryKo: ELEMENT_KEY_TO_KO[secondary],
    reasoning: `${dayMaster.elementKo} 일간의 강약과 오행 분포를 함께 보아 ${ELEMENT_KEY_TO_KO[primary]} 기운을 우선 조율점으로 둡니다.`
  };
}

export function elementKoLabel(element: FiveElementKey): string {
  return ELEMENT_KEY_TO_KO[element];
}

export function elementKeyFromKo(elementKo: ManFiveElement): FiveElementKey {
  return ELEMENT_KO_TO_KEY[elementKo];
}

/** design.md §6 "사주 여덟 글자 카드": 천간 한 글자의 한자·오행 표시 정보 */
export function stemCharacter(stem: HeavenlyStem): SajuCharacter {
  const index = HEAVENLY_STEMS.indexOf(stem);
  return {
    hangul: stem,
    hanja: HEAVENLY_STEMS_HANJA[index],
    element: elementKeyFromKo(getHeavenlyStemElement(stem))
  };
}

/** design.md §6 "사주 여덟 글자 카드": 지지 한 글자의 한자·오행 표시 정보 */
export function branchCharacter(branch: EarthlyBranch): SajuCharacter {
  const index = EARTHLY_BRANCHES.indexOf(branch);
  return {
    hangul: branch,
    hanja: EARTHLY_BRANCHES_HANJA[index],
    element: elementKeyFromKo(getEarthlyBranchElement(branch))
  };
}

export function toPillarView(pillar: Pillar): PillarView {
  const stem = stemCharacter(pillar.heavenlyStem);
  const branch = branchCharacter(pillar.earthlyBranch);
  return {
    label: `${stem.hangul}${branch.hangul}`,
    hanja: `${stem.hanja}${branch.hanja}`,
    stem,
    branch
  };
}
