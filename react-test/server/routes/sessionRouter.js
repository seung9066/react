import express from 'express';

const router = express.Router();

// 세션 유저 정보 저장
router.get('/getUserDataSession', (req, res) => {
    if (req.session?.userData) {
        return res.json(req.session.userData);
    } else {
        return res.json({msg : 'no session data'});
    }
});

// 로그아웃
router.get('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) return res.status(500).send("Logout failed");
        res.send('Logged out');
    });
});

// 라우터 모듈 외부로 내보냄 (다른 곳에서 import 가능)
export default router;

