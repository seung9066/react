FROM node:20 as builder

# 빌드 작업
WORKDIR /app

# REACT-TEST/client 내의 package.json과 package-lock.json을 복사
COPY ./REACT-TEST/client/package.json ./REACT-TEST/client/package-lock.json ./

RUN npm install

# REACT-TEST/client 내의 나머지 파일들을 복사
COPY ./REACT-TEST/client ./
RUN npm run build

# 이후 nginx 또는 다른 설정들...
