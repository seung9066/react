// vite, express 두 서버 동시 실행용
// npm install concurrently --save-dev

// 서버 코드 변경 시 자동 재실행 install
// npm install --save-dev nodemon
// 서버 코드 변경 시 자동 재실행
// npx nodemon index.js

// express 모듈을 불러옴 (웹 서버 프레임워크)
import express from 'express';

// 메뉴 관련 라우터 파일을 불러옴
import menuRouter from './routes/menuRouter.js';

// urlDataNotice 관련 라우터 파일을 불러옴
import urlDataNoticeRouter from './routes/urlDataNoticeRouter.js';

// CORS(Cross-Origin Resource Sharing) 설정을 위한 모듈
import cors from 'cors';

// Express 애플리케이션 생성
const app = express();

// 서버가 실행될 포트 번호
const PORT = 5000;

// CORS 허용 설정 (다른 도메인에서 API 접근 가능하도록 허용)
app.use(cors());

// JSON 파싱을 위한 미들웨어 (요청 본문이 JSON일 때 자동으로 파싱해줌)
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// "/api/menu"로 시작하는 요청은 menuRouter에서 처리
app.use('/api/menu', menuRouter);

// "/api/menu"로 시작하는 요청은 urlDataNoticeRouter 처리
app.use('/api/urlDataNotice', urlDataNoticeRouter);

// 서버 실행 및 포트 5000에서 대기 시작
app.listen(PORT, () => {
    console.log(`서버 실행 중: http://localhost:${PORT}`);
});
