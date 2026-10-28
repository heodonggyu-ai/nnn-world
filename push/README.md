# NNN WORLD 출석 알림 서버 (Cloudflare Worker)

학부모 휴대폰에 앱을 닫아 둬도 출석 알림(푸시)을 보내는 작은 서버입니다. Cloudflare 무료 플랜으로 동작합니다.

- 코드: `worker.js` (전체를 복사해 Cloudflare Worker 편집기에 붙여넣기)
- 필요한 바인딩: KV namespace, 변수 이름 `SUBS`
- 비밀키(VAPID)는 처음 실행할 때 스스로 만들어 KV에 보관합니다. 따로 넣을 비밀값이 없습니다.
- 회원 앱 관장 메뉴 → 설정 → '출석 알림 서버 주소'에 Worker 주소를 넣으면 켜집니다.

## PT 수업 알림 (같은 서버에 추가됨 · 2026-10-28)

PT 수업 관리 앱(`/pt/`)의 예약 확정·취소·거절·새 요청 알림과, **수업 전 알림(1일 전·3시간 전 등)** 도 이 서버가 보냅니다.

- 코드 전체를 새로 붙여넣고 **Deploy** 하면 됩니다. (KV 바인딩 `SUBS` 그대로)
- 수업 전 알림을 정해진 시간에 보내려면 **Cron Trigger** 를 하나 추가해야 합니다:
  Worker → Settings → Triggers(트리거) → Cron Triggers → Add → `*/5 * * * *` (5분마다)
- PT 앱 설정 탭 → '앱 알림' → 이 Worker 주소 저장 → '이 폰에 알림 켜기'.
