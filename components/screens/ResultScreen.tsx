import { Card } from "@/components/Card";
import { Button } from "@/components/Button";
import type { SajuAnalysis } from "@/types/saju";

interface ResultScreenProps {
  analysis: SajuAnalysis;
  interpretation: string;
  isStreaming: boolean;
  errorMessage?: string;
  onRetryInput: () => void;
  onHome: () => void;
}

/** design.md §9 결과 화면. */
export function ResultScreen({ analysis, interpretation, isStreaming, errorMessage, onRetryInput, onHome }: ResultScreenProps) {
  const [birthYear, birthMonth] = analysis.input.birthDate.split("-");
  const { pillars } = analysis;

  return (
    <div className="flex flex-col gap-4">
      <Card className="flex flex-col gap-4">
        <h2 className="text-[26px] font-bold">
          {birthYear}년 {Number(birthMonth)}월생 사주 결과
        </h2>

        <div className="flex flex-wrap gap-x-6 gap-y-1 text-base text-[var(--color-text-secondary)]">
          <span>연주 {pillars.year.label}({pillars.year.hanja})</span>
          <span>월주 {pillars.month.label}({pillars.month.hanja})</span>
          <span>일주 {pillars.day.label}({pillars.day.hanja})</span>
          <span>시주 {pillars.hour ? `${pillars.hour.label}(${pillars.hour.hanja})` : "미상"}</span>
        </div>
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
