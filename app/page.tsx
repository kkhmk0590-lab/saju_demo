"use client";

import { useState } from "react";
import { Header } from "@/components/Header";
import { Card } from "@/components/Card";
import { Button } from "@/components/Button";
import { StartScreen } from "@/components/screens/StartScreen";
import { InputScreen, type InputSubmitValue } from "@/components/screens/InputScreen";
import { LoadingScreen } from "@/components/screens/LoadingScreen";
import { ResultScreen } from "@/components/screens/ResultScreen";
import type { SajuAnalysis } from "@/types/saju";

type Step = "start" | "input" | "loading" | "result";

export default function Home() {
  const [step, setStep] = useState<Step>("start");
  const [analysis, setAnalysis] = useState<SajuAnalysis | null>(null);
  const [interpretation, setInterpretation] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | undefined>();

  function resetToStart() {
    setStep("start");
    setAnalysis(null);
    setInterpretation("");
    setIsStreaming(false);
    setErrorMessage(undefined);
  }

  async function handleSubmit(value: InputSubmitValue) {
    setStep("loading");
    setAnalysis(null);
    setInterpretation("");
    setErrorMessage(undefined);
    setIsStreaming(true);

    try {
      const response = await fetch("/api/saju", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...value.input, fortuneType: value.fortuneType, targetYear: value.targetYear })
      });

      if (!response.ok || !response.body) {
        const body = await response.json().catch(() => null);
        throw new Error(body?.error ?? "요청을 처리할 수 없습니다.");
      }

      setStep("result");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value: chunk } = await reader.read();
        if (done) break;
        buffer += decoder.decode(chunk, { stream: true });

        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          if (!line.trim()) continue;
          const event = JSON.parse(line) as
            | { type: "analysis"; analysis: SajuAnalysis }
            | { type: "delta"; text: string }
            | { type: "done" }
            | { type: "error"; message: string };

          if (event.type === "analysis") {
            setAnalysis(event.analysis);
          } else if (event.type === "delta") {
            setInterpretation((prev) => prev + event.text);
          } else if (event.type === "error") {
            setErrorMessage(event.message);
            setIsStreaming(false);
          } else if (event.type === "done") {
            setIsStreaming(false);
          }
        }
      }
      setIsStreaming(false);
    } catch (error) {
      setStep("result");
      setIsStreaming(false);
      setErrorMessage(error instanceof Error ? error.message : "알 수 없는 오류가 발생했습니다.");
    }
  }

  return (
    <>
      <Header showHome={step !== "start"} onHome={resetToStart} />
      <main className="mx-auto flex w-full max-w-[640px] flex-1 flex-col px-4 py-8">
        {step === "start" && <StartScreen onStart={() => setStep("input")} />}
        {step === "input" && <InputScreen onSubmit={handleSubmit} />}
        {step === "loading" && <LoadingScreen />}
        {step === "result" &&
          (analysis ? (
            <ResultScreen
              analysis={analysis}
              interpretation={interpretation}
              isStreaming={isStreaming}
              errorMessage={errorMessage}
              onRetryInput={() => setStep("input")}
              onHome={resetToStart}
            />
          ) : (
            <Card className="flex flex-col items-center gap-6 text-center">
              <p className="text-lg">{errorMessage ?? "결과를 불러올 수 없습니다."}</p>
              <Button type="button" onClick={() => setStep("input")}>
                다시 입력하기
              </Button>
            </Card>
          ))}
      </main>
    </>
  );
}
