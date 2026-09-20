import type { FortuneType, SajuAnalysis } from "@/types/saju";

const FORTUNE_LABEL: Record<FortuneType, string> = {
  general: "종합운",
  love: "연애운",
  wealth: "재물운",
  career: "직업운",
  health: "건강운"
};

const STRENGTH_LABEL: Record<SajuAnalysis["dayMaster"]["strength"], string> = {
  strong: "신강",
  balanced: "균형",
  weak: "신약"
};

const ELEMENT_LABEL: Record<string, string> = {
  wood: "목",
  fire: "화",
  earth: "토",
  metal: "금",
  water: "수"
};

function fortuneTypeLabel(fortuneType: FortuneType, targetYear?: number): string {
  if (fortuneType === "general" && targetYear) {
    return `한해운세(${targetYear}년)`;
  }
  return FORTUNE_LABEL[fortuneType];
}

/**
 * interpretation-prompt.md §2 입력 포맷. 계산 결과에 없는 값은 넣지 않는다(환각 유발 방지, §6).
 * 십신·공망은 manseryeok이 직접 산출하므로(saju-engine.md §6) 원안보다 추가로 포함한다.
 */
export function buildInputBlock(analysis: SajuAnalysis, fortuneType: FortuneType, targetYear?: number): string {
  const { pillars, dayMaster, fiveElements, dominantElements, weakElements, yongsin, tenGods, voidBranches, timeAccuracy, limitations } =
    analysis;

  const hourLine = pillars.hour ? `${pillars.hour.label}(${pillars.hour.hanja})` : "미상(시간 정보 없음)";
  const hourTenGodLine = tenGods.hour ? `시주 천간 ${tenGods.hour.stem} · 지지 ${tenGods.hour.branch}` : "시주 미상";

  const lines = [
    "[사주 계산 결과]",
    "- 네 기둥:",
    `    연주 ${pillars.year.label}(${pillars.year.hanja})`,
    `    월주 ${pillars.month.label}(${pillars.month.hanja})`,
    `    일주 ${pillars.day.label}(${pillars.day.hanja})`,
    `    시주 ${hourLine}`,
    `- 일간(나): ${dayMaster.stem} / ${dayMaster.elementKo} / ${dayMaster.yinYang} / 힘: ${STRENGTH_LABEL[dayMaster.strength]}`,
    `- 오행 분포: 목 ${fiveElements.wood} · 화 ${fiveElements.fire} · 토 ${fiveElements.earth} · 금 ${fiveElements.metal} · 수 ${fiveElements.water}`,
    `- 강한 오행: ${dominantElements.map((e) => ELEMENT_LABEL[e]).join(", ")}`,
    `- 부족한 오행: ${weakElements.map((e) => ELEMENT_LABEL[e]).join(", ")}`,
    `- 용신(보완점): ${yongsin.primaryKo} (보조 ${yongsin.secondaryKo})`,
    "- 십신:",
    `    연주 천간 ${tenGods.year.stem} · 지지 ${tenGods.year.branch}`,
    `    월주 천간 ${tenGods.month.stem} · 지지 ${tenGods.month.branch}`,
    `    일주 지지 ${tenGods.day.branch} (일간은 본인 기준점)`,
    `    ${hourTenGodLine}`,
    `- 공망: ${voidBranches.join(", ")}`,
    `- 시간 정확도: ${timeAccuracy === "known" ? "확실" : "불확실(시간 미상)"}`,
    `- 한계: ${limitations.length > 0 ? limitations.join(" ") : "없음"}`,
    "",
    "[사용자 요청]",
    `- 주제: ${fortuneTypeLabel(fortuneType, targetYear)}`
  ];

  if (targetYear) {
    lines.push(`- 대상 연도: ${targetYear}`);
  }

  return lines.join("\n");
}
