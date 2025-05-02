FROM node:20 as builder

# 빌드 작업
WORKDIR /app
COPY ./client/package.json ./client/package-lock.json ./
RUN npm install
COPY ./client ./
RUN npm run build

# React 앱을 직접 실행
FROM node:20

WORKDIR /app

# 빌드된 파일을 복사
COPY --from=builder /app/dist /app/dist

# React 앱을 실행
CMD ["npx", "serve", "-s", "dist", "-l", "5173"]
EXPOSE 5173
