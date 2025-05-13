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
        // 유저 정보 세션 저장
        const data = response.data;
        req.session.userData = data;

        const pageAuth = req.query.auth;
        const returnData = {};

        if (data) {
            const auth = data.userAuth;
            const passwordCheck = data.passwordCheck;
            const loginCnt = data.loginCnt;
            console.log(data)
            
            if (passwordCheck !== 'Y') {
                returnData.msg = 'failed';
                returnData.data = '비밀번호를 확인해주세요.';
            } else if (auth === '000') {
                returnData.msg = 'failed';
                returnData.data = '탈퇴한 회원입니다.';
            } else if (Number(loginCnt) >= 5) {
                returnData.msg = 'failed';
                returnData.data = '비밀번호 5회 오류. 관리자 문의';
            } else if (pageAuth && Number(auth) < Number(pageAuth)) {
                returnData.msg = 'failed';
                returnData.data = '권한 부족';
            } else {
                returnData.msg = 'success';
                returnData.data = true;
            }
        } else {
            returnData.msg = 'failed';
            returnData.data = '아이디를 확인해주세요.';
        }
        
        return res.json(returnData);
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
