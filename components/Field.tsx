import type { ReactNode } from "react";

/** design.md §4: 본문/입력 라벨 18px Medium */
export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-lg font-medium">{label}</span>
      {children}
    </div>
  );
}
