import { ELEMENT_COLOR, ELEMENT_NAME_KO } from "@/lib/saju/display";
import type { FiveElementKey } from "@/types/saju";

/** design.md §6 "사주 여덟 글자 카드": 색상 + 텍스트를 항상 함께 표시(색맹·저시력 고려) */
export function ElementBadge({ element, className = "" }: { element: FiveElementKey; className?: string }) {
  const color = ELEMENT_COLOR[element];
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-base font-medium ${className}`}
      style={{ backgroundColor: color.bg, color: color.fg, borderColor: color.fg }}
    >
      {ELEMENT_NAME_KO[element]}
    </span>
  );
}
