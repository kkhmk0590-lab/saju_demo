import type { SelectHTMLAttributes } from "react";

/** design.md §6: 둥근 인풋(24px), 어르신에게는 달력 위젯보다 큰 드롭다운이 쉬움 */
export function BigSelect({ className = "", children, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={`h-12 rounded-[24px] border border-[var(--color-border)] bg-[var(--color-bg)] px-4 text-lg text-[var(--color-text)] focus:border-[var(--color-text)] focus:outline-none ${className}`}
      {...props}
    >
      {children}
    </select>
  );
}
