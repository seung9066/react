import express from 'express';
import multer from 'multer';
import pdfParse from 'pdf-parse';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import pkg from 'pdfjs-dist';
const { getDocument } = pkg;


// __dirname 대체
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const foldersRoot = path.join(__dirname, '..', '..', 'data', 'pdf');

// 업로드 폴더가 존재하지 않으면 생성
import fsSync from 'fs';
if (!fsSync.existsSync(foldersRoot)) {
    fsSync.mkdirSync(foldersRoot, { recursive: true });
}

const options = {
    format: 'png',    // 이미지 형식 (png, jpg 등)
    out_dir: foldersRoot,   // 출력 디렉토리
    out_prefix: 'page',    // 출력 파일 접두어
    page: null         // 모든 페이지를 변환하려면 null로 설정
};

// express의 라우터 인스턴스 생성
const router = express.Router();

// multer 설정 - 파일명에 타임스탬프 추가하여 중복 방지
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, foldersRoot);  // 업로드 파일 저장 위치
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));  // 타임스탬프를 붙여 파일명 중복 방지
    }
});

const upload = multer({ storage: storage });

async function extractImagesFromPDF(pdfPath) {
    try {
        // PDF 파일을 읽어오기
        const pdfBuffer = await fs.readFile(pdfPath);
        const loadingTask = getDocument({ data: pdfBuffer });
        const pdfDoc = await loadingTask.promise;

        const images = [];

        // 모든 페이지에서 이미지 추출
        for (let i = 1; i <= pdfDoc.numPages; i++) {
            const page = await pdfDoc.getPage(i);

            // PDF에서 페이지의 리소스를 가져옵니다.
            const resources = page.commonObjs;
            const xObjects = resources?.XObject;

            if (xObjects) {
                // XObject를 순회하면서 이미지 리소스를 찾습니다.
                for (const [key, obj] of Object.entries(xObjects)) {
                    if (obj && obj.subtype === 'Image') {
                        // 이미지 데이터 추출
                        const imageData = obj._data;

                        // 데이터를 base64로 변환
                        const base64Image = imageData.toString('base64');
                        images.push(`data:image/png;base64,${base64Image}`);
                    }
                }
            }
        }

        return images;
    } catch (error) {
        console.error('이미지 추출 오류:', error);
        return [];
    }
}

router.post('/uploadPdf', upload.single('pdf'), async (req, res) => {
    try {
        // 파일 경로 설정
        const filePath = path.resolve(foldersRoot, req.file.filename);

        const images = await extractImagesFromPDF(filePath);

        // try {
        //     const response = await poppler.convert(filePath, options);
        //     console.log('PDF 변환 완료:', response);
        //     console.log(response)
        // } catch (error) {
        //     console.error('변환 중 오류 발생:', error);
        // }

        // 파일 읽기
        const dataBuffer = await fs.readFile(filePath);

        // PDF 텍스트 파싱
        const data = await pdfParse(dataBuffer);

        // 사용 후 파일 삭제
        await fs.unlink(filePath);

        // 클라이언트에 텍스트와 페이지 수 응답
        res.send({
            text: data.text,
            pages: data.numpages,
            images: images
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('PDF 처리 오류');
    }
});

export default router;
