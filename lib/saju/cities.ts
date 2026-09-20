/**
 * 출생 시군구 → 경도(동경) 매핑. 진태양시 보정(manseryeok trueSolarTime.longitude)에 사용.
 * MVP 범위는 광역시/도 단위. 미입력·미매칭 시 기본값(한반도 평균 127.5)을 사용한다.
 * saju-engine.md §4, §8 참고 — 시군구 단위 세분화는 확장 과제.
 */
export const CITY_LONGITUDE: Record<string, number> = {
  서울: 126.978,
  인천: 126.705,
  경기: 127.01,
  강원: 128.156,
  부산: 129.075,
  대구: 128.601,
  울산: 129.311,
  경남: 128.289,
  경북: 128.505,
  대전: 127.385,
  세종: 127.289,
  충남: 126.8,
  충북: 127.489,
  광주: 126.852,
  전남: 126.986,
  전북: 127.108,
  제주: 126.531
};

export function longitudeForCity(city: string | undefined): number | undefined {
  if (!city) return undefined;
  const trimmed = city.trim();
  const direct = CITY_LONGITUDE[trimmed];
  if (direct !== undefined) return direct;

  const matchedKey = Object.keys(CITY_LONGITUDE).find((key) => trimmed.startsWith(key));
  return matchedKey ? CITY_LONGITUDE[matchedKey] : undefined;
}
