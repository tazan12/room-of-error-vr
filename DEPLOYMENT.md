# 배포 안내

## 현재 운영 주소

이 프로젝트의 현재 배포본은 다음 주소에서 실행됩니다.

<https://hospital-vr-lab.san5pro.chatgpt.site>

## Cloudflare Pages 무료 주소

GitHub 저장소를 Cloudflare Pages에 연결하면 프로젝트 이름을 기준으로
`https://room-vr.pages.dev` 주소를 사용할 수 있습니다. 해당 이름이 이미
사용 중이면 Cloudflare가 다른 프로젝트 이름을 요구할 수 있습니다.

Cloudflare 대시보드에서 다음 값으로 설정합니다.

| 항목 | 값 |
| --- | --- |
| GitHub 저장소 | `tazan12/room-of-error-vr` |
| 프로젝트 이름 | `room-vr` |
| 프로덕션 브랜치 | `main` |
| 프레임워크 사전 설정 | 없음 |
| 빌드 명령 | `npm run build:pages` |
| 빌드 출력 디렉터리 | `dist/pages` |
| 환경변수 | `NODE_VERSION=22.13.0` |

`main` 브랜치가 변경될 때마다 Cloudflare가 자동으로 다시 빌드하고
배포합니다. 최초 연결 시 Cloudflare 계정 로그인과 GitHub 저장소 접근
승인이 필요합니다.

Cloudflare CLI 로그인이 되어 있는 컴퓨터에서는 다음 명령으로도 배포할
수 있습니다.

```bash
npm run deploy:pages
```

## 배포 전 확인

```bash
npm install
npm run build
npm test
npm run build:pages
```

GitHub의 `main` 브랜치에 변경 사항을 반영하면 `.github/workflows/ci.yml`이 자동으로 빌드와 테스트를 수행합니다.

## 배포 구조

이 프로젝트는 Next.js/Vinext와 Cloudflare Worker 구성을 사용합니다.
`npm run build:pages`는 Vinext 결과물을 Cloudflare Pages의 고급
`_worker.js` 형식으로 패키징합니다.

- 현재 운영: ChatGPT Sites
- 무료 공개 주소: Cloudflare Pages
- 대안: Cloudflare Workers 또는 호환되는 Node.js 배포 서비스

API 키나 비밀값은 소스 파일에 넣지 말고 배포 플랫폼의 환경변수 또는
GitHub Secrets에 저장합니다.
