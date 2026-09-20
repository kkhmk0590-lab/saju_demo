"use client";

import { useState } from "react";
import { Card } from "@/components/Card";
import { Field } from "@/components/Field";
import { Chip } from "@/components/Chip";
import { BigSelect } from "@/components/BigSelect";
import { Button } from "@/components/Button";
import { CITY_LONGITUDE } from "@/lib/saju/cities";
import type { BirthInput, Calendar, Gender } from "@/types/saju";

export interface InputSubmitValue {
  input: BirthInput;
  fortuneType: "general";
  targetYear?: number;
}

const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: CURRENT_YEAR - 1925 + 1 }, (_, i) => 1925 + i);
const MONTHS = Array.from({ length: 12 }, (_, i) => i + 1);
const HOURS = Array.from({ length: 24 }, (_, i) => i);
const MINUTES = [0, 10, 20, 30, 40, 50];

function daysInMonth(year: number, month: number) {
  return new Date(year, month, 0).getDate();
}

/** design.md §9 정보 입력 화면. service-plan.md §5 플로우 + MVP 범위(종합/한해운세)만 노출. */
export function InputScreen({ onSubmit }: { onSubmit: (value: InputSubmitValue) => void }) {
  const [calendar, setCalendar] = useState<Calendar>("solar");
  const [isLeapMonth, setIsLeapMonth] = useState(false);
  const [year, setYear] = useState<number | "">("");
  const [month, setMonth] = useState<number | "">("");
  const [day, setDay] = useState<number | "">("");
  const [timeKnown, setTimeKnown] = useState(true);
  const [hour, setHour] = useState(12);
  const [minute, setMinute] = useState(0);
  const [gender, setGender] = useState<Gender | "">("");
  const [birthCity, setBirthCity] = useState("");
  const [topic, setTopic] = useState<"general" | "yearly">("general");

  const maxDay = year && month ? daysInMonth(Number(year), Number(month)) : 31;
  const isValid = Boolean(year && month && day && gender);

  function handleSubmit() {
    if (!isValid) return;
    const birthDate = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    const birthTime = timeKnown ? `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}` : undefined;

    onSubmit({
      input: {
        calendar,
        isLeapMonth: calendar === "lunar" ? isLeapMonth : false,
        birthDate,
        birthTime,
        gender: gender as Gender,
        birthCity: birthCity || undefined
      },
      fortuneType: "general",
      targetYear: topic === "yearly" ? CURRENT_YEAR : undefined
    });
  }

  return (
    <Card className="flex flex-col gap-8">
      <h2 className="text-center text-[26px] font-bold">생년월일을 입력해 주세요</h2>

      <Field label="양력 / 음력">
        <div className="flex gap-3">
          <Chip label="양력" selected={calendar === "solar"} onClick={() => setCalendar("solar")} />
          <Chip label="음력" selected={calendar === "lunar"} onClick={() => setCalendar("lunar")} />
        </div>
      </Field>

      {calendar === "lunar" && (
        <Field label="평달 / 윤달">
          <div className="flex gap-3">
            <Chip label="평달" selected={!isLeapMonth} onClick={() => setIsLeapMonth(false)} />
            <Chip label="윤달" selected={isLeapMonth} onClick={() => setIsLeapMonth(true)} />
          </div>
        </Field>
      )}

      <Field label="생년월일">
        <div className="grid grid-cols-3 gap-3">
          <BigSelect value={year} onChange={(e) => setYear(e.target.value ? Number(e.target.value) : "")}>
            <option value="">연도</option>
            {YEARS.map((y) => (
              <option key={y} value={y}>
                {y}년
              </option>
            ))}
          </BigSelect>
          <BigSelect value={month} onChange={(e) => setMonth(e.target.value ? Number(e.target.value) : "")}>
            <option value="">월</option>
            {MONTHS.map((m) => (
              <option key={m} value={m}>
                {m}월
              </option>
            ))}
          </BigSelect>
          <BigSelect value={day} onChange={(e) => setDay(e.target.value ? Number(e.target.value) : "")}>
            <option value="">일</option>
            {Array.from({ length: maxDay }, (_, i) => i + 1).map((d) => (
              <option key={d} value={d}>
                {d}일
              </option>
            ))}
          </BigSelect>
        </div>
      </Field>

      <Field label="태어난 시각">
        <div className="flex flex-col gap-3">
          <div className="flex gap-3">
            <Chip label="시간을 알아요" selected={timeKnown} onClick={() => setTimeKnown(true)} />
            <Chip label="모르겠어요" selected={!timeKnown} onClick={() => setTimeKnown(false)} />
          </div>
          {timeKnown && (
            <div className="grid grid-cols-2 gap-3">
              <BigSelect value={hour} onChange={(e) => setHour(Number(e.target.value))}>
                {HOURS.map((h) => (
                  <option key={h} value={h}>
                    {h}시
                  </option>
                ))}
              </BigSelect>
              <BigSelect value={minute} onChange={(e) => setMinute(Number(e.target.value))}>
                {MINUTES.map((m) => (
                  <option key={m} value={m}>
                    {m}분
                  </option>
                ))}
              </BigSelect>
            </div>
          )}
        </div>
      </Field>

      <Field label="성별">
        <div className="flex gap-3">
          <Chip label="남자" selected={gender === "male"} onClick={() => setGender("male")} />
          <Chip label="여자" selected={gender === "female"} onClick={() => setGender("female")} />
        </div>
      </Field>

      <Field label="태어난 지역 (선택)">
        <BigSelect value={birthCity} onChange={(e) => setBirthCity(e.target.value)}>
          <option value="">선택 안 함</option>
          {Object.keys(CITY_LONGITUDE).map((city) => (
            <option key={city} value={city}>
              {city}
            </option>
          ))}
        </BigSelect>
      </Field>

      <Field label="보고 싶은 운세">
        <div className="flex gap-3">
          <Chip label="종합 풀이" selected={topic === "general"} onClick={() => setTopic("general")} />
          <Chip label={`${CURRENT_YEAR}년 운세`} selected={topic === "yearly"} onClick={() => setTopic("yearly")} />
        </div>
      </Field>

      <Button type="button" onClick={handleSubmit} disabled={!isValid}>
        결과 보기
      </Button>
    </Card>
  );
}
