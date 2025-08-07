# B tv Agent

> B tv 기획, 개발을 위한 다중 AI 에이전트 기반 채팅 애플리케이션

B tv Agent는 JIRA, CR(Code Review), 정책, 인사 등 다양한 업무 도메인에 특화된 AI 에이전트 모드로 채팅할 수 있는 웹 애플리케이션입니다.

## 🚀 주요 기능

### 🤖 다중 AI 에이전트 모드

- **JIRA Agent**: JIRA 이슈 관련 질의응답
- **CR Agent**: 코드 리뷰 및 개발 관련 지원
- **Policy Agent**: 회사 정책 및 규정 안내
- **Person Agent**: 인사 관련 업무 지원

### 💬 채팅 인터페이스

- **실시간 채팅**: 타이핑 효과와 함께 자연스러운 대화
- **세션 관리**: 대화 히스토리 저장 및 관리
- **다중 세션**: 여러 대화를 동시에 진행 가능
- **핀 기능**: 중요한 대화 고정

### 📄 출처 및 참조

- **출처 표시**: AI 답변의 참조 소스 자동 표시
- **출처 상세보기**: 우측 패널에서 출처 목록 확인
- **복사 기능**: 답변 내용 원클릭 복사

### 🎨 사용자 경험

- **반응형 디자인**: 다양한 화면 크기 지원
- **다크 테마**: 눈의 피로를 줄이는 어두운 테마
- **직관적 UI**: 피그마 디자인 시스템 기반
- **접근성**: 키보드 네비게이션 및 스크린 리더 지원

## 🛠 기술 스택

### Frontend

- **React 18** - UI 라이브러리
- **TypeScript** - 타입 안전성
- **Vite** - 빌드 도구 및 개발 서버
- **Tailwind CSS** - 유틸리티 우선 CSS 프레임워크

### 상태 관리

- **Zustand** - 경량 상태 관리 라이브러리
- **React Query** - 서버 상태 관리

### 기타

- **Lucide React** - 아이콘 라이브러리
- **Axios** - HTTP 클라이언트
- **ESLint** - 코드 품질 관리

## 📁 프로젝트 구조

```bash
mediatech-ai-agent/
├── public/                 # 정적 자산
│   ├── assets/            # 이미지, 아이콘
│   │   ├── bg_main.png    # 메인 배경
│   │   ├── chatHeader/    # 채팅 헤더 아이콘
│   │   ├── sideMenu/      # 사이드 메뉴 아이콘
│   │   └── source=*.png   # 출처 아이콘 (jira, figma, confluence)
│   └── favicon.ico        # 파비콘
├── src/
│   ├── app/               # 메인 애플리케이션
│   │   ├── Admin/         # 관리자 페이지
│   │   └── Home/          # 홈 페이지
│   │       ├── components/
│   │       │   ├── AgentCard.tsx          # AI 에이전트 선택 카드
│   │       │   ├── AgentCardGrid.tsx      # 에이전트 카드 그리드
│   │       │   ├── ChatHeader.tsx         # 채팅 헤더
│   │       │   ├── ChatMessages.tsx       # 채팅 메시지 렌더링
│   │       │   ├── ChatInput/
│   │       │   │   ├── index.tsx          # 메인 입력 컴포넌트
│   │       │   │   ├── ChatTextarea.tsx   # 텍스트 입력
│   │       │   │   ├── JiraInput.tsx      # JIRA 티켓 입력
│   │       │   │   ├── JiraCard.tsx       # JIRA 카드 표시
│   │       │   │   └── ActionButtons.tsx  # 액션 버튼들
│   │       │   ├── ChatActions.tsx        # 복사/출처 버튼
│   │       │   ├── CopyButton.tsx         # 클립보드 복사 버튼
│   │       │   ├── SourceButton.tsx       # 출처 개수 버튼
│   │       │   ├── SourceContainer.tsx    # 출처 표시 패널
│   │       │   ├── SourceCard.tsx         # 출처 카드
│   │       │   ├── TypingIndicator.tsx    # AI 응답 대기 표시
│   │       │   └── sideMenu/
│   │       │       ├── SideMenu.tsx       # 사이드바 메뉴
│   │       │       ├── MenuItem.tsx       # 메뉴 아이템
│   │       │       ├── HistoryItem.tsx    # 대화 히스토리 아이템
│   │       │       ├── MenuHeader.tsx     # 메뉴 헤더
│   │       │       └── SectionHeader.tsx  # 섹션 헤더
│   │       └── index.tsx
│   ├── shared/            # 공통 컴포넌트 및 유틸
│   │   ├── components/
│   │   │   ├── CommonLayout.tsx      # 공통 레이아웃
│   │   │   ├── MarkdownRenderer.tsx  # 마크다운 렌더링
│   │   │   ├── QueryBoundary.tsx     # 쿼리 에러 바운더리
│   │   │   └── Tooltip.tsx           # 툴팁 컴포넌트
│   │   ├── hooks/
│   │   │   ├── useApiQuery.ts        # API 쿼리 훅
│   │   │   ├── useChatInput.ts       # 채팅 입력 관리 훅
│   │   │   ├── useRequestAgent.ts    # AI 에이전트 요청 훅
│   │   │   ├── useSidebarToggle.ts   # 사이드바 토글 훅
│   │   │   └── useTypewriter.ts      # 타이핑 효과 훅
│   │   ├── utils/
│   │   │   ├── HttpClient.ts         # HTTP 클라이언트 클래스
│   │   │   ├── common.ts             # 공통 유틸리티
│   │   │   ├── localStorage.ts       # 로컬 스토리지 관리
│   │   │   ├── queryClient.ts        # React Query 설정
│   │   │   ├── queryKeys.ts          # 쿼리 키 상수
│   │   │   ├── sessionId.ts          # 세션 ID 생성
│   │   │   └── useSidebarController.ts # 사이드바 컨트롤러
│   │   └── constants/
│   │       └── index.ts              # 전역 상수 (아이콘, 플레이스홀더, 검증 규칙)
│   ├── stores/            # 상태 관리 (Zustand)
│   │   └── chat/
│   │       ├── chatStore.ts          # 메인 채팅 스토어
│   │       ├── selectors.ts          # 스토어 셀렉터
│   │       ├── sessionUtils.ts       # 세션 유틸리티
│   │       ├── storage.ts            # 로컬 스토리지 연동
│   │       └── types.ts              # 스토어 타입 정의
│   ├── config/
│   │   └── environment.ts           # 환경 설정
│   ├── components/
│   │   └── ui/                      # UI 컴포넌트 라이브러리
│   └── types/                       # 전역 타입 정의
├── nginx.conf             # Nginx 프록시 설정
├── Dockerfile            # Multi-stage Docker 빌드
├── .dockerignore         # Docker 빌드 제외 파일
├── ecosystem.config.cjs  # PM2 설정 (사용하지 않음)
├── .yarnrc.yml          # Yarn 설정 (PnP 비활성화)
├── vite.config.ts       # Vite 빌드 설정
├── tailwind.config.js   # Tailwind CSS 설정
├── tsconfig.json        # TypeScript 설정
└── package.json         # 프로젝트 메타데이터 및 의존성
```

