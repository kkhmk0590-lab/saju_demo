# 사주 계산 엔진 문서 (Saju Engine)

> 사주 여덟 글자 계산을 담당하는 엔진(`manseryeok` 패키지)의 검증·출력 구조·연동 문서.
> 명리학 지식은 `domain-knowledge.md`, 전체 아키텍처는 `architecture.md`,
> 해석 프롬프트는 `interpretation-prompt.md` 참고.
>
> 이 문서는 계산 알고리즘을 직접 구현하지 않는다. 검증된 패키지를 **어떻게 쓰고,
> 결과를 어떻게 믿고, 서비스에 어떻게 연결하는가**를 다룬다.

---

## 0. 채택 변경 이력 (⚠️ 중요)

- 최초 후보였던 **`saju-fortune`은 검증 결과 채택하지 않는다.**
- 대신 **`manseryeok`**을 채택한다.
- 사유: §5 검증에서 `saju-fortune`에 실제 계산 버그와 미구현 기능을 확인했고,
  `manseryeok`이 이를 모두 해결하면서 KASI 정본 데이터·테스트·CI를 갖추고 있음을 확인.
- 상세 근거는 §5 참고. 이 절 아래 내용은 모두 `manseryeok` 기준으로 다시 작성됨.

---

## 1. 엔진 선택

- **채택**: `manseryeok` (npm)
- 버전(검증 시점): **2.0.0**
- 라이선스: MIT
- 출처: yhj1024/manseryeok (github.com/yhj1024/manseryeok)
- 설명: "Korean Saju (Four Pillars) and Manseryeok calculation library with true solar time correction"
- 런타임 의존성 0, TypeScript 완비, CI(GitHub Actions) 구성됨.

### 역할 분리 (재확인)
- **계산**: 이 패키지가 결정론적으로 네 기둥(연·월·일·시주)·십신·대운·공망을 산출한다.
- **오행 분포·신강신약·용신**: 패키지가 직접 제공하지 않음 → 서비스 `/lib/saju`에서
  패키지가 제공하는 음양오행 유틸(`getHeavenlyStemElement` 등)로 얇게 계산한다(§3-2).
  이 로직은 서비스 소유이므로 `domain-knowledge.md` 이론이 보강될수록 함께 다듬는다.
- **해석**: LLM(Gemini)이 담당. 여덟 글자를 LLM에 맡기지 않는다(환각 방지).

---

## 2. 설치 · 호출

```bash
npm install manseryeok
```

### 기본 호출
```ts
import { calculateFourPillars } from "manseryeok";

const result = calculateFourPillars({
  year: 1990,
  month: 3,
  day: 15,
  hour: 10,      // 시간 미상이면 별도 플래그로 관리 (§4)
  minute: 30,
  isLunar: false,
  isLeapMonth: false,
  gender: "male",
  trueSolarTime: {
    longitude: 126.978,        // 출생지 경도(동경). 서울 기본값 127.5
    applyEquationOfTime: true,
    applyHistoricalDst: true
  }
});

result.toObject();       // { year: "경오", month: "기묘", day: "기묘", hour: "기사" }
result.toHanjaObject();  // 한자 버전
result.tenGods;          // 십신
result.voidBranches;     // 공망
result.luckPillars;      // 대운 (gender 지정 시)
```

- 음력 입력은 `isLunar: true` + `isLeapMonth`로 **패키지가 직접 KASI 정본 데이터로 변환**한다
  (`saju-fortune`과 달리 별도 만세력 라이브러리 선변환이 필요 없음, §4).
- 진태양시는 `trueSolarTime` 옵션으로 실제 보정된다(§4).

---

## 3. 출력 구조

### 3-1. 패키지 제공 필드 (`FourPillarsDetail`)

| 필드 | 내용 |
|------|------|
| `year` / `month` / `day` / `hour` | 각 기둥의 `Pillar` (`heavenlyStem`, `earthlyBranch`) |
| `toObject()` | 한글 간지 문자열 (예: `{ year: "경오", ... }`) |
| `toHanjaObject()` | 한자 간지 문자열 |
| `toString()` / `toHanjaString()` | 사람이 읽는 요약 문장 |
| `dayElement` | 일주 천간/지지의 오행 |
| `dayYinYang` | 일주 천간/지지의 음양 |
| `tenGods` | 십신 (연/월/시 각 기둥 대비, 일주는 "일간"으로 표기) |
| `voidBranches` | 공망 |
| `luckPillars` | 대운 (`gender` 지정 시만 포함) |

