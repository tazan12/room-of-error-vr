# Room of Error VR

간호대학생이 병실을 탐색하며 환자안전 오류를 찾는 웹 기반 2.5D VR 시뮬레이션입니다.

## 바로 체험하기

[배포된 Room of Error VR 열기](https://hospital-vr-lab.san5pro.chatgpt.site)

Cloudflare Pages용 무료 주소 `room-vr.pages.dev` 배포 설정도 포함되어
있습니다. 최초 계정 연결 방법은 [DEPLOYMENT.md](DEPLOYMENT.md)를
참고하세요.

## 학습 사례

| 구분 | 내용 | 점검 항목 |
| --- | --- | ---: |
| OT | 사용법과 기본 환자안전 점검 예행연습 | 10개 |
| 사례 1 | 심근경색 환자 간호 | 10개 |
| 사례 2 | 낙상 고위험 환자 간호 | 10개 |
| 사례 3 | 감염관리 및 투약안전 | 10개 |

각 항목에는 정답 판정, 힌트, 근거 설명 및 디브리핑 기능이 포함되어 있습니다.

## 주요 기능

- 병실 이미지 기반 탐색형 VR 화면
- 마우스 드래그·확대·축소·전체화면
- 클릭 가능한 오류 지점과 사례별 진행률
- 힌트, 즉시 피드백 및 디브리핑
- PC·태블릿·모바일 반응형 화면

## 로컬 실행

Node.js 22.13.0 이상이 필요합니다.

```bash
npm install
npm run dev
```

터미널에 표시되는 로컬 주소를 브라우저에서 열면 됩니다.

## 빌드와 검증

```bash
npm run build
npm test
npm run build:pages
```

GitHub Actions가 `main` 브랜치와 Pull Request의 빌드 가능 여부를 자동으로 확인합니다.

## 주요 파일

- `app/page.tsx`: 사례, 오류 지점, 힌트, 피드백 및 상호작용
- `app/globals.css`: 화면 구성과 반응형 스타일
- `public/assets/`: OT 및 사례별 병실 이미지
- `DEPLOYMENT.md`: 배포 및 운영 안내

교육용 시뮬레이션이므로 실제 임상 판단이나 환자 진료를 대체하지 않습니다.