## 🏃‍♂️ 설치 및 실행

### 필수 요구사항

- Node.js 22+ (LTS 권장)
- Yarn 4.9.1+

### 설치

```bash
# 의존성 설치
yarn install
```

### 개발 환경 실행

```bash
# 로컬 개발 (Vite Proxy 사용)
yarn dev:local

# 일반 개발 모드
yarn dev

# 개발 서버 모드
yarn dev:development

# 스테이징 모드
yarn dev:staging
```

### 빌드

```bash
# 프로덕션 빌드
yarn build

# 환경별 빌드
yarn build:development
yarn build:staging
yarn build:production
```

## ⚙️ 환경 설정

### 환경 변수

로컬 개발을 위한 환경 변수를 설정하세요:

```bash
# .env.local
VITE_AGENT_API_BASE_URL=http://localhost:8080
```

### 개발 모드별 특징

- **local**: Vite Proxy를 통한 CORS 우회
- **development**: 개발 서버 연결
- **staging**: 스테이징 서버 연결
- **production**: 프로덕션 서버 연결

## 🎯 주요 컴포넌트

### ChatActions

각 AI 답변 하단에 표시되는 액션 버튼들

- 복사하기: 답변 내용을 클립보드에 복사
- 출처: 참조 소스 표시 (있는 경우만)

### SourceContainer

우측에 고정 표시되는 출처 목록 패널

- 전체 화면 높이 사용
- 출처별 상세 정보 표시
- X 버튼 또는 외부 클릭으로 닫기

### ChatMessages

채팅 메시지 렌더링 및 관리

- HTML/Markdown 렌더링 지원
- 타이핑 효과
- 스크롤 위치 관리

### AgentCardGrid

AI 에이전트 선택 카드들

- 4가지 에이전트 타입 지원
- 호버 효과 및 애니메이션

## 📋 개발 가이드

### 새로운 에이전트 추가

1. `src/shared/utils/common.ts`에 `AgentType` 추가
2. `AgentCardGrid`에 새 카드 추가
3. 에이전트별 메시지 처리 로직 구현

### 새로운 컴포넌트 추가

1. 적절한 디렉토리에 컴포넌트 생성
2. `index.ts`에서 export
3. 타입 정의 및 props 인터페이스 작성

### 상태 관리

- 채팅 관련: `src/stores/chat/`
- 전역 상태: Zustand 스토어 활용

## 🌐 배포

### GitHub Pages (개발용)
- **URL**: https://mediatech-ai-agent.github.io/mediatech-ai-agent/

### Docker 배포 (프로덕션)

Multi-stage Docker 빌드를 통한 최적화된 배포:

```bash
# 1. 프로젝트 클론
git clone <repository-url>
cd mediatech-ai-agent

# 2. Docker 이미지 빌드 및 실행
docker build -t mediatech-ai-agent .
docker run -d --name mediatech-ai-agent -p 3001:3001 --restart unless-stopped mediatech-ai-agent

# 3. 상태 확인
docker ps
docker logs mediatech-ai-agent
```

#### 배포 특징
- **Multi-stage Build**: Node.js 빌드 + Nginx 서빙으로 이미지 크기 최적화 (~30MB)
- **Nginx 프록시**: API CORS 문제 해결 및 성능 최적화
- **자동 SSL**: 백엔드 HTTPS 연결 지원
- **정적 파일 캐싱**: 1년 캐싱으로 성능 향상
- **Gzip 압축**: 네트워크 전송량 70% 감소
- **보안 헤더**: XSS, Clickjacking 등 보안 강화

#### 핵심 아키텍처
```
브라우저 → Nginx (3001) → 백엔드 API (8080)
         ↓
      정적 파일 서빙 + API 프록시
```

### API 프록시 통합
- **개발환경**: Vite 프록시 사용
- **프로덕션**: Nginx 프록시 사용
- **CORS 완전 해결**: 모든 환경에서 동일한 API 호출 방식

### 성능 최적화
- **Multi-stage Docker**: 빌드 환경과 런타임 환경 분리
- **Nginx 최적화**: Gzip, 캐싱, 버퍼링 설정
- **번들 최적화**: 509KB → 162KB (gzip 압축)

## 📄 라이선스
이 프로젝트는 MIT 라이선스 하에 있습니다.
