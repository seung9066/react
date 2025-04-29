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

// 폴더들을 저장할 루트 디렉토리
const fileName = 'Man_doesnt_use_a_database.json';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const foldersRoot = path.join(__dirname, '..', 'data');

const getFolderPath = (req) => {
    let ip = req.ip || req.connection.remoteAddress;

    // ::1 (IPv6 localhost) 처리
    if (ip === '::1') {
        ip = '127.0.0.1';
    }

    // ::ffff:192.168.0.10 이런 식으로 나올 수 있으니 IPv4로 변환
    if (ip.startsWith('::ffff:')) {
        ip = ip.substring(7);
    }

    ip = ip.replaceAll('.', '_');

    return path.join(foldersRoot, ip);
}

// GET: menu.json 데이터 읽기
router.get('/getData', (req, res) => {
    try {
        const folderPath = getFolderPath(req);
        const filePath = path.join(folderPath, fileName);

        fs.mkdir(folderPath, { recursive: true }, (err) => {
            if (err) {
                console.error('Error creating folder:', err);
                return res.status(500).json({ message: 'Failed to create folder' });
            }
            try {
                const jsonData = fs.readFileSync(filePath, 'utf-8');
                const parsedData = JSON.parse(jsonData);
                res.json(parsedData);
            } catch {
                res.status(500).json({ message: '파일이 없습니다.' })                
            }
        });

    } catch (err) {
        console.error('읽기 오류:', err);
        res.status(500).send('서버 오류');
    }
});

// POST: menu.json 파일 저장
router.post('/updateData', (req, res) => {
    try {
        const folderPath = getFolderPath(req);
        const filePath = path.join(folderPath, fileName);

        fs.mkdir(folderPath, { recursive: true }, (err) => {
            if (err) {
                console.error('Error creating folder:', err);
                return res.status(500).json({ message: 'Failed to create folder' });
            }
            fs.writeFileSync(filePath, JSON.stringify(req.body, null, 4));
            res.status(200).json({ message: '저장 완료' });
        });
    } catch (err) {
        console.error('저장 중 오류:', err);
        res.status(500).send('서버 에러');
    }
});



// 라우터 모듈 외부로 내보냄 (다른 곳에서 import 가능)
export default router;
