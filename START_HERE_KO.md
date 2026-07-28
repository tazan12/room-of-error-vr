# 룸 오브 에러 3D 간호 시뮬레이션

이 폴더는 배포된 최신 버전(v4)의 전체 소스와 병실 이미지를 담고 있습니다.

## 포함된 사례

- OT 예행연습: 안전 점검 지점 10개
- 사례 1 심근경색 환자: 오류 10개
- 사례 2 낙상 고위험 환자: 오류 10개
- 사례 3 감염·투약 안전: 오류 10개

## 실행 방법

Node.js 22.13.0 이상이 필요합니다.

```bash
npm install
npm run dev
```

터미널에 표시되는 로컬 주소를 브라우저에서 열면 됩니다.

배포용 빌드는 다음 명령으로 확인할 수 있습니다.

```bash
npm run build
npm test
npm run build:pages
```

Cloudflare Pages 연결 값과 무료 주소 설정은 `DEPLOYMENT.md`에 정리되어
있습니다.

## 주요 파일

- `app/page.tsx`: 사례, 오류 지점, 힌트, 디브리핑 및 상호작용
- `app/globals.css`: 화면과 반응형 스타일
- `public/assets/`: OT 및 사례별 병실 이미지
- `package.json`: 실행·빌드·Cloudflare Pages 명령
- `DEPLOYMENT.md`: Cloudflare Pages 연결과 자동 배포 설정
