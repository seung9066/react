# client/Dockerfile

FROM node:20 AS builder

WORKDIR /app

# 현재 디렉토리 기준이므로 ./package.json
COPY package.json package-lock.json ./

RUN npm install --legacy-peer-deps

# 전체 소스 복사
COPY . .

RUN npm run build || (echo "❌ 빌드 실패!" && cat /app/dist/index.html || true)