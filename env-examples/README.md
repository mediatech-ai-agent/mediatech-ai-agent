# 환경별 설정 파일 가이드

## 📁 환경 변수 파일 구조

```
프로젝트 루트/
├── .env                    # 기본 환경 변수 (모든 환경에서 공통)
├── .env.local             # 로컬 개발 환경 (git ignore 권장)
├── .env.development       # 개발 환경
├── .env.staging          # 스테이징 환경
├── .env.production       # 프로덕션 환경
└── .env.test             # 테스트 환경
```

## 🚀 환경별 실행 명령어

### 개발 환경

```bash
# 로컬 개발 (기본)
yarn dev

# 로컬 개발 (명시적)
yarn dev:local

# 개발 서버 환경
yarn dev:development

# 스테이징 환경
yarn dev:staging
```

### 빌드 환경

```bash
# 개발 빌드
yarn build:development

# 스테이징 빌드
yarn build:staging

# 프로덕션 빌드
yarn build:production
```

### 미리보기 환경

```bash
# 개발 미리보기
yarn preview:development

# 스테이징 미리보기
yarn preview:staging

# 프로덕션 미리보기
yarn preview:production
```

## 🔧 환경 변수 우선순위

Vite는 다음 순서로 환경 변수를 로드합니다:

1. `.env.${mode}.local` (가장 높은 우선순위)
2. `.env.local` (mode가 'test'가 아닌 경우)
3. `.env.${mode}`
4. `.env` (가장 낮은 우선순위)

## 📝 환경별 설정 예시

### .env (기본 설정)

```env
# 기본 설정 (모든 환경 공통)
VITE_APP_NAME=MediaTech AI Agent
VITE_APP_VERSION=1.0.0
```

### .env.local (개발자 개인 설정)

```env
# 개발자 개인 설정 (git에 커밋하지 않음)
VITE_API_BASE_URL=http://localhost:3000/api
VITE_ENABLE_DEVTOOLS=true
VITE_LOG_LEVEL=debug
```

### .env.development (개발 환경)

```env
# 개발 환경 설정
VITE_API_BASE_URL=https://api-dev.mediatech.com/api
VITE_ENABLE_DEVTOOLS=true
VITE_LOG_LEVEL=debug
VITE_FEATURE_ANALYTICS=false
```

### .env.staging (스테이징 환경)

```env
# 스테이징 환경 설정
VITE_API_BASE_URL=https://api-staging.mediatech.com/api
VITE_ENABLE_DEVTOOLS=false
VITE_LOG_LEVEL=info
VITE_FEATURE_ANALYTICS=true
VITE_SENTRY_DSN=https://staging-sentry-dsn@sentry.io/project
```

### .env.production (프로덕션 환경)

```env
# 프로덕션 환경 설정
VITE_API_BASE_URL=https://api.mediatech.com/api
VITE_ENABLE_DEVTOOLS=false
VITE_LOG_LEVEL=error
VITE_FEATURE_ANALYTICS=true
VITE_FEATURE_ERROR_TRACKING=true
VITE_SENTRY_DSN=https://production-sentry-dsn@sentry.io/project
VITE_GOOGLE_ANALYTICS_ID=GA-XXXXXXXXX
```

### .env.test (테스트 환경)

```env
# 테스트 환경 설정
VITE_API_BASE_URL=http://localhost:3001/api
VITE_ENABLE_DEVTOOLS=false
VITE_LOG_LEVEL=silent
VITE_FEATURE_ANALYTICS=false
VITE_FEATURE_ERROR_TRACKING=false
```

## 💡 사용 팁

### 1. 민감한 정보 관리

```bash
# .env.local 파일에 민감한 정보 저장
VITE_API_KEY=your-secret-api-key
VITE_GOOGLE_CLIENT_ID=your-google-client-id
```

### 2. 환경 확인

```typescript
// 현재 환경 확인
console.log('Current mode:', import.meta.env.MODE);
console.log('Is development:', import.meta.env.DEV);
console.log('Is production:', import.meta.env.PROD);
```

### 3. 조건부 설정

```typescript
// 환경별 조건부 설정
const apiUrl = import.meta.env.DEV
  ? 'http://localhost:3000/api'
  : import.meta.env.VITE_API_BASE_URL;
```

### 4. 환경 변수 검증

```typescript
// 필수 환경 변수 검증
if (!import.meta.env.VITE_API_BASE_URL) {
  throw new Error('VITE_API_BASE_URL is required');
}
```

## 🚨 주의사항

1. **VITE\_ 접두사 필수**: 클라이언트에서 접근할 환경 변수는 `VITE_` 접두사가 필요합니다.

2. **민감한 정보 노출**: 모든 `VITE_` 환경 변수는 클라이언트 번들에 포함되므로 민감한 정보를 포함하면 안 됩니다.

3. **.env.local 파일**: 개발자 개인 설정은 `.env.local`에 저장하고 git에 커밋하지 않습니다.

4. **타입 안전성**: TypeScript 사용 시 환경 변수 타입을 정의하여 안전하게 사용합니다.

## 🔄 환경 전환 워크플로우

```bash
# 1. 로컬 개발
yarn dev

# 2. 개발 서버 테스트
yarn dev:development

# 3. 스테이징 배포 테스트
yarn build:staging
yarn preview:staging

# 4. 프로덕션 배포
yarn build:production
yarn preview:production
```

이렇게 환경별로 격리하여 개발하면 각 환경에서 다른 설정을 안전하게 사용할 수 있습니다! 🎯
