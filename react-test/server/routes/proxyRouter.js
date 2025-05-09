// express 모듈을 불러옴
import express from 'express';
import axios from 'axios';

// express의 라우터 인스턴스 생성
const router = express.Router();

router.get('/proxy-image', async (req, res) => {
    const imageUrl = req.query.url;
    if (!imageUrl) return res.status(400).json({ error: 'Missing url parameter' });

    try {
        const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
        const contentType = response.headers['content-type'] || 'image/png';
        const base64 = Buffer.from(response.data, 'binary').toString('base64');
        res.json({
            base64: `data:${contentType};base64,${base64}`
        });
    } catch (error) {
        console.error('Image proxy error:', error.message);
        res.status(500).json({ error: 'Failed to fetch image' });
    }
});

router.post('/proxy-imageArr', async (req, res) => {
    const imageUrlArr = req.body.arr;
    if (!imageUrlArr) return res.status(400).json({ error: 'Missing url parameter' });

    try {
        const arr = [];
        for (const item of imageUrlArr) {
            const response = await axios.get(item, { responseType: 'arraybuffer' });
            const contentType = response.headers['content-type'] || 'image/png';
            const base64 = Buffer.from(response.data, 'binary').toString('base64');
            arr.push(`data:${contentType};base64,${base64}`);
        }
        res.json({
            base64Arr: arr
        });
    } catch (error) {
        console.error('Image proxy error:', error.message);
        res.status(500).json({ error });
    }
});

// 라우터 모듈 외부로 내보냄 (다른 곳에서 import 가능)
export default router;
