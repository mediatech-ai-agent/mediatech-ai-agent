# Node.js 22 LTS 이미지 사용 (Alpine 대신 일반 이미지로 네이티브 모듈 호환성 확보)
FROM node:22

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

# 빌드 결과 확인 (빌드 실패 시 Docker 빌드도 실패)
RUN ls -la /app/dist && echo "Build successful: dist folder found" || (echo "Build failed: dist folder not found" && exit 1)

# PM2와 serve를 글로벌 설치
RUN npm install -g pm2 serve

# 포트 노출
EXPOSE 3001

# PM2 설정 파일 복사
COPY ecosystem.config.cjs .

# PM2로 애플리케이션 시작
CMD ["pm2-runtime", "start", "ecosystem.config.cjs"]