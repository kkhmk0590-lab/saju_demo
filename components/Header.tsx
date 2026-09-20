interface HeaderProps {
  onHome: () => void;
  showHome: boolean;
}

/** design.md §5: 헤더 56px, 좌측 로고, 우측 "처음으로"(뒤로가기 대체) */
export function Header({ onHome, showHome }: HeaderProps) {
  return (
    <header className="sticky top-0 z-10 flex h-14 items-center justify-between border-b border-[var(--color-border)] bg-[var(--color-bg)] px-4">
      <span className="text-xl font-bold">사주보기</span>
      {showHome ? (
        <button
          type="button"
          onClick={onHome}
          className="rounded-full px-3 py-2 text-base font-medium text-[var(--color-text)] hover:bg-[var(--color-bg-section)]"
        >
          처음으로
        </button>
      ) : (
        <span aria-hidden className="w-[72px]" />
      )}
    </header>
  );
}
