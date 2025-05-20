// express 모듈을 불러옴
import express from 'express';

// 파일 시스템 접근을 위한 fs 모듈 불러옴
import fs from 'fs';

// 경로 조작을 위한 path 모듈 불러옴
import path from 'path';

import { fileURLToPath } from 'url';

// express의 라우터 인스턴스 생성
const router = express.Router();

// menu.json 파일의 절대 경로를 설정 (서버 기준으로 접근 가능해야 함)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataPath = path.join(__dirname, '..', '..', 'data', 'menu.json');

// GET: menu.json 데이터 읽기
router.get('/getMenu', (req, res) => {
    try {
        const jsonData = fs.readFileSync(dataPath, 'utf-8');
        const parsedData = JSON.parse(jsonData);
        res.json(parsedData);
    } catch (err) {
        console.error('menu.json 읽기 오류:', err);
        res.status(500).send('서버 오류');
    }
});

// POST: menu.json 파일 저장
router.post('/updateMenu', (req, res) => {
    try {
        fs.writeFileSync(dataPath, JSON.stringify(req.body, null, 4));
        res.status(200).json({ message: '메뉴 저장 완료' });
    } catch (err) {
        console.error('menu.json 저장 중 오류:', err);
        res.status(500).send('서버 에러');
    }
});



// 라우터 모듈 외부로 내보냄 (다른 곳에서 import 가능)
export default router;
