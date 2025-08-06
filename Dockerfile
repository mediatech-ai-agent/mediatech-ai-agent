# Node.js 22 LTS 이미지 사용
FROM node:22

# 작업 디렉토리 설정
WORKDIR /app

# package.json과 package-lock.json 복사
COPY package.json package-lock.json ./

# 의존성 설치
RUN npm ci --omit=dev

# 소스 코드 복사
COPY . .

# 프로덕션 빌드
RUN npm run build:production

# 빌드 결과 확인
RUN ls -la /app/dist

# PM2와 serve를 글로벌 설치
RUN npm install -g pm2 serve

# 포트 노출
EXPOSE 3001

# PM2 설정 파일 복사
COPY ecosystem.config.cjs .

# PM2로 애플리케이션 시작
CMD ["pm2-runtime", "start", "ecosystem.config.cjs"]