# 열한 번째 상자

휴대전화의 대화와 기록을 읽고 선택하는 한국어 인터랙티브 스토리 게임입니다.

[바로 플레이](https://choiseungri.github.io/eleventh-box/)

## 실행

설치 없이 브라우저에서 플레이할 수 있습니다. 진행과 메모는 사용 중인 브라우저에 저장됩니다.

로컬에서는 `python -m http.server 8000`을 실행하고 `http://localhost:8000/`을 여세요.

## 소스

- `prototype/campaign-data.js`: 장면, 대사, 자료, 결말
- `prototype/campaign-engine.js`: 게임 상태와 분기
- `prototype/campaign-app.js`: 화면과 조작
- `prototype/campaign.css`, `prototype/phone.css`: 화면 스타일
- `assets/scenes`: 게임 이미지

버전: 0.4.1

아이콘은 Lucide를 사용하며 라이선스는 `prototype/assets/icons/LICENSE.txt`에 포함되어 있습니다.
