import Link from "next/link";
import { Card } from "@/components/Card";
import { StatTile } from "@/components/stats/StatTile";
import { BarChart } from "@/components/stats/BarChart";
import { fetchAllReadings } from "@/lib/supabase/readings";
import { aggregateDayMasterElement, aggregateFortuneType, aggregateStrength } from "@/lib/stats/aggregate";
import type { SajuReadingRow } from "@/types/database";

export const metadata = {
  title: "사주 서비스 통계"
};

// database.md §7 캐싱 전략 결정 전까지는 매 요청마다 새로 조회한다(정적 프리렌더 시
// 빌드 시점 스냅샷으로 고정되는 문제 방지).
export const dynamic = "force-dynamic";

/** database.md §5: RLS로 공개된 select 정책을 그대로 사용하는 공개 통계 페이지. */
export default async function StatsPage() {
  let rows: SajuReadingRow[] | undefined;
  let loadError: string | null = null;

  try {
    rows = await fetchAllReadings();
  } catch (error) {
    console.error("[stats] failed to load readings:", error);
    loadError = "통계를 불러올 수 없어요. 잠시 후 다시 시도해 주세요.";
  }

  return (
    <>
      <header className="sticky top-0 z-10 flex h-14 items-center gap-2 border-b border-[var(--color-border)] bg-[var(--color-bg)] px-4">
        <Link
          href="/"
          className="rounded-full px-3 py-2 text-base font-medium text-[var(--color-text)] hover:bg-[var(--color-bg-section)]"
        >
          처음으로
        </Link>
        <span className="flex-1 text-center text-xl font-bold">사주보기 통계</span>
        <span aria-hidden className="w-[72px]" />
      </header>

      <main className="mx-auto flex w-full max-w-[640px] flex-1 flex-col gap-4 px-4 py-8">
        {loadError ? (
          <Card>
            <p className="text-lg">{loadError}</p>
          </Card>
        ) : (
          <>
            <Card>
              <StatTile label="지금까지 본 사주 수" value={rows!.length} />
            </Card>

            <Card className="flex flex-col gap-4">
              <h2 className="text-lg font-bold">일간 오행 분포</h2>
              <BarChart data={aggregateDayMasterElement(rows!)} />
            </Card>

            <Card className="flex flex-col gap-4">
              <h2 className="text-lg font-bold">신강 · 신약 분포</h2>
              <BarChart data={aggregateStrength(rows!)} />
            </Card>

            <Card className="flex flex-col gap-4">
              <h2 className="text-lg font-bold">인기 주제</h2>
              <BarChart data={aggregateFortuneType(rows!)} />
            </Card>
          </>
        )}
      </main>
    </>
  );
}
