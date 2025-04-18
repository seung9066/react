// express 모듈을 불러옴
import express from 'express';

import api from '../setting/axios.js';

// express의 라우터 인스턴스 생성
const router = express.Router();

api.interceptors.request.use((config) => {
    if (config.url.includes('/spring')) {
        config.url = config.url.replace('/spring', ''); // URL에서 '/spring' 제거
    } else {
        config.url = '/spring' + config.url;
    }

    return config;
}), (error) => {
    return Promise.reject(error);
}

router.get('/userList', async (req, res) => {
    try {
        const response = await api.get('/user/userList', {
            params: req.query // 요청 쿼리 파라미터를 전달
        });
        res.json(response.data);
    } catch (error) {
        console.error('Error fetching user data:', error);
        res.status(500).send('Error fetching user data');
    }
});

// 라우터 모듈 외부로 내보냄 (다른 곳에서 import 가능)
export default router;
