import type { ReactNode } from "react";

/** design.md §5: 둥근 모서리 12px, 은은한 그림자, 패딩 24px */
export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={`rounded-xl bg-[var(--color-bg)] p-6 shadow-[0_1px_3px_rgba(0,0,0,0.1)] ${className}`}
    >
      {children}
    </div>
  );
}
