
## 새 게임 추가 규칙 (랭킹 자동 연동)
- 새 게임은 가능하면 `shared/retro.js`(Retro.boot)로 만든다 → 최고점이 `nnnretro_<게임폴더id>`에 자동 저장된다.
- 새 게임을 만들면 항상 세 곳에 등록: `index.html` GAMES, `member.html` ARCADE, 커버 `shared/img/<id>-cover.jpg`.
- `member.html` ARCADE 항목에도 `index.html`과 같은 `grp`(retro·soccer·action·party·study·board·online, 여러 개면 띄어쓰기)를 넣는다 → 회원 앱 게임장 분류 칩에 자동으로 들어간다.
- ARCADE 항목에 `tags`에 '레트로'가 있거나 `rank:'단위'`를 넣으면 회원 앱 랭킹(게임장)에 칩이 자동으로 생기고 점수가 올라간다.
- Retro 엔진을 안 쓰는 게임은 최고점을 `localStorage['nnnretro_<id>']`(숫자, 높을수록 좋음)에 저장하고 ARCADE에 `rank`를 넣는다.

## 배포 규칙 (꼭 지키기)
- 사이트(GitHub Pages)는 **main 브랜치** 기준으로 배포된다. 다른 브랜치에만 올리면 사이트에 반영되지 않는다.
- 어떤 브랜치에서 작업했든, 작업이 끝나면 **항상 main에 합쳐서(merge) main에 push** 한다. 관장님이 따로 말하지 않아도 매번 한다.
- GitHub Pages 설정의 배포 브랜치를 main 이외로 바꾸지 않는다.
