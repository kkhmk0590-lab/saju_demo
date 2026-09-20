interface ChipProps {
  label: string;
  selected: boolean;
  onClick: () => void;
}

/**
 * design.md §6: 필터 칩 스타일 — 선택 시 빨간 배경.
 * 18px medium 굵기 흰 텍스트는 #FF0000 배경과 대비 ~4.0:1로 WCAG AA(4.5:1) 미달이라,
 * 문서가 이미 정의한 "active" 톤(#CC0000, 대비 ~5.9:1)을 선택 상태 배경으로 사용한다.
 */
export function Chip({ label, selected, onClick }: ChipProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={`h-12 flex-1 rounded-full border text-lg font-medium transition-colors ${
        selected
          ? "border-[var(--color-primary-hover)] bg-[var(--color-primary-hover)] text-white"
          : "border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text)] hover:bg-[var(--color-bg-section)]"
      }`}
    >
      {label}
    </button>
  );
}
