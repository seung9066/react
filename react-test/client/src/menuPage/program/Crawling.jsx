import { useState, useEffect } from 'react'
import * as utils from '@utils';

import SggGridReact from '@components/SggGridReact';

function Crawling( props ) {
    const [crawlingData, setCrawlingData] = useState([]);
    const [url, setUrl] = useState('');

    // js 기반 페이지 puppeteer
    const getCrawlingCheerio = async () => {
        const urlPath = url || 'https://smartstore.naver.com/dwantae';
        utils.postAxios('/crawling/crawlCheerio', {url : urlPath}).then((res) => {
            if (res.msg === 'success') {
                let data = res.data;
                setCrawlingData(data);
            } else {
                utils.showToast('cheerio 크롤링 정보를 가져오는 중 오류가 발생했습니다.', res.error);
            }
        });
    }

    // js 기반 페이지 puppeteer
    const getCrawlingPuppeteer = async () => {
        const urlPath = url || 'https://smartstore.naver.com/dwantae';
        utils.postAxios('/crawling/crawlPuppeteer', {url : urlPath}).then((res) => {
            if (res.msg === 'success') {
                let data = res.data;
                setCrawlingData(data);
            } else {
                utils.showToast('puppeteer 크롤링 정보를 가져오는 중 오류가 발생했습니다.', res.error);
            }
        });
    }

    // js 기반 페이지 puppeteer
    const getCrawlingPuppeteerControl = async () => {
        const urlPath = url || 'https://smartstore.naver.com/dwantae';
        utils.postAxios('/crawling/crawlPuppeteerControl', {url : urlPath}).then((res) => {
            if (res.msg === 'success') {
                let data = res.data;
                setCrawlingData(data);
            } else {
                utils.showToast('puppeteer control 크롤링 정보를 가져오는 중 오류가 발생했습니다.', res.error);
            }
        });
    }

    // python 크롤링
    const getCrawlingPython = async() => {
        const urlPath = url || 'https://smartstore.naver.com/dwantae';
        utils.postAxios('/crawling/crawlPython', {url : urlPath}).then((res) => {
            if (res.msg === 'success') {
                let data = res.data;
                setCrawlingData(data);
            } else {
                utils.showToast('puppeteer control 크롤링 정보를 가져오는 중 오류가 발생했습니다.', res.error);
            }
        });
    }

    useEffect(() => {
        if (crawlingData.length > 0) {
            console.log(crawlingData)
        }
    }, [crawlingData]);

    return (
        <>
            <div>
                <input type="text" style={{width: '20%'}} value={url} onChange={(e) => {setUrl(e.target.value)}} placeholder='https://smartstore.naver.com/dwantae'></input>
            </div>
            <div>
                <button className='button' onClick={getCrawlingPuppeteerControl}>node(Puppeteer)</button>
                <button className='button' onClick={getCrawlingPuppeteer}>node(Puppeteer)</button>
                <button className='button' onClick={getCrawlingCheerio}>node(Cheerio)</button>
                <button className='button' onClick={getCrawlingPython}>python(chromedriver)</button>
            </div>
        </>
    );
}

export default Crawling;
