interface HeaderProps {
  onHome: () => void;
  showHome: boolean;
}

/**
 * design.md §5는 "처음으로"를 우측에 두지만, §2 접근성 원칙("뒤로가기 버튼을 항상
 * 화면 좌상단에 고정 노출")이 우선이라고 문서 스스로 명시한다. 좌측 배치로 따른다.
 */
export function Header({ onHome, showHome }: HeaderProps) {
  return (
    <header className="sticky top-0 z-10 flex h-14 items-center gap-2 border-b border-[var(--color-border)] bg-[var(--color-bg)] px-4">
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
      <span className="flex-1 text-center text-xl font-bold">사주보기</span>
      <span aria-hidden className="w-[72px]" />
    </header>
  );
}
