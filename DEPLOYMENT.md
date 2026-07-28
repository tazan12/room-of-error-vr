# 배포 안내

## 현재 운영 주소

이 프로젝트의 현재 배포본은 다음 주소에서 실행됩니다.

<https://hospital-vr-lab.san5pro.chatgpt.site>

## 배포 전 확인

```bash
npm install
npm run build
npm test
```

GitHub의 `main` 브랜치에 변경 사항을 반영하면 `.github/workflows/ci.yml`이 자동으로 빌드와 테스트를 수행합니다.

## 배포 플랫폼

이 프로젝트는 Next.js/Vinext와 Cloudflare Worker 구성을 사용하므로 일반적인 정적 GitHub Pages보다 서버 런타임을 지원하는 배포 환경이 적합합니다.

- 현재 운영: ChatGPT Sites
- 대안: Cloudflare Workers 또는 호환되는 Node.js 배포 서비스

배포 플랫폼을 변경할 때에는 해당 플랫폼의 프로젝트에 이 GitHub 저장소를 연결하고, 빌드 명령을 `npm run build`로 설정합니다. API 키나 비밀값은 소스 파일에 넣지 말고 배포 플랫폼의 환경변수 또는 GitHub Secrets에 저장합니다.
