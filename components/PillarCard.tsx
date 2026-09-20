import { ElementBadge } from "@/components/ElementBadge";
import { ELEMENT_NAME_KO, ELEMENT_TRAIT, PILLAR_LIFE_STAGE } from "@/lib/saju/display";
import type { FiveElementKey, PillarView, SajuAnalysis } from "@/types/saju";

type PillarKey = "year" | "month" | "day" | "hour";

function CharacterCell({
  hanja,
  hangul,
  element,
  emphasize
}: {
  hanja: string;
  hangul: string;
  element: FiveElementKey;
  emphasize?: boolean;
}) {
  return (
    <div className="flex flex-col items-center gap-1">
      <span
        className={`text-[28px] leading-none font-bold ${emphasize ? "text-[var(--color-primary-hover)]" : "text-[var(--color-text)]"}`}
      >
        {hanja}
      </span>
      <span className="text-sm text-[var(--color-text-secondary)]">{hangul}</span>
      <ElementBadge element={element} />
    </div>
  );
}

/** design.md §6 "사주 여덟 글자 카드" — 결과 화면 맨 위에 오는 오행 색상 카드 */
export function PillarCard({ analysis }: { analysis: SajuAnalysis }) {
  const columns: { key: PillarKey; pillar: PillarView | null }[] = [
    { key: "year", pillar: analysis.pillars.year },
    { key: "month", pillar: analysis.pillars.month },
    { key: "day", pillar: analysis.pillars.day },
    { key: "hour", pillar: analysis.pillars.hour }
  ];

  const presentElements = Array.from(
    new Set(columns.flatMap(({ pillar }) => (pillar ? [pillar.stem.element, pillar.branch.element] : [])))
  );

  return (
    <div className="flex flex-col gap-4">
      <h3 className="text-lg font-bold">사주 여덟 글자</h3>
      <div className="grid grid-cols-4 gap-2">
        {columns.map(({ key, pillar }) => (
          <div key={key} className="flex flex-col items-center gap-2">
            <span className="text-center text-sm font-medium text-[var(--color-text-secondary)]">
              {PILLAR_LIFE_STAGE[key]}
            </span>
            {pillar ? (
              <>
                <CharacterCell
                  hanja={pillar.stem.hanja}
                  hangul={pillar.stem.hangul}
                  element={pillar.stem.element}
                  emphasize={key === "day"}
                />
                <div className="h-px w-full bg-[var(--color-border)]" />
                <CharacterCell hanja={pillar.branch.hanja} hangul={pillar.branch.hangul} element={pillar.branch.element} />
              </>
            ) : (
              <span className="py-8 text-base text-[var(--color-text-secondary)]">미상</span>
            )}
          </div>
        ))}
      </div>
      {presentElements.length > 0 && (
        <p className="text-base leading-relaxed text-[var(--color-text-secondary)]">
          {presentElements.map((el) => `${ELEMENT_NAME_KO[el]} ${ELEMENT_TRAIT[el]}`).join(" · ")}
        </p>
      )}
    </div>
  );
}
