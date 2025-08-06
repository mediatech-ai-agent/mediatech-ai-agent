# Multi-stage build: Node.js로 빌드 후 Nginx로 서빙
FROM node:22 AS builder

# 작업 디렉토리 설정
WORKDIR /app

# Corepack 활성화 (Yarn 4.9.1 사용)
RUN corepack enable

# package.json, .yarnrc.yml, yarn.lock 복사
COPY package.json .yarnrc.yml yarn.lock ./

# Yarn 캐시 권한 문제 방지를 위한 환경 변수 설정
ENV YARN_CACHE_FOLDER=/tmp/.yarn-cache
ENV YARN_ENABLE_GLOBAL_CACHE=false

# 의존성 설치
RUN yarn install --frozen-lockfile

# 소스 코드 복사
COPY . .

# 프로덕션 빌드
RUN yarn build:production

# 빌드 결과 확인
RUN ls -la /app/dist && echo "Build successful: dist folder found" || (echo "Build failed: dist folder not found" && exit 1)

# Production stage: Nginx로 정적 파일 서빙
FROM nginx:alpine

# 빌드된 파일을 Nginx 디렉토리로 복사
COPY --from=builder /app/dist /app/dist

# Nginx 설정 파일 복사
COPY nginx.conf /etc/nginx/conf.d/default.conf

# 포트 노출
EXPOSE 3001

# Nginx 실행
CMD ["nginx", "-g", "daemon off;"]