### 3-2. 서비스가 추가로 계산하는 필드 (`/lib/saju`에서 파생)

`saju-fortune`이 제공하던 필드 중 패키지가 주지 않는 것은 서비스에서 순수 함수로 계산한다.
네 기둥의 천간·지지 8글자에 `getHeavenlyStemElement` / `getEarthlyBranchElement`를 적용해 구한다.

| 필드 | 계산 방법 |
|------|-----------|
| `fiveElements` | 8글자(4기둥 × 천간·지지) 오행 개수 집계 `{wood, fire, earth, metal, water}` |
| `dominantElements` / `weakElements` | `fiveElements`에서 최대/최소값 오행 |
| `dayMaster` | 일간 천간 + `dayElement.stem` + `dayYinYang.stem` |
| `dayMaster.strength` | (신강신약) — MVP는 `saju-fortune`과 동일한 단순 휴리스틱(비겁+인성 비율)으로 시작하고, `domain-knowledge.md` §8 보강 후 월지 강약·계절을 반영해 고도화 (⚠️ 단순 개수 집계는 학술적으로 근사치임을 프롬프트/UI에 노출하지 않고 내부 참고로만 사용) |
| `yongsin` | 신강 → 극하는 오행 / 신약 → 생하는 오행 (`domain-knowledge.md` §9 원칙) |

> ⚠️ 이 파생 로직은 서비스 코드가 소유하므로, `domain-knowledge.md`의 신강신약·용신 이론이
> 보강되면 `/lib/saju`만 고치면 된다(패키지 교체 불필요).

### 3-3. 실측 예시 (1990-03-15 10:30, male, solar, 서울, 진태양시 미보정)
```json
{
  "pillars": { "year": "경오", "month": "기묘", "day": "기묘", "hour": "기사" }
}
```
→ `saju-fortune` 실측값과 정확히 일치(§5-1). 월주=일주가 "기묘"로 같은 것은
계산 버그가 아니라 **우연**임을 알고리즘 대조로 확인함(§5-2).

---

## 4. 예외 · 특수 입력 처리

### 태어난 시간 미상
- `manseryeok`은 `hour`/`minute`을 필수로 요구한다(시주 없이 3주만 계산하는 모드 없음).
- 서비스 처리: `birthTime` 미입력 시 **시주만 버려서 UI/프롬프트에 노출**하고,
  계산 자체는 임의 시각(예: 12:00)으로 호출해 연·월·일주만 사용한다.
  - `/lib/saju`에서 `timeAccuracy: "unknown"`, `limitations: ["시주는 확정하지 않고..."]`를
    직접 세팅해 `saju-fortune`과 동일한 응답 계약을 유지한다(프롬프트/UI 변경 없음).

### 음력 입력
- `isLunar: true`로 패키지에 그대로 전달한다. **KASI 정본 데이터(1391~2049) + 6tail 천문 계산(2050~2100)**
  으로 변환하므로, 별도 만세력 라이브러리로 선변환할 필요가 **없다** (`saju-fortune`과 가장 큰 차이).
- 윤달(`isLeapMonth`)은 입력 단계에서 반드시 확인해 그대로 전달.

### 진태양시(경도) 보정
- `trueSolarTime.longitude`로 출생지 경도를 넘기면 **경도 보정 + 균시차(EoT) + 과거 표준시/서머타임**까지
  실제로 반영된다(`saju-fortune`의 `birthCity`는 받기만 하고 계산에 전혀 쓰이지 않는 죽은 필드였음, §5-3).
- 출생 시군구 → 경도 매핑 테이블은 서비스에서 별도 구축 필요(주요 시군구 경도값 정도로 충분).
- 옵션 생략 시 기본값(한반도 평균 127.5°)로 보정 없이 KST 그대로 사용.

### 자시(子時) 경계
- `dayBoundary` 옵션(`midnight` 기본 / `jasi` / `조자시splitJasi`)으로 학파별 관법을 선택할 수 있다.
- 서비스 MVP는 기본값(`midnight`) 채택. 확장 시 사용자 설정 가능성 열어둠(§8).

---

## 5. 검증 (Verification) — 완료

> 계산 엔진 채택 전 알고리즘을 직접 감사하고, 대안 패키지와 교차 대조했다.

### 5-1. `saju-fortune` 소스 코드 직접 감사 (알고리즘 검증)
패키지 크기가 작아(핵심 로직 845줄) 블랙박스 테스트 대신 **소스를 전량 읽고 고전 명리 공식과 대조**하는
방식으로 검증했다. 결과:

