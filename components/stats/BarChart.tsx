import type { CountDatum } from "@/lib/stats/aggregate";

/**
 * 수평 막대 차트 — dataviz 스킬 마크 스펙(references/marks-and-anatomy.md) 준수:
 * 20px 두께(<=24px), 데이터 끝(오른쪽)만 4px 라운드·기준선(왼쪽)은 사각,
 * 라벨/값은 텍스트 토큰(막대 색을 글자에 입히지 않음), 값은 막대 끝에 직접 표기.
 */
export function BarChart({ data }: { data: CountDatum[] }) {
  const max = Math.max(1, ...data.map((d) => d.value));

  return (
    <div className="flex flex-col gap-3">
      {data.map((d) => (
        <div key={d.key} className="flex items-center gap-3">
          <span className="w-12 shrink-0 text-base font-medium">{d.label}</span>
          <div className="h-5 flex-1 rounded-r-[4px] bg-[var(--color-bg-section)]">
            <div
              className="h-5 rounded-r-[4px]"
              style={{ width: `${(d.value / max) * 100}%`, backgroundColor: d.color }}
            />
          </div>
          <span className="w-8 shrink-0 text-right text-base text-[var(--color-text-secondary)]">{d.value}</span>
        </div>
      ))}
    </div>
  );
}
