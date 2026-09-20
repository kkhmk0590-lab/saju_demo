import { analyzeSaju } from "@/lib/saju/analyze";

const known = analyzeSaju({
  birthDate: "1990-03-15",
  birthTime: "10:30",
  calendar: "solar",
  gender: "male",
  birthCity: "서울"
});
console.log(JSON.stringify(known, null, 2));

const unknownTime = analyzeSaju({
  birthDate: "2000-01-01",
  calendar: "solar",
  gender: "female"
});
console.log(unknownTime.pillars, unknownTime.timeAccuracy, unknownTime.limitations);

const lunar = analyzeSaju({
  birthDate: "2020-04-01",
  calendar: "lunar",
  isLeapMonth: true,
  birthTime: "05:00",
  gender: "male"
});
console.log("lunar 2020-윤4-01 05:00 ->", lunar.pillars);

const solarEquivalent = analyzeSaju({
  birthDate: "2020-05-23",
  calendar: "solar",
  birthTime: "05:00",
  gender: "male"
});
console.log("solar  2020-05-23 05:00 ->", solarEquivalent.pillars, "(위 두 결과가 같아야 정상)");