| 항목 | 결과 |
|------|------|
| 연주 계산 (연간+연지) | 정확 — 1984=갑자, 1990=경오 등 기준 사례와 일치 |
| 월주 천간 (오호둔 규칙) | 정확 — 甲己丙寅頭 등 고전 공식과 완전히 일치 |
| 월주 지지 (절기 경계) | **부분 오류 발견** — 아래 5-4 |
| 일주 (60갑자 순환) | 정확 — 1900-01-01=갑술 기준일이 통용 기준과 일치 |
| 시주 (오자둔시 규칙) | 정확 — 甲己還加甲 등 고전 공식과 완전히 일치 |
| 진태양시(`birthCity`) | **미구현 확인** — 입력만 받고 계산에 전혀 사용 안 됨 (아래 5-3) |
| 음력 입력 | **미구현 확인** — `calendar: "lunar"` 입력 시 항상 예외 발생, 변환 로직 없음 |
| 신강신약(`estimateDayMasterStrength`) | 단순 오행 개수 집계 휴리스틱. 월지·계절·지장간 미반영 |

### 5-2. "월주=일주 동일" 이슈 — 해소 (버그 아님)
- 최초 발견(1990-03-15 → 월주·일주 모두 "기묘"): 월주는 연간 기준 오호둔 공식, 일주는
  1900-01-01 기준 날짜 카운트 mod 60 — **서로 완전히 독립적인 두 계산**이 같은 결과를 낸 우연.
- `manseryeok`(독립 구현, KASI 검증)으로 동일 입력 재계산 → 동일하게 "기묘/기묘" 산출,
  우연의 일치임을 재확인.

### 5-3. `birthCity` 죽은 코드 확인
```
grep -rn "birthCity" saju-fortune/src/*.js
→ input.js(정규화)·cli.js(옵션 파싱)에만 등장, pillars.js/readings.js 등
  실제 계산 코드에서는 단 한 번도 참조되지 않음.
```
문서(구 버전)에 있던 "birthCity로 경도 보정을 반영"은 **사실이 아니었다.** `manseryeok`은
`trueSolarTime.longitude`로 실제 보정을 수행하므로 이 문제가 해결된다.

### 5-4. ⚠️ 확인된 실제 버그: 매년 1/1~소한(대략 1/5~1/6) 사이 월주 오류
`saju-fortune`과 `manseryeok`을 동일 입력으로 교차 대조한 결과, **2000-01-01~01-05**에서
월주가 불일치함을 발견:

| 날짜 | saju-fortune | manseryeok (KASI 기준) |
|------|:---:|:---:|
| 2000-01-01 | 정축 (축월) | 병자 (자월) |
| 2000-01-02~05 | 정축 | 병자 |
| 2000-01-06~ | 정축 | 정축 (일치) |

원인: `getSolarTermMonthIndex()`의 경계 탐색 루프가 1월 날짜를 절대 소한 시작일(1/6 부근)과
비교하지 않고 무조건 폴백값(축월 인덱스)을 반환하는 구조적 결함. 즉 **매년 양력 1/1부터
소한 전날까지(약 5일)** 태어난 사람은 월주가 한 칸씩 틀리게 나온다(자월이어야 할 것이 축월로 계산됨).
그 외 테스트한 절기 경계(입춘 1984/2021, 자시 경계, 3월 절기)는 모두 `manseryeok`과 일치했다.

이 버그 하나만으로도 계산 엔진으로서 신뢰하기 어렵다고 판단해 **채택 보류를 확정**했다.

### 5-5. 대조 테스트 케이스 기록
| 케이스 | 입력 | saju-fortune | manseryeok | 통과 |
|--------|------|:---:|:---:|:---:|
| 실측 예시 | 1990-03-15 10:30 | 경오/기묘/기묘/기사 | 경오/기묘/기묘/기사 | ✅ 일치 |
| 입춘 이전 | 1984-02-02 | 계해/을축/병인/갑오 | 계해/을축/병인/갑오 | ✅ 일치 |
| 입춘 이후 | 1984-02-05 | 갑자/병인/기사/경오 | 갑자/병인/기사/경오 | ✅ 일치 |
| 입춘 절입 전날 | 2021-02-02 | 경자/기축/신사/갑오 | 경자/기축/신사/갑오 | ✅ 일치 |
| 입춘 당일(절입 전) | 2021-02-03 | 경자/기축/임오/병오 | 경자/기축/임오/병오 | ✅ 일치 |
| saju-fortune 기준일 | 2021-02-04 | 신축/경인/계미/무오 | 신축/경인/계미/무오 | ✅ 일치 |
| 자시 경계 | 1990-05-15 23:30 | 경오/신사/경진/병자 | 경오/신사/경진/병자 | ✅ 일치 |
| 자시 경계(README 예시) | 2024-03-10 23:30 | 갑진/정묘/계유/임자 | 갑진/정묘/계유/임자 | ✅ 일치 |
| **소한 이전** | **2000-01-01** | **정축** | **병자** | ❌ **불일치 — saju-fortune 버그** |

