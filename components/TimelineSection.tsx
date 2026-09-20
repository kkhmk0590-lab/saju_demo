import { ElementBadge } from "@/components/ElementBadge";
import type { TimelineEntry } from "@/types/saju";

/** design.md §6 "세운 타임라인" — 세로 리스트(가로 스와이프 금지 원칙, §2) */
export function TimelineSection({ title, entries }: { title: string; entries: TimelineEntry[] }) {
  return (
    <div className="flex flex-col gap-3">
      <h4 className="text-lg font-bold">{title}</h4>
      <div className="flex flex-col gap-2">
        {entries.map((entry) => (
          <div
            key={entry.key}
            className={`flex flex-wrap items-center justify-between gap-2 rounded-lg border px-4 py-3 ${
              entry.isCurrent
                ? "border-[var(--color-primary-hover)] bg-[var(--color-bg-section)]"
                : "border-[var(--color-border)] bg-[var(--color-bg)]"
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="text-base font-medium">
                {entry.displayLabel}
                {entry.isCurrent && <span className="ml-1 text-[var(--color-primary-hover)]">(지금)</span>}
              </span>
              <span className="text-lg font-bold">
                {entry.pillar.label}
                <span className="ml-1 text-sm font-normal text-[var(--color-text-secondary)]">({entry.pillar.hanja})</span>
              </span>
            </div>
            <div className="flex items-center gap-2">
              <ElementBadge element={entry.pillar.stem.element} />
              <span className="text-sm text-[var(--color-text-secondary)]">{entry.tenGod.stem}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
