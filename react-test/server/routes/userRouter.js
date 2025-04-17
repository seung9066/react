// express 모듈을 불러옴
import express from 'express';

import api from '../setting/axios.js';

// express의 라우터 인스턴스 생성
const router = express.Router();

// Express 애플리케이션 생성
const app = express();

app.get('api/getUser', async (req, res) => {
    try {
        const response = await api.get('/getUser');
        res.json(response.data);
    } catch (error) {
        console.error('Error fetching user data:', error);
        res.status(500).send('Error fetching user data');
    }
});

// 라우터 모듈 외부로 내보냄 (다른 곳에서 import 가능)
export default router;
