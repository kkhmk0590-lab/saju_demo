/**
 * 카테고리컬 차트 색상 — dataviz 스킬 기본 팔레트의 1~5번 슬롯(라이트 모드).
 * `node scripts/validate_palette.js "<hex,...>" --mode light`로 5개 전부
 * CVD 분리·명도밴드·채도하한 통과 확인됨(대비는 WARN이라 막대마다 값 라벨을 항상 병기).
 * 오행/신강신약/주제 세 차트가 이 순서를 각자 고정 인덱스로 재사용한다(차트마다 순서 뒤섞지 않음).
 */
export const CATEGORICAL_PALETTE = ["#2a78d6", "#eb6834", "#1baf7a", "#eda100", "#e87ba4"] as const;
