import type { FiveElementKey } from "@/types/saju";

/** domain-knowledge.md §3 오행 성질 요약 (화면 캡션용 짧은 문구) */
export const ELEMENT_NAME_KO: Record<FiveElementKey, string> = {
  wood: "목",
  fire: "화",
  earth: "토",
  metal: "금",
  water: "수"
};

export const ELEMENT_TRAIT: Record<FiveElementKey, string> = {
  wood: "성장·상승·뻗음",
  fire: "열정·확산·타오름",
  earth: "중재·포용·안정",
  metal: "결단·수렴·다듬음",
  water: "지혜·흐름·응축"
};

/**
 * 오행 배지 색상 — domain-knowledge.md §3-1.
 * "옅은 배경 + 짙은 글자/테두리" 조합으로 통일해, 오행마다 색을 따로 골라도
 * 전부 WCAG AA(4.5:1) 이상을 만족하도록 만든다(짙은 배경 + 흰 글자 방식은 화·토에서
 * 4.5:1을 못 넘겨 이 방식으로 바꿨다 — 구현 중 실측 후 수정, domain-knowledge.md §3-1 참고).
 */
export const ELEMENT_COLOR: Record<FiveElementKey, { bg: string; fg: string }> = {
  wood: { bg: "#E8F5E9", fg: "#2E7D32" },
  fire: { bg: "#FBE9E7", fg: "#BF360C" },
  earth: { bg: "#FFF3CD", fg: "#8A6A00" },
  metal: { bg: "#F0F0F0", fg: "#5F5F5F" },
  water: { bg: "#E3F2FD", fg: "#1565C0" }
};

/** domain-knowledge.md §11: 네 기둥(궁)의 인생 시기 의미 */
export const PILLAR_LIFE_STAGE: Record<"year" | "month" | "day" | "hour", string> = {
  year: "연주 · 초년",
  month: "월주 · 청년",
  day: "일주 · 나",
  hour: "시주 · 말년"
};
