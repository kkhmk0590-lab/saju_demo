# AI 사주 서비스 (docs)

태어난 연·월·일·시로 사주 여덟 글자를 **정확히 계산**하고, 그 결과를 **LLM이 자연어로 풀이**하는 대화형 AI 사주 서비스.

> 핵심 원칙: **계산은 코드(결정론), 해석은 LLM.**
> 여덟 글자 계산을 LLM에 맡기지 않아 환각을 막고, 해석은 대화형으로 자연스럽게.

---

## 문서 인덱스

| 문서 | 내용 | 다루는 것 |
|------|------|-----------|
| [service-plan.md](./service-plan.md) | 기획서 | 왜/무엇을 (타깃·기능·차별점·정책·수익) |
| [architecture.md](./architecture.md) | 기술 설계서 | 어떻게 (Next.js·Gemini·보안·반응형·DB) |
| [saju-engine.md](./saju-engine.md) | 계산 엔진 | `manseryeok` 검증·출력구조·연동 |
| [domain-knowledge.md](./domain-knowledge.md) | 명리학 지식 | 해석의 재료 (음양·오행·십신·용신 등) |
| [interpretation-prompt.md](./interpretation-prompt.md) | 해석 프롬프트 | LLM 지시 (톤·입력포맷·출력구조) |

### 문서 간 관계

```
service-plan.md ── 무엇을/왜
      │
      ▼
architecture.md ── 어떻게 (기술 골격)
      │
      ├─→ saju-engine.md ──── 계산: manseryeok → 여덟 글자·오행·용신
      │         │
      │         ▼ (계산 결과 전달)
      └─→ interpretation-prompt.md ── 해석: 결과 + 프롬프트 → Gemini
                │
                ▼ (지식 참조)
          domain-knowledge.md ── 명리학 이론 (해석의 근거)
```

---

## 기술 스택 요약

- **Next.js** (App Router, TypeScript) — 프론트 + 서버 단일 프로젝트
- **Tailwind CSS** — 모바일 우선 반응형
- **manseryeok** (npm) — 서버에서 실행하는 사주 계산 엔진
- **Google Gemini API** — 자연어 해석 (서버에서만 호출, 키는 env 관리)
- **DB 없음** (이번 범위) — 추후 추가 전제로 설계

자세한 내용은 [architecture.md](./architecture.md).

---

## 처리 흐름 (요약)

```
사용자 입력(생년월일시·성별·주제)
   ↓
[Next.js 서버]
   ① manseryeok 실행 → 여덟 글자·오행·신강신약·용신 계산
   ② 계산 결과 + 해석 프롬프트 → Gemini → 자연어 풀이
   ↓
결과 표시 (요약 → 오행 → 주제별 → 조언 → 주의)
```

---

## 핵심 결정 사항 (확정)

- 계산과 해석의 역할 분리 (코드 vs LLM)
- Next.js + Gemini + Tailwind, DB는 이번 범위 제외(확장 대비 설계)
- 비밀 키는 `.env`로 서버에서만 관리 (`NEXT_PUBLIC_` 금지)
- MVP 범위: 종합 풀이 + 올해 운세 우선
- 해석 정책: 비단정·보완책 동반·결정론 지양, 성별로 음양강약 판단 금지

---

## 미결정 사항 (전체 취합)

각 문서의 "Decisions Needed"를 모은 목록.

**제품 (`service-plan.md`)**
- [ ] 채택 명리학 유파 + 해석 톤 (여러 문서의 상위 결정)
- [ ] MVP에 주제별 운세 포함 범위
- [ ] 타깃 집중 전략 (종합 vs 특화)
- [ ] 생년월일시 저장 여부
- [ ] 수익 모델

**기술 (`architecture.md`)** — ✅ 계산·해석 레이어 구현 및 실제 Gemini 연동 확인 완료
- [ ] 배포 플랫폼 (Vercel 등)
- [x] ~~Gemini 모델/파라미터, 스트리밍 여부~~ → `gemini-3.6-flash`, NDJSON 스트리밍
- [x] ~~음력 변환 라이브러리~~ → `manseryeok` 내장
- [ ] 결과 공유(이미지) 구현

**계산 엔진 (`saju-engine.md`)** — ✅ 검증 완료, `manseryeok` 채택 확정
- [x] ~~`manseryeok` 최종 채택 여부~~ → 채택 확정 (기존 후보 `saju-fortune`은 실제 버그 발견되어 미채택)
- [x] ~~월주=일주 동일 이슈~~ → 우연의 일치로 확인(버그 아님), 독립 라이브러리 교차 대조로 재확인
- [ ] 진태양시 보정 수준: 출생 시군구 → 경도 매핑 테이블 범위
- [ ] 신강신약 계산 고도화 시점 (현재는 단순 오행 개수 집계)

**프롬프트 (`interpretation-prompt.md`)**
- [ ] 튜닝 변수(톤·길이·용어) 확정
- [ ] 십신 해석 노출 깊이

---

## 지식 문서 보강 대기 (`domain-knowledge.md` TODO)
- [ ] 0장 채택 유파 확정
- [ ] 오행별 성격 장단점
- [ ] 지지 12개 오행·음양·계절 배속 + 지장간
- [ ] 십신 10개 개별 상세
- [ ] 궁합(합·충·형·해) 이론

---

## 다음 단계 (추천 순서)

1. ~~계산 엔진 검증~~ — ✅ 완료. `saju-fortune`은 실제 버그(매년 1/1~소한 월주 오류) 발견돼 미채택,
   `manseryeok`으로 전환 확정. → `saju-engine.md` §5
2. ~~프로젝트 셋업~~ — ✅ 완료. Next.js(App Router)+TypeScript+Tailwind 스캐폴딩, `manseryeok` 설치.
3. ~~계산·해석 레이어 구현~~ — ✅ 완료. `/lib/saju` → `/lib/prompt`+`/lib/gemini` → `/api/saju` → UI 4화면,
   실제 Gemini 스트리밍 응답까지 브라우저로 확인.
4. ~~1차 엔지니어링 접근성 점검~~ — ✅ 완료(design.md §11). 실제 70세 사용자 테스트는 아직 미완료.
5. **신규 기능 문서화** — ✅ 완료(2026-09-20). 사주 여덟 글자 카드(오행 색상)와 세운 타임라인
   (월별·연도별)을 design.md §6, domain-knowledge.md §3-1·§11, saju-engine.md §9,
   interpretation-prompt.md §2-1에 반영. **구현은 아직**.
6. **톤 확정** — 서비스 성격을 좌우하는 상위 결정. → 여러 문서에 반영
7. **지식 보강** — 십신·지지 배속 등 해석 품질의 핵심. → `domain-knowledge.md`
8. **신규 기능 구현** — 사주 여덟 글자 카드 → 세운 타임라인 순으로 UI/계산 구현 (§5 참고)
9. **실사용자 테스트** — 70세 사용자(아버님) 대상 실제 테스트 (design.md §10)
