// express 모듈을 불러옴
import express from 'express';

import api from '../setting/axios.js';

// express의 라우터 인스턴스 생성
const router = express.Router();

router.get('/login', async (req, res) => {
    try {
        const response = await api.get('/spring/login/login', {
            params: req.query // 요청 쿼리 파라미터를 전달
        });
        console.log(response.data)

        req.session.userData = response.data;
        
        return res.json(response.data);
    } catch (error) {
        console.error('Error fetching user data:', error);
        res.status(500).send('Error fetching user data');
    }
});

router.get('/logout', async (req, res) => {
    delete req.session.userData;

    return res.json({msg : 'success'});
})

// 라우터 모듈 외부로 내보냄 (다른 곳에서 import 가능)
export default router;
