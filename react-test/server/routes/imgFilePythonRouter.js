// express 모듈을 불러옴
import express from 'express';

import api from '../setting/axios.js';

// express의 라우터 인스턴스 생성
const router = express.Router();

router.post('/pythonSaveImg', async (req, res) => {
    try {
        const response = await api.post('/python/uploadImg', req.body);
        res.json(response.data);
    } catch (error) {
        console.error('Error fetching user data:', error);
        res.status(500).send('Error fetching user data');
    }
})

router.post('/pythonDeleteImg', async (req, res) => {
    try {
        const response = await api.post('/python/deleteImg', req.body);
        res.json(response.data);
    } catch (error) {
        console.error('Error fetching user data:', error);
        res.status(500).send('Error fetching user data');
    }
})

// 라우터 모듈 외부로 내보냄 (다른 곳에서 import 가능)
export default router;
