import { Card } from "@/components/Card";
import { Button } from "@/components/Button";
import { PillarCard } from "@/components/PillarCard";
import { TimelineSection } from "@/components/TimelineSection";
import type { SajuAnalysis } from "@/types/saju";

interface ResultScreenProps {
  analysis: SajuAnalysis;
  interpretation: string;
  isStreaming: boolean;
  errorMessage?: string;
  onRetryInput: () => void;
  onHome: () => void;
}

/** design.md §6 결과 화면 순서: ① 사주 여덟 글자 카드 → ② 세운 타임라인 → ③ 해석 텍스트. */
export function ResultScreen({ analysis, interpretation, isStreaming, errorMessage, onRetryInput, onHome }: ResultScreenProps) {
  const [birthYear, birthMonth] = analysis.input.birthDate.split("-");

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <h2 className="mb-4 text-[26px] font-bold">
          {birthYear}년 {Number(birthMonth)}월생 사주 결과
        </h2>
        <PillarCard analysis={analysis} />
      </Card>

      <Card className="flex flex-col gap-6">
        <TimelineSection title="월별 세운" entries={analysis.monthlyTimeline} />
        <TimelineSection title="연도별 세운" entries={analysis.yearlyTimeline} />
      </Card>

      <Card>
        {interpretation ? (
          <p className="whitespace-pre-wrap text-[22px] leading-relaxed">{interpretation}</p>
        ) : isStreaming ? (
          <p className="text-lg text-[var(--color-text-secondary)]">풀이를 준비하고 있어요...</p>
        ) : null}
        {errorMessage && <p className="mt-4 text-lg text-[var(--color-primary)]">{errorMessage}</p>}
      </Card>

      {!isStreaming && (
        <div className="flex gap-3">
          <Button variant="secondary" type="button" onClick={onRetryInput}>
            다시 보기
          </Button>
          <Button type="button" onClick={onHome}>
            처음으로
          </Button>
        </div>
      )}
    </div>
  );
}
