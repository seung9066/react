# React 빌드 단계
FROM node:20 AS builder
WORKDIR /app

COPY ./client/package*.json ./
RUN npm install

COPY ./client ./
RUN npm run build || (echo "❌ 빌드 실패!" && cat /app/dist/index.html || true)
