
## 새 게임 추가 규칙 (랭킹 자동 연동)
- 새 게임은 가능하면 `shared/retro.js`(Retro.boot)로 만든다 → 최고점이 `nnnretro_<게임폴더id>`에 자동 저장된다.
- 새 게임을 만들면 항상 세 곳에 등록: `index.html` GAMES, `member.html` ARCADE, 커버 `shared/img/<id>-cover.jpg`.
- ARCADE 항목에 `tags`에 '레트로'가 있거나 `rank:'단위'`를 넣으면 회원 앱 랭킹(게임장)에 칩이 자동으로 생기고 점수가 올라간다.
- Retro 엔진을 안 쓰는 게임은 최고점을 `localStorage['nnnretro_<id>']`(숫자, 높을수록 좋음)에 저장하고 ARCADE에 `rank`를 넣는다.
