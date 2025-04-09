// vite, express 두 서버 동시 실행용
// npm install concurrently --save-dev

// 서버 코드 변경 시 자동 재실행 install
// npm install --save-dev nodemon
// 서버 코드 변경 시 자동 재실행
// npx nodemon index.js

// express 모듈을 불러옴 (웹 서버 프레임워크)
import express from 'express';

// CORS(Cross-Origin Resource Sharing) 설정을 위한 모듈
import cors from 'cors';

// path와 fs/promises 모듈로 라우터 자동 로딩
import path from 'path';
import { readdir } from 'fs/promises';
import { fileURLToPath, pathToFileURL } from 'url';

// Express 애플리케이션 생성
const app = express();

// 서버가 실행될 포트 번호
const PORT = 5000;

// __dirname 대체 (ESM 환경에서)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// CORS 허용 설정 (다른 도메인에서 API 접근 가능하도록 허용)
app.use(cors());

// JSON 파싱을 위한 미들웨어 (요청 본문이 JSON일 때 자동으로 파싱해줌)
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// "routes" 디렉토리 내 라우터 파일 자동 로딩
const loadRoutes = async () => {
    const routesDir = path.join(__dirname, 'routes');
    const files = await readdir(routesDir);

    for (const file of files) {
        if (file.endsWith('.js')) {
            try {
                const modulePath = pathToFileURL(path.join(routesDir, file)).href;
                const module = await import(modulePath);
                const route = module.default;
                const routePath = `/api/${file.replace('Router.js', '')}`;
                app.use(routePath, route);
                console.log(`📦 라우터 등록됨: ${routePath}`);
            } catch (err) {
                console.error(`❌ 라우터 로딩 실패: ${file}`, err);
            }
        }
    }
};

// 라우터 로딩 후 서버 시작
loadRoutes().then(() => {
    app.listen(PORT, () => {
        console.log(`🚀 서버 실행 중: http://localhost:${PORT}`);
    });
});