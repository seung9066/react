# 빌드 단계
FROM node:20 AS builder
WORKDIR /app
COPY . .
RUN npm install && npm run build

# 서빙 단계 (nginx 사용)
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 5173
CMD ["nginx", "-g", "daemon off;"]
