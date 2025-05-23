// vite, express 두 서버 동시 실행용
// npm install concurrently --save-dev

// 서버 코드 변경 시 자동 재실행 install
// npm install --save-dev nodemon
// 서버 코드 변경 시 자동 재실행
// npx nodemon index.js

// express 모듈을 불러옴 (웹 서버 프레임워크)
import express from 'express';
import session from 'express-session';
import FileStoreFactory from 'session-file-store';

// CORS(Cross-Origin Resource Sharing) 설정을 위한 모듈
import cors from 'cors';
import os from "os";

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
const sessionDir = path.join(__dirname, '..', 'data', 'session');

const FileStore = FileStoreFactory(session);

function getLocalIP() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
      for (const iface of interfaces[name]) {
          // 내부 주소 및 IPv6 제외
          if (iface.family === 'IPv4' && !iface.internal) {
              return iface.address;
          }
      }
  }
  return 'localhost';
}

// CORS 허용 설정 (다른 도메인에서 API 접근 가능하도록 허용)
app.use(cors({
    origin: `http://${getLocalIP()}:5173`, // 클라이언트 주소
    credentials: true // ✅ 쿠키 허용
}));

// JSON 파싱을 위한 미들웨어 (요청 본문이 JSON일 때 자동으로 파싱해줌)
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use(session({
    store: new FileStore({
        path: sessionDir,
        ttl: 60 * 60 * 24, // 세션 저장 시간 (초 단위)
        retries: 1, // 세션 저장 실패 시 재시도 횟수
        logFn: function() {}
    }), 
    secret: 'SD1933GB357BG',  // 세션 ID를 암호화하는 데 사용되는 비밀 키
    resave: false,              // 세션을 항상 저장할지 여부 (변경이 없어도 저장)
    saveUninitialized: false,   // 세션이 초기화되지 않은 경우에도 저장할지 여부
    cookie: {
      secure: false,            // HTTPS 사용시 true로 설정, http에서는 false
      maxAge: 1000 * 60 * 60  // 세션 쿠키의 만료 시간 (1시간)
    },
    rolling: true // 요청마다 maxAge 초기화
  }));

// "routes" 디렉토리 내 라우터 파일 자동 로딩
const loadRoutes = async () => {
    // "routes" 디렉토리 경로 설정
    const routesDir = path.join(__dirname, 'routes');

    // routes 폴더 내 파일들을 비동기적으로 읽어옴
    const files = await readdir(routesDir);

    for (const file of files) {
        // .js로 끝나는 파일만 처리 (라우터 파일로 간주)
        if (file.endsWith('.js')) {
            try {
                // ESM 환경에서는 파일 경로를 file:// URL로 변환해야 import 가능
                const modulePath = pathToFileURL(path.join(routesDir, file)).href;

                // 모듈을 동적으로 import
                const module = await import(modulePath);

                // 모듈의 default export를 라우터로 사용
                const route = module.default;

                // 파일 이름에서 'Router.js' 제거 → 라우트 경로 설정
                const routePath = `/api/${file.replace('Router.js', '')}`;

                // 해당 라우트를 Express 앱에 등록
                app.use(routePath, route);

                console.log(`라우터 등록됨: ${routePath}`);
            } catch (err) {
                // 모듈 로딩에 실패한 경우 에러 출력
                console.error(`라우터 로딩 실패: ${file}`, err);
            }
        }
    }
};

app.use((req, res, next) => {
    console.log(req.method, req.url); // 요청 정보 출력
    next();
});

// 라우터 로딩 후 서버 시작
loadRoutes().then(() => {
    app.listen(PORT, () => {
        console.log(`🚀 서버 실행 중: http://${getLocalIP()}:${PORT}`);
    });
});