import { Card } from "@/components/Card";

/** design.md §6: 유튜브 스타일 상단 로딩바 + "분석 중" 문구, 3초 이상 걸릴 수 있으므로 필수 노출 */
export function LoadingScreen() {
  return (
    <Card className="flex flex-col items-center gap-6 py-12 text-center">
      <div className="h-2 w-full max-w-[200px] overflow-hidden rounded-full bg-[var(--color-bg-section)]">
        <div className="h-full w-1/2 animate-[loading-bar_1.1s_ease-in-out_infinite] rounded-full bg-[var(--color-primary)]" />
      </div>
      <p className="text-xl font-medium">사주를 분석하고 있어요...</p>
      <p className="text-base text-[var(--color-text-secondary)]">잠시만 기다려 주세요.</p>
      <style>{`
        @keyframes loading-bar {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }
      `}</style>
    </Card>
  );
}
