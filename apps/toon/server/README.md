# 밍뉴툰 AI 그림 선생님 서버

휴대폰 앱이 AI 그림 선생님을 쓸 때 거치는 작은 서버예요. Google AI(Gemini) 열쇠는 이 서버에만 두고 앱에는 넣지 않아요.

1. Google AI Studio(aistudio.google.com) → **Get API key** → **API 키 만들기** → 키 복사
2. Cloudflare(dash.cloudflare.com) 가입 → **Workers & Pages** → **만들기** → **Worker 만들기** → 이름 `mingnyutoon-ai` → **배포**
3. **코드 편집** → 기존 코드를 모두 지우고 `worker.js` 내용을 붙여넣기 → **배포**
4. Worker 화면 → **설정** → **변수 및 암호** → **추가** → 종류 **암호**, 이름 `GEMINI_API_KEY`, 값에 1번 키 → **배포**
5. (하루 횟수 제한) **저장소 및 데이터베이스** → **KV** → **만들기** `mingnyutoon-rl` → Worker **설정** → **바인딩** → **추가** → **KV 네임스페이스**, 이름 `RL` → 방금 만든 KV 선택 → **배포**
6. Worker 주소(`https://mingnyutoon-ai.<계정>.workers.dev`)를 앱 코드 `js/16_ai.js`의 `AI_ENDPOINT`에 넣고 앱을 다시 빌드
