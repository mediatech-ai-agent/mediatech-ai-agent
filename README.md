# MediaTech AI Agent

## 실행 방법

```bash
yarn run dev
```

## 폴더 구조

```bash
src/
├── app/                   # 라우팅 & 페이지 엔트리
│   └── routes.tsx
├── features/              # 도메인 단위 기능 분리
│   └── user/
│       ├── components/
│       ├── hooks/
│       ├── stores/
│       │   └── userStore.ts
│       ├── api/
│       │   └── userApi.ts
│       ├── utils/
│       └── index.tsx       # feature export 모음
├── shared/                # 재사용 가능한 공통 요소
│   ├── components/
│   ├── hooks/
│   ├── utils/
│   ├── constants/
│   └── types/
├── styles/
├── lib/                   # axios, zustand 미들웨어, 클라이언트 등
├── App.tsx
└── main.tsx

```
