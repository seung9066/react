# client/Dockerfile

FROM node:20 AS builder

WORKDIR /app

# 현재 디렉토리 기준이므로 ./package.json
COPY package.json package-lock.json ./
RUN npm install

# 전체 소스 복사
COPY . .

# 빌드
RUN npm run build
