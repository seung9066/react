import { useState, useEffect, useRef } from 'react'
import * as utils from '@utils';

import SggGridReact from '@components/SggGridReact';

function Crawling( props ) {
    const [crawlingData, setCrawlingData] = useState([]);
    const [url, setUrl] = useState('');
    const [ul, setUl] = useState([]);
    const [crawlingArr, setCrawlingArr] = useState([]);
    const excelGrid = useRef(null);
    const [imgArr, setImgArr] = useState([]);

    // 그리드 컬럼
    const columns = [
        {key:'name', name:'상품명'},
        {key:'price', name:'가격', width: 20},
        {key:'imgSrc', name:'이미지', type:'image', width: 20},
    ];

    const [btnDisabled, setBtnDisabled] = useState({
        excelBtn: true,
        imageBtn: true,
    });

    // js 기반 페이지 puppeteer
    const getCrawlingCheerio = async () => {
        const urlPath = url || 'https://smartstore.naver.com/dwantae';
        await utils.postAxios('/crawling/crawlCheerio', {url : urlPath}).then((res) => {
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
        await utils.postAxios('/crawling/crawlPuppeteer', {url : urlPath}).then((res) => {
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
        await utils.postAxios('/crawling/crawlPuppeteerControl', {url : urlPath}).then((res) => {
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
        await utils.postAxios('/crawling/crawlPythonSmartStore', {url : urlPath}).then((res) => {
            if (res.msg === 'success') {
                let data = res.data;
                setUl(data.ul);
                setCrawlingData(data.content);
                utils.showToast('정보를 크롤링 했습니다.');
            } else {
                utils.showToast('puppeteer control 크롤링 정보를 가져오는 중 오류가 발생했습니다.', res.error);
            }
        });
    }

    const findLi = (data) => {
        const imgClass = '_25CKxIKjAk';
        const imgArr = data.split('<img class="' + imgClass + '" ');
        const dataArr = [];
        for (const item of imgArr) {
            if (item.indexOf('src="') > -1) {
                const wonStartStr = '<span class="_2DywKu0J_8">';
                const wonEndStr = '</span>원</strong>';
                const wonStartIdx = item.indexOf(wonStartStr) + wonStartStr.length;
                const wonEndIdx = item.indexOf(wonEndStr);
                const won = item.substring(wonStartIdx, wonEndIdx)

                const srcStartStr = 'src="';
                const srcEndStr = '" alt="';
                const srcStartIdx = item.indexOf(srcStartStr) + srcStartStr.length;
                const srcEndIdx = item.indexOf(srcEndStr);
                const src = item.substring(srcStartIdx, srcEndIdx);

                const altStartStr = 'alt="';
                const altEndStr = '"></div></div>';
                const altStartIdx = item.indexOf(altStartStr) + altStartStr.length;
                const altEndIdx = item.indexOf(altEndStr);
                const alt = item.substring(altStartIdx, altEndIdx);

                const dataObj = {imgSrc: src, name: alt, price: won};
                if (dataArr.length >= 10) {
                    break;
                } else {
                    dataArr.push(dataObj);
                }
            }
        }

        setCrawlingArr(dataArr);
    }

    const downloadExcel = (e) => {
        const excelName = url.replace('https://', '') || 'smartstore.naver.com/dwantae';
        utils.excelJSDown(excelGrid, url || excelName, setImgArr);
    }

    const downloadImg = (e) => {
        for (let i = 0; i < imgArr.length; i++) {
            utils.base64ToImage(imgArr[i], crawlingArr[i].name);
        }
    }

    const imageToBase64 = async () => {
        if (crawlingArr.length > 0) {
            const arr = [];
            for (const item of crawlingArr) {
                if (item.imgSrc) {
                    arr.push(await utils.imageToBase64(item.imgSrc));
                }
            }
            
            if (arr.length > 0) {
                setImgArr(arr);
            }
        }
    }

    const doSave = (e) => {
        
    }

    useEffect(() => {
        if (ul.length > 0) {
            findLi(ul[1]);
        }
    }, [ul]);

    useEffect(() => {
        if (crawlingArr.length > 0) {
            setBtnDisabled((prev) => ({
                ...prev,
                excelBtn: false,
            }))
            imageToBase64();
        } else {
            setBtnDisabled((prev) => ({
                ...prev,
                excelBtn: true,
            }))
        }
    }, [crawlingArr]);

    useEffect(() => {
        if (imgArr.length > 0) {
            setBtnDisabled((prev) => ({
                ...prev,
                imageBtn: false,
            }));
        } else {
            setBtnDisabled((prev) => ({
                ...prev,
                imageBtn: true,
            }));
        }
    }, [imgArr]);

    return (
        <>
            <div>
                <label htmlFor='smartId'>스마트스토어</label>
                <input type="text" id='smartId' style={{width: '20%'}} value={url} onChange={(e) => {setUrl(e.target.value)}} placeholder='https://smartstore.naver.com/dwantae'></input>
            </div>
            <div>
                {/* <button className='button' onClick={getCrawlingPuppeteerControl}>node(Puppeteer)</button>
                <button className='button' onClick={getCrawlingPuppeteer}>node(Puppeteer)</button>
                <button className='button' onClick={getCrawlingCheerio}>node(Cheerio)</button> */}
                {/* <button className='button' onClick={getCrawlingPython}>python(chromedriver) 스마트스토어</button> */}
            </div>
            <div>
                <button className='button' onClick={getCrawlingPython}>python(chromedriver) 스마트스토어</button>
                <button type="button" className='button primary' onClick={(e) => downloadExcel(e)} disabled={btnDisabled.excelBtn}>엑셀</button>
                <button type="button" className='button secondary' onClick={(e) => downloadImg(e)} disabled={btnDisabled.imageBtn}>이미지</button>
                <SggGridReact 
                    sggRef={excelGrid}
                    sggColumns={columns} // 그리드 컬럼 Array
                    sggBtn={{'c': false, 'r': true, 'u': false, 'd': false, saveBtn : doSave}} // 그리드 위 행 CRUD 버튼, c/r/u/d boolean, saveBtn fnc
                    sggData={{gridData: crawlingArr}} // 데이터 state, 적용(저장) 버튼 시 setState, 총 수 (앞단 페이징일 경우 필요 X) state
                    // sggSearchParam={{searchForm: searchForm, setSearchParam: setSearchParam, doSearch: doSearch}} // 검색조건 입력 폼 Array, 검색조건 setState, 검색 조회 버튼 fnc {3개는 세트로 하나 있으면 다 있어야함}
                    // sggGridChecked={true} // 그리드 좌측 체크박스 boolean
                    sggGridFormChange={{resize: true, headerMove: true, rowMove: true}} // 컬럼 리사이징 boolean, 컬럼 이동 boolean, 행 이동 boolean
                    sggPaging={false} // 페이징 여부 boolean
                    sggTrOnClick={(e, item) => {console.log(item)}} // 행 클릭 시 fnc
                    // sggTrOnDoubleClick={(e, item) => {console.log(e)}} // 행 더블 클릭 시 fnc
                />
            </div>
        </>
    );
}

export default Crawling;
