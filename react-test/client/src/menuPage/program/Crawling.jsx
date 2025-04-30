import { useState, useEffect, useRef } from 'react'
import * as utils from '@utils';

import SggGridReact from '@components/SggGridReact';

function Crawling( props ) {
    const [pageType, setPageType] = useState('');
    const [crawlingData, setCrawlingData] = useState([]);
    const [urlId, setUrlId] = useState('');
    const [ul, setUl] = useState([]);
    const [crawlingArr, setCrawlingArr] = useState([]);
    const [keywordCrawlingArr, setKeywordCrawlingArr] = useState([]);
    const excelGrid = useRef(null);
    const [imgArr, setImgArr] = useState([]);
    const [startCrawling, setStartCrawling] = useState(0);
    const [keyword, setKeyword] = useState('');
    const [recommendKeywordArr, setRecommendKeywordArr] = useState([]);

    // 그리드 컬럼
    const [gridCol, setGridCol] = useState([]);

    const [btnDisabled, setBtnDisabled] = useState({
        excelBtn: true,
        imageBtn: true,
    });

    // js 기반 페이지 puppeteer
    const getCrawlingCheerio = async () => {
        const urlPath = urlId || 'https://smartstore.naver.com/dwantae';
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
        const urlPath = urlId || 'https://smartstore.naver.com/dwantae';
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
        const urlPath = urlId || 'https://smartstore.naver.com/dwantae';
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
        if (pageType === 'taobao') {
            const urlPath = urlId || 'https://smartstore.naver.com/dwantae';
            await utils.postAxios('/crawling/crawlPythonSmartStore', {url : urlPath}).then((res) => {
                if (res.msg === 'success') {
                    let data = res.data;
                    setUl(data.ul);
                    setCrawlingData(data.content);
                    setStartCrawling(1);
                    utils.showToast('스마트스토어 정보를 크롤링 했습니다.');
                } else {
                    utils.showToast('puppeteer control 크롤링 정보를 가져오는 중 오류가 발생했습니다.', res.error);
                }
            });
        }

        if (pageType === 'keyword') {
            const urlPath = 'https://search.shopping.naver.com/ns/search?query=' + (keyword || '공업용 선풍기');
            await utils.postAxios('/crawling/crawlPythonKeyword', {url : urlPath}).then((res) => {
                if (res.msg === 'success') {
                    let data = res.data;
                    findRepeatKeyword(data.text);
                    utils.showToast('키워드 정보를 크롤링 했습니다.');
                } else {
                    utils.showToast('puppeteer control 크롤링 정보를 가져오는 중 오류가 발생했습니다.', res.error);
                }
            });
        }
    }
    
    const getCrawlingPythonTaobao = async() => {
        const urlPath = 'https://www.taobao.com/';
        await utils.postAxios('/crawling/crawlPythonTaobao').then((res) => {
            if (res.msg === 'success') {
                let data = res.data;
                const newCrawlingArr = structuredClone(crawlingArr);
                for (let i = 0; i < newCrawlingArr.length; i++) {
                    newCrawlingArr[i].taobaoLink = 'http://www.naver.com'
                }

                setCrawlingArr(newCrawlingArr);
                utils.showToast('타오바오 정보를 크롤링 했습니다.');
            } else {
                utils.showToast('puppeteer control 크롤링 정보를 가져오는 중 오류가 발생했습니다.', res.error);
            }
        });
    }

    const findLi = (data) => {
        const imgClass = '_25CKxIKjAk';
        const imgArrData = data.split('<img class="' + imgClass + '" ');
        const dataArr = [];
        for (const item of imgArrData) {
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

    // 엑셀 저장
    const downloadExcel = (e) => {
        let excelName = '';

        if (pageType === 'taobao') {
            excelName = 'smartstore.naver.com_' + urlId || 'dwantae';
        }

        if (pageType === 'keyword') {
            excelName = 'keyword_' + keyword.replaceAll(' ', '_') || '공업용 선풍기';
        }
        utils.excelJSDown(excelGrid, urlId || excelName);
    }

    // 이미지 파일 저장
    const downloadImgBtn = (e) => {
        const crawlingNameArr = [];
        for (const item of crawlingArr) {
            crawlingNameArr.push(item.name);
        }

        utils.base64ToImage(imgArr, crawlingNameArr);
    }

    // 파이썬 서버 이미지 저장
    const downloadImg = async (e) => {
        const crawlingNameArr = [];
        for (const item of crawlingArr) {
            crawlingNameArr.push(item.name);
        }

        if (await utils.base64ToImageAndSend(imgArr, crawlingNameArr)) {
            getCrawlingPythonTaobao();
        };
    }

    // 파이썬 서버 이미지 삭제
    const deleteImg = async (e) => {
        const crawlingNameArr = [];
        for (const item of crawlingArr) {
            crawlingNameArr.push(item.name);
        }

        if (await utils.deleteImage(crawlingNameArr)) {

        }
    }

    // 이미지 경로 > base64 데이터로
    const imageSrcToBase64 = async () => {
        if (crawlingArr.length > 0) {
            const arr = [];
            for (const item of crawlingArr) {
                if (item.imgSrc) {
                    arr.push(await utils.imageSrcToBase64(item.imgSrc));
                }
            }
            
            if (arr.length > 0) {
                setImgArr(arr);
            }
        }
    }

    // 키워드 데이터 많이 나오는 문자열 찾기
    const findRepeatKeyword = (data) => {
        const keywordArr = [];

        // 단어뽑기기
        for (const item of data) {
            const itemArr = item.split(' ');
            for (const arrItem of itemArr) {
                let checkDuple = 0;
                for (const keywordItem of keywordArr) {
                    if (arrItem === keywordItem.keyword) {
                        checkDuple++;
                    }
                }

                if (checkDuple === 0) {
                    keywordArr.push({keyword : arrItem, cnt: 0});
                }
            }
        }

        // 카운팅팅
        for (const item of data) {
            const itemArr = item.split(' ');
            for (const arrItem of itemArr) {
                for (const keywordItem of keywordArr) {
                    if (arrItem === keywordItem.keyword) {
                        keywordItem.cnt++;
                    }
                }
            }
        }

        // 많은거 뽑기기
        const arr = [];
        for (const item of keywordArr) {
            if (item.cnt > 1) {
                item.productName = keyword || '공업용 선풍기';
                arr.push(item);
            }
        }

        const sortArr = [...arr].sort((a, b) => b.cnt - a.cnt);

        setKeywordCrawlingArr(sortArr);
    }

    // 키워드 tr doubleClick recommendKeywordArr 바꾸기
    const useRecommentKeyword = (item) => {
        const split = structuredClone(recommendKeywordArr);

        const text = typeof item === 'string' ? item : item.keyword;
        const push = typeof item === 'string' ? false : true;
        for (let i = 0; i < split.length; i++) {
            if (split[i] !== ' ' && split[i] === text) {
                split.splice(i, 1);
                i--;
            }
        }

        push ? split.push(text) : null;

        setRecommendKeywordArr(split);
    }

    useEffect(() => {
        if (ul.length > 0) {
            findLi(ul[1]);
        }
    }, [ul]);

    useEffect(() => {
        if (crawlingArr.length > 0) {
            imageSrcToBase64();
        }
    }, [crawlingArr]);

    useEffect(() => {
        if (imgArr.length > 0) {
            setBtnDisabled((prev) => ({
                ...prev,
                imageBtn: false,
            }));

            if (startCrawling > 0) {
                downloadImg();
                setStartCrawling(0);
            }
        } else {
            setBtnDisabled((prev) => ({
                ...prev,
                imageBtn: true,
            }));
            setStartCrawling(0);
        }
    }, [imgArr]);

    useEffect(() => {
        if (pageType === 'taobao') {
            const taobaoCol = [
                {key:'name', name:'상품명'},
                {key:'price', name:'가격', width: 20},
                {key:'imgSrc', name:'이미지', type:'image', width: 20},
                {key:'taobaoLink', name:'타오바오 링크', type: 'a'},
            ];
            setGridCol(taobaoCol);

            if (crawlingArr.length > 0) {
                setBtnDisabled((prev) => ({
                    ...prev,
                    excelBtn: false,
                }));
            } else {
                setBtnDisabled((prev) => ({
                    ...prev,
                    excelBtn: true,
                }));
            }
        } else if (pageType === 'keyword') {
            const keywordCol = [
                {key:'productName', name:'상품명', width: 40},
                {key:'keyword', name:'키워드'},
                {key:'cnt', name:'횟수', width: 20},
            ];
            setGridCol(keywordCol);

            if (keywordCrawlingArr.length > 0) {
                setBtnDisabled((prev) => ({
                    ...prev,
                    excelBtn: false,
                }));
            } else {
                setBtnDisabled((prev) => ({
                    ...prev,
                    excelBtn: true,
                }));
            }
        }
    }, [pageType])

    useEffect(() => {
        if (keywordCrawlingArr.length > 0) {
            let recommendTextArr = [];
            for (let i = 0; i < keywordCrawlingArr.length; i++) {
                if (i < 10) {
                    recommendTextArr.push(keywordCrawlingArr[i].keyword);
                }
            }
            setRecommendKeywordArr(recommendTextArr);
        }
    }, [keywordCrawlingArr])

    return (
        <>
            <div>
                <button type='button' className={'button' + (pageType === 'taobao' ? '' : ' secondary')} onClick={(e) => {setPageType('taobao')}}>타오바오</button>
                <button type='button' className={'button' + (pageType === 'keyword' ? '' : ' secondary')} onClick={(e) => {setPageType('keyword')}}>키워드</button>
            </div>

            {pageType && 
                <>
                    {pageType === 'taobao' && 
                        <div>
                            <label htmlFor='smartId'>https://smartstore.naver.com/</label>
                            <input type="text" id='smartId' style={{width: '20%'}} value={urlId} onChange={(e) => {setUrlId(e.target.value)}} placeholder='dwantae'></input>
                        </div>
                    }
                    {pageType === 'keyword' &&
                        <div>
                            <label htmlFor='keyword'>상품명</label>
                            <input type="text" id='keyword' style={{width: '20%'}} value={keyword} onChange={(e) => {setKeyword(e.target.value)}} placeholder='공업용 선풍기'></input>
                        </div>
                    }
                    <div>
                        <button className='button danger' onClick={getCrawlingPython}>크롤링 시작</button>
                        <button type="button" className='button primary' onClick={(e) => downloadExcel(e)} disabled={btnDisabled.excelBtn}>엑셀</button>
                        {pageType === 'taobao' && 
                            <>
                                <button type="button" className='button secondary' onClick={(e) => downloadImgBtn(e)} disabled={btnDisabled.imageBtn}>이미지 파일</button>
                            </>
                        }
                        {pageType === 'keyword' &&
                            <div style={{  }}>
                                {keywordCrawlingArr.length > 0 && 
                                    <h3>추천어</h3>
                                }
                                {recommendKeywordArr.length > 0 &&
                                    <>
                                        <p>
                                            {recommendKeywordArr.map((item) => {
                                                return <span key={item} onDoubleClick={(e) => useRecommentKeyword(item)}>{item} </span>
                                            })}
                                        </p>
                                    </>
                                }
                                {keywordCrawlingArr.length > 0 &&
                                    <>
                                        <p style={{ fontSize: '11px', color: 'gray'}}>
                                            추천어 글자 더블 클릭 시 글자 제거, 행 더블 클릭 시 추가
                                            <button type='button' className='button' onClick={(e) => setRecommendKeywordArr([])}>추천어 초기화</button>
                                        </p>
                                    </>
                                }
                            </div>
                        }
                    </div>
                </>
            }
            <div>
                <SggGridReact 
                    sggRef={excelGrid}
                    sggColumns={gridCol} // 그리드 컬럼 Array
                    sggBtn={{'c': false, 'r': true, 'u': false, 'd': false, saveBtn : null}} // 그리드 위 행 CRUD 버튼, c/r/u/d boolean, saveBtn fnc
                    sggData={{gridData: (pageType === 'keyword' ? keywordCrawlingArr : crawlingArr)}} // 데이터 state, 적용(저장) 버튼 시 setState, 총 수 (앞단 페이징일 경우 필요 X) state
                    // sggSearchParam={{searchForm: searchForm, setSearchParam: setSearchParam, doSearch: doSearch}} // 검색조건 입력 폼 Array, 검색조건 setState, 검색 조회 버튼 fnc {3개는 세트로 하나 있으면 다 있어야함}
                    // sggGridChecked={true} // 그리드 좌측 체크박스 boolean
                    sggGridFormChange={{resize: true, headerMove: true, rowMove: true}} // 컬럼 리사이징 boolean, 컬럼 이동 boolean, 행 이동 boolean
                    sggPaging={false} // 페이징 여부 boolean
                    // sggTrOnClick={(e, item) => {console.log(item)}} // 행 클릭 시 fnc
                    sggTrOnDoubleClick={pageType === 'keyword' ? (e, item) => {useRecommentKeyword(item)} : null} // 행 더블 클릭 시 fnc
                />
            </div>
        </>
    );
}

export default Crawling;
