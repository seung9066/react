// express 모듈을 불러옴
import express from 'express';

// 파일 시스템 접근을 위한 fs 모듈 불러옴
import fs from 'fs';
import { readdir, readFile } from 'fs/promises';

// 경로 조작을 위한 path 모듈 불러옴
import path from 'path';

import { fileURLToPath } from 'url';

// express의 라우터 인스턴스 생성
const router = express.Router();

// menu.json 파일의 절대 경로를 설정 (서버 기준으로 접근 가능해야 함)

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const foldersRoot = path.join(__dirname, '..', '..', 'data', 'cbt');

// 목록 가져오기
router.get('/getList', (req, res) => {
    try {
        const folderPath = foldersRoot;

        fs.readdir(folderPath, (err, files) => {
            if (err) {
                console.error('디렉터리 읽기 실패:', err);
                return res.status(500).json({ error: '디렉터리 읽기 실패' });
            }

            const jsonFiles = files.filter(file => path.extname(file) === '.json');
            res.json(jsonFiles);
        });

    } catch (err) {
        console.error('목록 오류:', err);
        res.status(500).send('서버 오류');
    }
});

router.get('/getListData', async (req, res) => {
    try {
        const folderPath = foldersRoot;

        const files = await readdir(folderPath);
        const jsonFiles = files.filter(file => path.extname(file) === '.json');

        const jsonFileArr = [];

        for (const file of jsonFiles) {
            const filePath = path.join(folderPath, file);
            const jsonData = await readFile(filePath, 'utf-8');
            jsonFileArr.push(JSON.parse(jsonData));
        }

        res.json(jsonFileArr);
    } catch (err) {
        console.error('목록 오류:', err);
        res.status(500).send('서버 오류');
    }
});

// GET: menu.json 데이터 읽기
router.get('/getData', (req, res) => {
    try {
        const fileName = req.query.title + '.json';
        const folderPath = foldersRoot;
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
        const title = req.body.title + '.json';
        const fileName = title;
        const folderPath = foldersRoot;
        const filePath = path.join(folderPath, fileName);

        fs.mkdir(folderPath, { recursive: true }, (err) => {
            if (err) {
                console.error('Error creating folder:', err);
                return res.status(500).json({ message: 'Failed to create folder' });
            }
            fs.writeFileSync(filePath, JSON.stringify(req.body.data, null, 4));
            res.status(200).json({ message: '저장 완료' });
        });
    } catch (err) {
        console.error('저장 중 오류:', err);
        res.status(500).send('서버 에러');
    }
});

// DELETE: 특정 json 파일 삭제
router.delete('/deleteData', (req, res) => {
    try {
        const dataArr = req.body.data;
        let check = 0;
        for (const item of dataArr) {
            const title = item.fileName + '.json';
            const fileName = title;
            const folderPath = foldersRoot;
            const filePath = path.join(folderPath, fileName);
            
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
                check++;
            } else {
                check--;
            }
        }
        
        if (check === dataArr.length) {
            res.status(200).json({ message: '삭제 완료' });
        } else {
            res.status(404).json({ message: '파일이 존재하지 않습니다.' });
        }
    } catch (err) {
        console.error('삭제 중 오류:', err);
        res.status(500).send('서버 에러');
    }
});


// 라우터 모듈 외부로 내보냄 (다른 곳에서 import 가능)
export default router;
