# NNN WORLD 출석 알림 서버 (Cloudflare Worker)

학부모 휴대폰에 앱을 닫아 둬도 출석 알림(푸시)을 보내는 작은 서버입니다. Cloudflare 무료 플랜으로 동작합니다.

- 코드: `worker.js` (전체를 복사해 Cloudflare Worker 편집기에 붙여넣기)
- 필요한 바인딩: KV namespace, 변수 이름 `SUBS`
- 비밀키(VAPID)는 처음 실행할 때 스스로 만들어 KV에 보관합니다. 따로 넣을 비밀값이 없습니다.
- 회원 앱 관장 메뉴 → 설정 → '출석 알림 서버 주소'에 Worker 주소를 넣으면 켜집니다.
