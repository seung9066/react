import { useState, useEffect, useRef } from 'react'
import * as utils from '@utils';

import SggGridReact from '@components/SggGridReact';
import Draggable from 'react-draggable';

function Crawling( props ) {
    const maxKeywordCrawling = 10;
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
    const [chromeDriver, setChromeDriver] = useState('');
    const [recommendKeywordArr, setRecommendKeywordArr] = useState([]);
    const [recommendKeywordDrag, setRecommendKeywordDrag] = useState(true);
    const [showHideRecommendKeyword, setShowHideRecommendKeyword] = useState(false);
    const [radioOrderType, setRadioOrderType] = useState('ranking');    

    // 그리드 컬럼
    const [gridCol, setGridCol] = useState([]);

    // 입력 그리드
    const [excelGridCol, setExcelGridCol] = useState([]);
    // 입력 그리드 데이터
    const [excelGridData, setExcelGridData] = useState([]);
    // 입력 그리드 행추가
    const [tfAddExcelGridData, setTfAddExcelGridData] = useState(true);

    const [btnDisabled, setBtnDisabled] = useState({
        excelBtn: true,
        imageBtn: true,
        recommendBtn: true,
        crawlingBtn: false,
    });

    // python 크롤링
    const getCrawlingPython = async() => {
        if (!chromeDriver) {
            utils.showToast('크롬드라이버 경로를 입력하세요.');
            return false;
        }

        if (pageType === 'keyword') {
            let checkOverFive = 0;
            let checkProduct = 0;
            for (const item of excelGridData) {
                if (!item.keyword) {
                    checkOverFive++;
                }

                if (!item.product) {
                    checkProduct++;
                }

                for (const item2 of excelGridData) {

                }
            }

            if (checkOverFive > maxKeywordCrawling) {
                utils.showToast(`크롤링은 한번에 ${maxKeywordCrawling}개 까지만 가능 합니다.`);
                return false;
            }

            if (excelGridData.length === 0 || checkProduct > 0) {
                utils.showToast('크롤링 할 상품명을 입력 후 전체 저장 버튼을 클릭하세요.');
                return false;
            }
            
            if (!radioOrderType) {
                utils.showToast('크롤링 순서를 선택해주세요.');
                return false;
            }
        }

        utils.showToast('크롤링을 시작합니다.');
        setBtnDisabled((prev) => ({
            ...prev,
            crawlingBtn: true,
        }));
        if (pageType === 'taobao') {
            const urlPath = urlId || 'https://smartstore.naver.com/dwantae';
            await utils.postAxios('/crawling/crawlPythonSmartStore', {url : urlPath, chromeDriverPath: chromeDriver}).then((res) => {
                if (res.msg === 'success') {
                    let data = res.data;
                    setUl(data.ul);
                    setCrawlingData(data.content);
                    setStartCrawling(1);
                    utils.showToast('스마트스토어 정보를 크롤링 했습니다.');
                } else {
                    utils.showToast('puppeteer control 크롤링 정보를 가져오는 중 오류가 발생했습니다.', res.error);
                }

                setBtnDisabled((prev) => ({
                    ...prev,
                    crawlingBtn: false,
                }));
            });
        }

        if (pageType === 'keyword') {
            const keywordArr = [];
            for (const item of excelGridData) {
                if (!item.keyword) {
                    keywordArr.push(item.product);
                }
            }

            let urlPath = '';
            if (radioOrderType === 'ranking') {
                urlPath = `https://search.shopping.naver.com/search/all?adQuery={searchKeyword}&frm=NVSCDIG&origQuery={searchKeyword}&pagingIndex=1&pagingSize=40&productSet=overseas&query={searchKeyword}&sort=review&timestamp=&viewType=list`;
            }

            if (radioOrderType === 'review') {
                urlPath = `https://search.shopping.naver.com/search/all?bt=-1&frm=NVSCDIG&query={searchKeyword}`;
            }

            await utils.postAxios('/crawling/crawlPythonKeyword', {url : urlPath, chromeDriverPath: chromeDriver, keywordArr: keywordArr}).then((res) => {
                if (res.msg === 'success') {
                    let data = res.data;
                    findRepeatKeyword(data.text);
                    utils.showToast('키워드 정보를 크롤링 했습니다.');
                } else {
                    utils.showToast('puppeteer control 크롤링 정보를 가져오는 중 오류가 발생했습니다.', res.error);
                }

                setBtnDisabled((prev) => ({
                    ...prev,
                    crawlingBtn: false,
                }));
            });
        }
    }
    
    const getCrawlingPythonTaobao = async() => {
        const urlPath = 'https://www.taobao.com/';
        await utils.postAxios('/crawling/crawlPythonTaobao', {chromeDriverPath: chromeDriver}).then((res) => {
            if (res.msg === 'success') {
                let data = res.data;
                
                utils.showToast('타오바오 정보를 크롤링 했습니다.');
            } else {
                utils.showToast('puppeteer control 크롤링 정보를 가져오는 중 오류가 발생했습니다.', res.error);
            }
        });
    }

    const setUrlTaobao = () => {
        const newCrawlingArr = structuredClone(crawlingArr);
        for (let i = 0; i < newCrawlingArr.length; i++) {
            newCrawlingArr[i].taobaoLink = '타오바오 로그인 문제로 미지원'
        }

        setCrawlingArr(newCrawlingArr);
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
            const today = new Date();
            const year = today.getFullYear();
            const month = String(today.getMonth() + 1).padStart(2, '0');  // 0-based
            const day = String(today.getDate()).padStart(2, '0');

            const formattedDate = `${year}${month}${day}`;

            excelName = 'naver_shopping_keyword_' + formattedDate;
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

        setUrlTaobao();
        return false;

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
            const itemArr = item.name.split(' ');
            for (const arrItem of itemArr) {
                let checkDuple = 0;
                const regText = arrItem.replace(/[^가-힣]/g, '');
                for (const keywordItem of keywordArr) {
                    if (regText === keywordItem.keyword && item.product === keywordItem.product) {
                        checkDuple++;
                    }
                }

                if (checkDuple === 0) {
                    if (regText) {
                        keywordArr.push({product: item.product, keyword : regText, cnt: 0});
                    }
                }
            }
        }

        // 카운팅팅
        for (const item of data) {
            const itemArr = item.name.split(' ');
            for (const arrItem of itemArr) {
                for (const keywordItem of keywordArr) {
                    if (arrItem === keywordItem.keyword && item.product === keywordItem.product) {
                        keywordItem.cnt++;
                    }
                }
            }
        }

        // 많은거 뽑기기
        const arr = [];
        for (const item of keywordArr) {
            if (item.cnt > 1) {
                arr.push(item);
            }
        }

        const sortArr = [...arr].sort((a, b) => b.cnt - a.cnt);

        const newKeywordCrawlingArr = keywordCrawlingArr.concat(sortArr);
        setKeywordCrawlingArr(newKeywordCrawlingArr);
    }

    // 드래그 시작 시 노드 ID 저장
    const handleDragStart = (e) => {
        let key = e.target.dataset.key;
        e.dataTransfer.setData("application/keyword-key", key);
    };
    
    // 드래그 오버 시 기본 동작 막기 (drop 허용)
    const handleDragOver = (e) => {
        e.preventDefault();
    };
    
    // 노드 위에 드롭했을 때 처리
    const handleDrop = (e) => {
        e.preventDefault();
        let key = e.target.dataset.key;
        const draggedThKey = e.dataTransfer.getData("application/keyword-key");
        if (draggedThKey && draggedThKey !== key) {
            let from = -1;
            let to = -1;
            for (let i = 0; i < recommendKeywordArr.length; i++) {
                recommendKeywordArr[i] === draggedThKey ? from = i : null;
                recommendKeywordArr[i] === key ? to = i : null;
            }

            if (from !== -1 && to !== -1) {
                handleSwap(from, to);
            }
        }
    };

    // 키워드 재정렬
    const handleSwap = (from, to) => {
        let newRecommendKeywordArr = structuredClone(recommendKeywordArr);
        // 뽑아내기
        let [fromObj] = newRecommendKeywordArr.splice(from, 1);
        // 넣기
        newRecommendKeywordArr.splice(to, 0, fromObj);
        setRecommendKeywordArr(newRecommendKeywordArr);
    };

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

    // 키워드 추출
    const getRecommendKeyword = (product) => {
        let recommendTextArr = [];
        for (let i = 0; i < keywordCrawlingArr.length; i++) {
            if (keywordCrawlingArr[i].product === product && recommendTextArr.length <= 10) {
                recommendTextArr.push(keywordCrawlingArr[i].keyword);
            }
        }
        setRecommendKeywordArr(recommendTextArr);
    }

    // 쿠키 세팅
    function setCookie(value) {
        const date = new Date();
        date.setTime(date.getTime() + (365 * 24 * 60 * 60 * 1000));  // 만료일 설정
        const expires = "expires=" + date.toUTCString();
        document.cookie = `chromeDriverPath=${value}; ${expires}; path=/`;  // 쿠키 설정
    }

    // 쿠키 가져오기
    function getCookie() {
        const nameEQ = 'chromeDriverPath' + "=";
        const ca = document.cookie.split(';');
        for (let i = 0; i < ca.length; i++) {
            let c = ca[i].trim();
            if (c.indexOf(nameEQ) === 0) {
            return c.substring(nameEQ.length, c.length);
            }
        }
        return null; // 쿠키가 없으면 null 반환
    }

    // 엑셀용 그리드
    const doExcelGridSaveBtn = (item) => {

    }

    // 팝업 닫기
    const setClosePopUp = () => {
        setShowHideRecommendKeyword(false);
        setKeyword('');
    }

    // 입력 그리드 행추가 (팝업에서 추가 버튼 클릭)
    const setExcelGridRow = () => {
        // 같은 product 찾아서 그리드에 넣어주기
        const newRecommendKeywordArr = structuredClone(recommendKeywordArr);
        let recommendKeywordText = '';
        for (let i = 0; i < newRecommendKeywordArr.length; i++) {
            recommendKeywordText += newRecommendKeywordArr[i];
            if (i !== newRecommendKeywordArr.length - 1) {
                recommendKeywordText += ' ';
            }
        }

        const newExcelGridData = structuredClone(excelGridData);
        for (const item of newExcelGridData) {
            if (item.product === keyword) {
                item.keyword = recommendKeywordText;
            }
        }
        setExcelGridData(newExcelGridData);

        // 팝업 닫기
        setShowHideRecommendKeyword(false);

        // 키워드 초기화
        setKeyword('');
    }

    // 전체 적용
    const doGridSaveBtn = (item) => {
        const newRecommendKeywordArr = [];

        for (const item2 of item) {
            if (item2.setTotalChecked) {
                newRecommendKeywordArr.push(item2.keyword);
            }
        }

        setRecommendKeywordArr(newRecommendKeywordArr);
    }

    // 입력 그리드 팝업 버튼
    const openKeywordPopup = (item) => {
        setKeyword(item.product);
        setShowHideRecommendKeyword(true);
    }

    useEffect(() => {
        // 크롬 드라이버 경로 쿠키 세팅
        const chromeDriverCookie = getCookie();
        if (chromeDriverCookie) {
            setChromeDriver(chromeDriverCookie);
        }
    }, []);

    // 크롬 드라이버 경로 입력 시 자동 쿠키 세팅
    useEffect(() => {
        if (chromeDriver) {
            let path = chromeDriver;
            if (path.indexOf('"') === 0) {
                path = path.replace('"', '');
            }
            
            if (path.indexOf('"') === path.length - 1) {
                path = path.slice(0, -1);
            }

            setCookie(path);
        }
    }, [chromeDriver]);

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
            utils.showToast('타오바오 링크 안됨');

            const taobaoCol = [
                {key:'name', name:'상품명'},
                {key:'price', name:'가격', width: 20},
                {key:'imgSrc', name:'이미지', type:'image', width: 20},
                {key:'taobaoLink', name:'타오바오 링크', type: 'a'},
            ];
            setGridCol(taobaoCol);
        } else if (pageType === 'keyword') {
            const keywordCol = [
                {key:'keyword', name:'키워드',},
                {key:'cnt', name:'횟수', width: 20},
            ];
            setGridCol(keywordCol);

            const excelCol = [
                {key:'product', name:'상품명', width: 40, type:'text'},
                {key:'keywordBtn', name:'키워드 단어', width: 15, type:'button', btn: {btnText: '팝업', onClick: openKeywordPopup}},
                {key:'keyword', name:'키워드', type:'text'},
            ];
            setExcelGridCol(excelCol);
        }
    }, [pageType])

    useEffect(() => {
        if (pageType === 'taobao') {
            if (crawlingArr.length > 0) {
                setBtnDisabled((prev) => ({
                    ...prev,
                    excelBtn: false,
                    recommendBtn: true,
                }));
            } else {
                setBtnDisabled((prev) => ({
                    ...prev,
                    excelBtn: true,
                    recommendBtn: true,
                }));
            }
        } else if (pageType === 'keyword') {
            if (keywordCrawlingArr.length > 0) {
                setBtnDisabled((prev) => ({
                    ...prev,
                    excelBtn: false,
                    recommendBtn: false,
                }));
            } else {
                setBtnDisabled((prev) => ({
                    ...prev,
                    excelBtn: true,
                    recommendBtn: true,
                }));
            }
        }
    }, [pageType, crawlingArr, keywordCrawlingArr])

    useEffect(() => {
        // 행추가 막기용
        if (excelGridData.length > 0) {
            let checkNew = 0;
            for (const item of excelGridData) {
                if (!item.keyword) {
                    checkNew++;
                }
            }

            if (checkNew >= maxKeywordCrawling) {
                setTfAddExcelGridData(false);
            } else {
                setTfAddExcelGridData(true);
            }
        }
    }, [excelGridData])

    useEffect(() => {
        if (keyword) {
            getRecommendKeyword(keyword);
        }
    }, [keyword])

    return (
        <>
            <div>
                <button type='button' className={'button' + (pageType === 'taobao' ? '' : ' secondary')} style={{ width: '150px' }} onClick={(e) => {setPageType('taobao')}}>타오바오</button>
                <button type='button' className={'button' + (pageType === 'keyword' ? '' : ' secondary')} style={{ width: '150px' }} onClick={(e) => {setPageType('keyword')}}>키워드</button>
            </div>

            {pageType && 
                <>
                    <div>
                        <label htmlFor='chromeDriver'>크롬드라이버 경로</label>
                        <input type="text" id='chromeDriver' style={{width: '20%'}} value={chromeDriver} onChange={(e) => {setChromeDriver(e.target.value)}} placeholder='크롬 경로'></input>
                    </div>
                    {pageType === 'taobao' && 
                        <>
                            <div>
                                <label htmlFor='smartId'>https://smartstore.naver.com/</label>
                                <input type="text" id='smartId' style={{width: '20%'}} value={urlId} onChange={(e) => {setUrlId(e.target.value)}} placeholder='dwantae'></input>
                            </div>
                        </>
                    }
                    <div>
                        <button className='button danger' onClick={getCrawlingPython} disabled={btnDisabled.crawlingBtn}>크롤링 시작</button>
                        <button type="button" className='button primary' onClick={(e) => downloadExcel(e)} disabled={btnDisabled.excelBtn}>엑셀</button>
                        {pageType === 'taobao' && 
                            <>
                                <button type="button" className='button secondary' onClick={(e) => downloadImgBtn(e)} disabled={btnDisabled.imageBtn}>이미지 파일</button>
                            </>
                        }
                        {pageType === 'keyword' &&
                            <>
                                <label>
                                    <input type='radio' name='orderType' value='ranking' checked={radioOrderType === 'ranking'} onChange={(e) => setRadioOrderType(e.target.value)} />
                                    네이버 랭킹 순
                                </label>
                                <label>
                                    <input type='radio' name='orderType' value='review' checked={radioOrderType === 'review'} onChange={(e) => setRadioOrderType(e.target.value)} />
                                    리뷰 많은 순
                                </label>
                            </>
                        }
                        {pageType === 'keyword' && showHideRecommendKeyword &&
                            <Draggable cancel='.keyword'>
                                <div style={{ 
                                    position: 'fixed',
                                    top: '48%',
                                    left: '0',
                                    right: '0',
                                    background: 'rgba(240, 244, 255, 0.6)', // 투명한 배경
                                    width: '50%',
                                    maxWidth: '800px',
                                    margin: '0 auto',
                                    padding: '20px 30px',
                                    borderRadius: '16px',
                                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                                    fontFamily: 'Arial, sans-serif',
                                    zIndex: 1000,
                                    opacity: '80%'
                                }}>
                                    {recommendKeywordArr.length > 0 &&
                                        <>
                                            <p>
                                                {recommendKeywordArr.map((item) => {
                                                    return <span key={item}
                                                                data-key={item}
                                                                draggable={recommendKeywordDrag}
                                                                onDragStart={handleDragStart}
                                                                onDragOver={handleDragOver}
                                                                onDrop={handleDrop} 
                                                                onDoubleClick={(e) => useRecommentKeyword(item)}
                                                                style={{ 
                                                                    display: 'inline-block',
                                                                    backgroundColor: '#e0f7fa',
                                                                    color: '#006064',
                                                                    padding: '6px 12px',
                                                                    borderRadius: '12px',
                                                                    fontSize: '14px',
                                                                    fontWeight: 'bold',
                                                                    boxShadow: '0 2px 6px rgba(0, 0, 0, 0.1)',
                                                                    margin: '2px'
                                                                }}
                                                                className='keyword'
                                                            >
                                                                {item}
                                                            </span>
                                                })}
                                            </p>
                                        </>
                                    }
                                    {keywordCrawlingArr.length > 0 &&
                                        <>
                                            <button type='button' className='button' onClick={(e) => setClosePopUp()}>닫기</button>
                                            {/* <button type='button' className='button' onClick={(e) => setRecommendKeywordDrag(!recommendKeywordDrag)}>{recommendKeywordDrag ? '드래그 허용' : '순서 이동'}</button> */}
                                            <button type='button' className='button primary' onClick={(e) => setExcelGridRow()}>추가</button>
                                        </>
                                    }
                                </div>
                            </Draggable>
                        }
                    </div>
                </>
            }
            {pageType === 'keyword' &&
                <>
                    <h2>{keyword || '목록의 키워드 단어 팝업 클릭 시 변경됨'}</h2>
                    <div>
                        <SggGridReact
                            sggRef={excelGrid}
                            sggColumns={excelGridCol} // 그리드 컬럼 Array
                            sggBtn={{'c': tfAddExcelGridData, 'r': true, 'u': true, 'd': true, saveBtn : doExcelGridSaveBtn}} // 그리드 위 행 CRUD 버튼, c/r/u/d boolean, saveBtn fnc
                            sggData={{gridData: excelGridData, setGridData: setExcelGridData}} // 데이터 state, 적용(저장) 버튼 시 setState, 총 수 (앞단 페이징일 경우 필요 X) state
                            // sggSearchParam={{searchForm: searchForm, setSearchParam: setSearchParam, doSearch: doSearch}} // 검색조건 입력 폼 Array, 검색조건 setState, 검색 조회 버튼 fnc {3개는 세트로 하나 있으면 다 있어야함}
                            sggGridChecked={true} // 그리드 좌측 체크박스 boolean
                            sggGridFormChange={{resize: true, headerMove: true, rowMove: true}} // 컬럼 리사이징 boolean, 컬럼 이동 boolean, 행 이동 boolean
                            sggPaging={false} // 페이징 여부 boolean
                            // sggTrOnClick={(e, item) => {console.log(item)}} // 행 클릭 시 fnc
                            // sggTrOnDoubleClick={pageType === 'keyword' ? (e, item) => {useRecommentKeyword(item)} : null} // 행 더블 클릭 시 fnc
                            />
                    </div>
                </>
            }
            <div>
                <SggGridReact 
                    sggColumns={gridCol} // 그리드 컬럼 Array
                    sggBtn={{'c': false, 'r': true, 'u': false, 'd': false, saveBtn : (pageType === 'keyword' ? doGridSaveBtn : null)}} // 그리드 위 행 CRUD 버튼, c/r/u/d boolean, saveBtn fnc
                    sggData={{gridData: (pageType === 'keyword' ? keywordCrawlingArr.filter((item) => item.product === keyword) : crawlingArr)}} // 데이터 state, 적용(저장) 버튼 시 setState, 총 수 (앞단 페이징일 경우 필요 X) state
                    // sggSearchParam={{searchForm: searchForm, setSearchParam: setSearchParam, doSearch: doSearch}} // 검색조건 입력 폼 Array, 검색조건 setState, 검색 조회 버튼 fnc {3개는 세트로 하나 있으면 다 있어야함}
                    sggGridChecked={(pageType === 'keyword' ? true : false)} // 그리드 좌측 체크박스 boolean
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
