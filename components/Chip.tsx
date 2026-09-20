interface ChipProps {
  label: string;
  selected: boolean;
  onClick: () => void;
}

/** design.md §6: 필터 칩 스타일 — 선택 시 빨간 배경 */
export function Chip({ label, selected, onClick }: ChipProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={`h-12 flex-1 rounded-full border text-lg font-medium transition-colors ${
        selected
          ? "border-[var(--color-primary)] bg-[var(--color-primary)] text-white"
          : "border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text)] hover:bg-[var(--color-bg-section)]"
      }`}
    >
      {label}
    </button>
  );
}
