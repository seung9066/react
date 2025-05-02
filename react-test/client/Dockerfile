# React 빌드 단계
FROM node:20 AS builder
WORKDIR /app

COPY ./react-test/client/package*.json ./
RUN npm install

# 예: Dockerfile이 react-test 폴더에 있고, build context는 그 상위(repo/)
COPY ./react-test/client ./ 
RUN npm run build || (echo "❌ 빌드 실패!" && cat /app/dist/index.html || true)
