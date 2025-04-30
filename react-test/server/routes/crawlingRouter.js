// express 모듈을 불러옴
import express from 'express';

import api from '../setting/axios.js';

import * as cheerio from 'cheerio';

import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';

puppeteer.use(StealthPlugin());

// express의 라우터 인스턴스 생성
const router = express.Router();

router.post('/crawlCheerio', async (req, res) => {
    try {
        const { url } = req.body; // 🔄 POST 데이터 추출
        const response = await api.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/119.0.0.0 Safari/537.36'
            }
        });
        const $ = cheerio.load(response.data);
        const result = [];
        
        $('a').each((_, el) => {
            result.push({
                title: $(el).text(),
                url: $(el).attr('href'),
            });
        });

        res.json(response.data)
    } catch (error) {
        console.error('Error fetching user data:', error.message);
        res.status(500).send('Error fetching user data');
    }
});

router.post('/crawlPuppeteer', async (req, res) => {
    const { url } = req.body;
    try {
        const browser = await puppeteer.launch({ headless: true });
        const page = await browser.newPage();
        
        // 헤더 설정
        await page.setRequestInterception(true);
        page.on('request', (request) => {
            if (request.resourceType() === 'document') {
                request.continue({
                    headers: {
                        ...request.headers(),
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                    }
                });
            } else {
                request.continue();
            }
        });
        
        await page.goto(url, { waitUntil: 'networkidle2' });
        
        const content = await page.content();
        await browser.close();
        
        res.json(content);
    } catch (err) {
        console.error(err);
        res.status(500).send('크롤링 실패');
    }
});

router.post('/crawlPuppeteerControl', async (req, res) => {
    const { url } = req.body;
    
    try {
        const browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox'],
        });
        
        const page = await browser.newPage();
        
        // 브라우저처럼 보이도록 설정
        await page.setUserAgent(
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ' +
            '(KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36'
        );
        await page.setExtraHTTPHeaders({
            'accept-language': 'ko-KR,ko;q=0.9',
        });
        
        await page.setViewport({ width: 1200, height: 800 });
        await page.emulateTimezone('Asia/Seoul');
        
        await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });
        
        // 현재 URL 확인 (에러 페이지로 이동했는지 확인)
        const currentUrl = page.url();

        if (currentUrl.includes('error') || currentUrl.includes('AccessDenied')) {
            await page.screenshot({ path: 'error_page.png' });
            throw new Error('에러 페이지로 리디렉션됨');
        }
        
        const content = await page.content();
        await browser.close();
        
        res.send(content);
    } catch (err) {
        console.error(err);
        res.status(500).send('크롤링 실패: ' + err.message);
    }
});

router.post('/crawlPythonSmartStore', async (req, res) => {
    try {
        const response = await api.post('/python/crawlSmartStore', req.body);
        res.json(response.data);
    } catch (error) {
        console.error('Error fetching user data:', error);
        res.status(500).send('Error fetching user data');
    }
});

router.post('/crawlPythonTaobao', async (req, res) => {
    try {
        const response = await api.post('/python/crawlTaobao');
        res.json(response.data);
    } catch (error) {
        console.error('Error fetching user data:', error);
        res.status(500).send('Error fetching user data');
    }
});

router.post('/crawlPythonKeyword', async (req, res) => {
    try {
        const response = await api.post('/python/crawlKeyword', req.body);
        res.json(response.data);
    } catch (error) {
        console.error('Error fetching user data:', error);
        res.status(500).send('Error fetching user data');
    }
});

// 라우터 모듈 외부로 내보냄 (다른 곳에서 import 가능)
export default router;
