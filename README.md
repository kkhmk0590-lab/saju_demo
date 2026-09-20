# AI 사주 서비스

태어난 연·월·일·시로 사주 여덟 글자를 정확히 계산하고, LLM이 자연어로 풀이하는 대화형 AI 사주 서비스.

> 핵심 원칙: **계산은 코드(결정론), 해석은 LLM.**

기획·설계 문서는 [docs/README.md](./docs/README.md) 참고.

## 개발 실행

```bash
npm install
cp .env.example .env.local   # GEMINI_API_KEY 채우기
npm run dev
```

http://localhost:3000 에서 확인.

## 스택

Next.js (App Router) · TypeScript · Tailwind CSS · `saju-fortune` · Google Gemini API
