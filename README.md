# 열한 번째 상자 · v0.6.1

책방 마지막 날, 휴대전화의 대화와 SNS를 읽으며 상자의 행방을 확인하는 한국어 미스터리 게임입니다.

[바로 플레이](https://choiseungri.github.io/eleventh-box/)

## 조작

현재 상대에게 답장을 고른 뒤 전송합니다. 스레드와 인스타그램은 홈에서 직접 엽니다. 프로필을 누르면 각 인물의 글을 모아 볼 수 있습니다.

다른 사람의 첫 연락은 15초 뒤 도착합니다. 첫 메시지를 채팅방에서 읽으면 나머지가 3초 간격으로 이어집니다. 마지막 메시지가 도착하면 답장을 고를 수 있습니다.

## 실행과 소스

설치 없이 브라우저에서 플레이합니다. 진행은 이 브라우저에 저장하며 이전 판본의 저장은 보존합니다. 로컬에서는 `python -m http.server 8000`을 실행하고 `http://localhost:8000/`을 여세요.

- `prototype/story-v06.js`: SNS 게시물과 조사 분기. 유지한 장면과 결말은 `story-v05.js`에서 가져옵니다.
- `prototype/engine-v06.js`: 상태, 읽음 확인, 도착 간격, 분기와 저장 복원.
- `prototype/phone-v06.js`, `phone-v06.css`: 휴대전화 화면과 조작.
- `node prototype/campaign.test.cjs`: 상태 및 분기 검사.

## 자산

인물과 사진은 이 허구의 이야기를 위한 제작물입니다. 아이콘은 Lucide이며 라이선스는 `prototype/assets/icons/LICENSE.txt`에 있습니다. Pretendard Variable을 함께 제공하며 [공식 프로젝트](https://github.com/orioncactus/pretendard)와 `prototype/assets/fonts/OFL.txt`에서 출처와 라이선스를 확인할 수 있습니다.
