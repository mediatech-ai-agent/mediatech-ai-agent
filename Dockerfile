# Node.js 22 LTS Alpine 이미지 사용
FROM node:22-alpine

# 작업 디렉토리 설정
WORKDIR /app

# Corepack 활성화 및 Yarn 설정
RUN corepack enable

# package.json과 yarn.lock 복사
COPY package.json yarn.lock ./

# 의존성 설치
RUN yarn install --frozen-lockfile

# 소스 코드 복사
COPY . .

# 프로덕션 빌드
RUN yarn build:production

# PM2와 serve를 글로벌 설치
RUN npm install -g pm2 serve

# 포트 노출
EXPOSE 3001

# PM2 설정 파일 복사
COPY ecosystem.config.js .

# PM2로 애플리케이션 시작
CMD ["pm2-runtime", "start", "ecosystem.config.js"]