### 5-6. `manseryeok` 자체 신뢰도
- README 명시: 절기 절입표는 KASI와 분 단위 일치 검증(1800–2300), 음력은 KASI 정본(1391–2049)
  + 6tail 천문 계산(2050–2100), 일주는 KASI 일진과 전 구간 일치 검증.
- 테스트에 golden 케이스 + 6tail(다른 독립 라이브러리) 교차검증 포함, CI 구성됨.
- 위 5-5 대조에서도 saju-fortune과 8/9 케이스 일치 + 나머지 1건은 saju-fortune 쪽 버그로 규명됨
  → 추가 신뢰 근거로 채택.

---

## 6. 서비스 연동 (Next.js)

```
[Route Handler: /api/saju]
  1. 입력 검증 (양/음력, 윤달, 생년월일, 시각, 성별, 주제)
  2. calculateFourPillars(...) 실행
     - 음력이면 isLunar:true로 그대로 전달 (별도 변환 라이브러리 불필요)
     - 출생 시군구 있으면 longitude 매핑 후 trueSolarTime 전달
     - 시간 미상이면 12:00으로 계산하되 timeAccuracy:"unknown" 별도 표시
  3. /lib/saju에서 fiveElements/dominant/weak/dayMaster.strength/yongsin 파생 계산
  4. 프롬프트에 삽입 (pillars, dayMaster, fiveElements, dominant/weak, yongsin, tenGods 등)
  5. Gemini 호출 → 자연어 풀이
  6. 계산 요약 + 해석을 클라이언트로 반환
```

- 패키지는 **서버에서만** 실행(Node/TS 패키지, 클라이언트 불가 — 원칙은 동일).
- `tenGods`(십신)는 패키지가 직접 제공하므로, 서비스가 직접 계산하던 것보다 신뢰도가 높아짐 →
  `interpretation-prompt.md` §5의 십신 활용도를 높일 여지 생김.

---

## 7. 리스크 · 대안

- **소규모 개인 패키지 의존은 여전함**: `manseryeok`도 메인테이너 1인 프로젝트(3개월 전 공개).
  다만 CI·테스트·KASI 대조 근거가 문서화되어 있어 `saju-fortune`보다 검증 가능성이 높음.
- **버전 고정 권장**: `package.json`에서 `^2.0.0` 대신 마이너 업데이트만 자동 반영하고,
  메이저 업데이트(README에 명시된 "v2.0에서 1.x 대비 출력 변경" 사례처럼) 시 재검증 후 반영.
- **대안(향후 재검토용)**: `lunar-javascript`(6tail, 매우 널리 쓰이는 중국어권 라이브러리, `manseryeok`이
  자체 교차검증에 사용) — 필요시 이것으로 다시 교차검증하거나 직접 채택 가능.
- 연동 함수 경계(`계산(input) → result`, `/lib/saju`)를 고정해두면 향후 엔진을 다시 교체해도
  `/lib/prompt`, API 응답 계약, UI는 영향받지 않음.

---

## 8. 미결정 사항 (Decisions Needed)
- [x] ~~`saju-fortune` 최종 채택 여부~~ → **미채택, `manseryeok`으로 전환 확정**
- [x] ~~음력 변환: 패키지 내장 vs 외부 라이브러리~~ → **패키지 내장(KASI 정본) 사용**
- [ ] 진태양시 보정 수준: 출생 시군구 → 경도 매핑 테이블 범위(광역시/도 단위 vs 시군구 단위)
- [ ] 자시 관법(`dayBoundary`) 사용자 노출 여부 (MVP는 기본값 고정, 확장 시 검토)
- [ ] 신강신약(`estimateDayMasterStrength`) 고도화 시점 — `domain-knowledge.md` §8 보강과 연동
