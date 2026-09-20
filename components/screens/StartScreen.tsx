import { Card } from "@/components/Card";
import { Button } from "@/components/Button";

export function StartScreen({ onStart }: { onStart: () => void }) {
  return (
    <Card className="flex flex-col items-center gap-6 text-center">
      <h1 className="text-[26px] font-bold">사주보기</h1>
      <p className="text-lg text-[var(--color-text)]">
        생년월일시로 사주를 정확히 계산하고,
        <br />
        AI가 대화하듯 쉽게 풀이해 드려요.
      </p>
      <Button type="button" onClick={onStart}>
        사주 보러 가기
      </Button>
    </Card>
  );
}
