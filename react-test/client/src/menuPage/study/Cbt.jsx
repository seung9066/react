import { useEffect, useRef, useState } from 'react';
import * as utils from '@utils';

import Modal from '@components/Modal';
import SggGridReact from '@components/SggGridReact';

function Crawling( props ) {
    // 정답표시
    const [correct, setCorrect] = useState(0);
    // 목록
    const [cbtListData, setCbtListData] = useState([]);
    // 시험 회차별 정보
    const [cbtData, setCbtData] = useState([]);
    // 현재 문제 번호
    const [questionNo, setQuestionNo] = useState(-1);
    // 틀린 문제 번호
    const [wrongQuestionNo, setWrongQuestionNo] = useState(-1);
    // 시험 년월
    const [testYear, setTestYear] = useState(''); 
    // 선택 문제
    const resetSelectedData = {
        no: 0,
        image: '',
        question: '',
        item1: '',
        item2: '',
        item3: '',
        item4: '',
        answer: '',
        test: '',
    }
    // 선택 문제
    const [selectedCbtData, setSelectedCbtData] = useState(resetSelectedData);
    // 선택 문제 오답
    const [wrongSelectedCbtData, setWrongSelectedCbtData] = useState(resetSelectedData);

    // 모든 문제
    const [allCbtData, setAllCbtData] = useState([]);
    // 모든 문제 모달
    const [isRandomModalOpen, setIsRandomModalOpen] = useState(false);
    const [allSelectedCbtData, setAllSelectedCbtData] = useState(resetSelectedData);
    const [allCorrect, setAllCorrect] = useState(0);
    const [allQuesionNo, setAllQuestionNo] = useState(-1);

    // 오답목록
    const [wrongData, setWrongData] = useState([]);

    // 과목 풀기
    const openKeywordPopup = (item, no) => {
        setTestYear(item.fileName);
        getCbtData(item.fileName, no);
    }

    // 그리드 컬럼
    const [cbtGridCol, setCbtGridCol] = useState([
        {key:'fileName', name:'년도,회차'},
        {key:'subject1', name:'1과목', width: 15, type:'button', btn: {btnText: '시작', onClick: ((item) => openKeywordPopup(item, 1))}},
        {key:'subject2', name:'2과목', width: 15, type:'button', btn: {btnText: '시작', onClick: ((item) => openKeywordPopup(item, 21))}},
        {key:'subject3', name:'3과목', width: 15, type:'button', btn: {btnText: '시작', onClick: ((item) => openKeywordPopup(item, 41))}},
        {key:'subject4', name:'4과목', width: 15, type:'button', btn: {btnText: '시작', onClick: ((item) => openKeywordPopup(item, 61))}},
        {key:'subject5', name:'5과목', width: 15, type:'button', btn: {btnText: '시작', onClick: ((item) => openKeywordPopup(item, 81))}},
    ]);

    // 모달
    const [isModalOpen, setIsModalOpen] = useState(false);

    // 그리드 더블클릭
    const cbtGridDoubleClick = async (item) => {
        setTestYear(item.fileName);
        getCbtData(item.fileName, 1);
    }

    // 정답 확인
    const checkAnswer = (e) => {
        const selectNo = Number(selectedCbtData.no || wrongSelectedCbtData.no);
        const selectAnswer = Number(selectedCbtData.answer || wrongSelectedCbtData.answer);
        const selectTest = selectedCbtData.test || wrongSelectedCbtData.test;
        const chooseAnswer = Number(e.currentTarget.dataset.name);

        const newSelectedData = structuredClone(selectedCbtData);
        if (selectAnswer === chooseAnswer) {
            utils.showToast('정답');
            // 정답 빨간 표시용
            setCorrect(selectAnswer);

            if (wrongSelectedCbtData.no > 0) {
                // 오답처리 목록
                const checkWrong = wrongData.filter((item) => (item.no === selectNo && selectTest === testYear)).length;
                if (checkWrong > 0) {
                    const newWrongData = wrongData.filter((item) => !(item.no === selectNo && selectTest === testYear));
                    setWrongData(newWrongData);
                }
            }
        } else {
            utils.showToast('오답');
            // 정답 빨간 표시용
            setCorrect(0);
            
            if (selectedCbtData.no > 0) {
                // 오답처리 목록
                const newWrongData = structuredClone(wrongData);
                const checkWrong = newWrongData.filter((item) => (item.no === selectNo && selectTest === testYear)).length;
                if (checkWrong === 0) {
                    newWrongData.push(newSelectedData);
                    setWrongData(newWrongData);
                }
            }
        }
    }

    // 랜덤 정답 확인
    const checkAllAnswer = (e) => {
        const selectNo = Number(allSelectedCbtData.no);
        const selectAnswer = Number(allSelectedCbtData.answer);
        const selectTest = allSelectedCbtData.test;
        const chooseAnswer = Number(e.currentTarget.dataset.name);

        const newAllSelectedData = structuredClone(allSelectedCbtData);
        if (selectAnswer === chooseAnswer) {
            utils.showToast('정답');
            setAllCorrect(selectAnswer);
        } else {
            utils.showToast('오답');
            // 정답 빨간 표시용
            setAllCorrect(0);
            
            // 오답처리 목록
            const newWrongData = structuredClone(wrongData);
            const checkWrong = newWrongData.filter((item) => (item.no === selectNo && selectTest === testYear)).length;
            if (checkWrong === 0) {
                newWrongData.push(newAllSelectedData);
                setWrongData(newWrongData);
            }
        }
    }

    // 오답 목록
    const showWrong = () => {
        const newWrongData = structuredClone(wrongData);
        
        if (newWrongData.length > 0) {
            const item = newWrongData[0];
            setWrongSelectedCbtData(item);
            setIsModalOpen(true);
            setWrongQuestionNo(0);
            setTestYear(item.test);
        } else {
            utils.showToast('오답 목록이 없습니다.');
        }
    }
    
    // 오답 다음
    const nextWrong = (no) => {
        const newWrongData = structuredClone(wrongData);

        if (newWrongData.length > no + 1) {
            const item = newWrongData[no + 1];
            setWrongSelectedCbtData(item);
            setWrongQuestionNo(no + 1);
            setTestYear(item.test);
            setCorrect(0);
        } else {
            utils.showToast('마지막 문제입니다.')
        }
    }
    
    // 오답 이전
    const beforeWrong = (no) => {
        const newWrongData = structuredClone(wrongData);
        
        if (no > 0) {
            const item = newWrongData[no - 1];
            setWrongSelectedCbtData(item);
            setWrongQuestionNo(no - 1);
            setTestYear(item.test);
            setCorrect(0);
        } else {
            utils.showToast('첫번째 문제입니다.');
        }
    }

    const resetModal = () => {
        // 모달 닫기
        setIsModalOpen(false);
        // 모달 문제집
        setCbtData([]);
        // 보여줄 문제번호
        setQuestionNo(-1);
        // 문제
        setSelectedCbtData(resetSelectedData);
        // 클릭 정답 체크용
        setCorrect(0);
        // 시험명
        setTestYear('');

        // 오답 번호
        setWrongQuestionNo(-1);
        // 오답 보여줄 문제
        setWrongSelectedCbtData(resetSelectedData);
    }

    // 과목명
    const getSubject = (no) => {
        if (1 <= no && no <= 20) {
            return '1과목 : 소프트웨어 설계';
        } else if (21 <= no && no <= 40) {
            return '2과목 : 소프트웨어 개발';
        } else if (41 <= no && no <= 60) {
            return '3과목 : 데이터베이스 구축';
        } else if (61 <= no && no <= 80) {
            return '4과목 : 프로그래밍 언어 활용';
        } else if (81 <= no && no <= 100) {
            return '5과목 : 정보시스템 구축관리';
        }
    }

    // 문자열 깔끔하게
    const resetTxt = (item) => {
        let returnItem = item.replaceAll('\n', '');
        return wrappedText(returnItem);
    }

    const wrappedText = (item) => {
        const regex = /^(100|[1-9][0-9]?)[.)]\s(.+)$/gm;

        let returnItem = '';
        item.replace(regex, (match, num, content) => {
            const wrapAt = 50;
            const wrappedContent = content.replace(
                new RegExp(`(.{1,${wrapAt}})(\\s|$)`, 'g'),
                '$1\n'
            ).trim();

            returnItem = `${num}. ${wrappedContent}`;
        })
        
        return returnItem;
    };

    // 랜덤 문제 풀기
    const randomTest = () => {
        setIsRandomModalOpen(true);
        randomTextNext();
    }

    // 랜덤 다음 문제
    const randomTextNext = () => {
        const arrLength = allCbtData.length;
        const randomNo = Math.floor(Math.random() * arrLength);

        const newAllCbtData = structuredClone(allCbtData);
        const item = newAllCbtData[randomNo]
        setAllSelectedCbtData(item);
        newAllCbtData.splice(randomNo, 1);
        setAllCbtData(newAllCbtData);
        setTestYear(item.test);
        setAllCorrect(0);
    }

    // 랜덤풀기용 전체 시험 조회
    const onClickBtnRandom = () => {
        utils.getAxios('/cbt/getListData').then((res) => {
            if (res.msg === 'success') {
                const data = res.data;
                const dataArr = [];
                for (const item of data) {
                    for (const item2 of item) {
                        dataArr.push(item2);
                    }
                }
                setAllCbtData(dataArr);
    
                utils.showToast('전체 조회 완료');
            } else {
                utils.showToast('전체 조회 실패', res.error);
            }
        });
    }

    // 목록 가져오기
    const getCbtList = async () => {
        utils.getAxios('/cbt/getList').then((res) => {
            if (res.msg === 'success') {
                const data = res.data;
                const cbtListArr = [];
                for (const item of data) {
                    const cbtItem = {fileName : item.replace('.json', '')};
                    cbtListArr.push(cbtItem)
                }
                setCbtListData(cbtListArr);
    
                utils.showToast('목록 조회 완료');
            } else {
                utils.showToast('목록 조회 실패', res.error);
            }
        });
    }

    // server에서 정보 가져오기
    const getCbtData = async (title, no) => {
        setCbtData(allCbtData.filter((item) => item.test === title));
        setQuestionNo(no);
        setIsModalOpen(true);
    };

    // server에서 단건 정보 가져오기
    const getCbtDataOne = async (title, no) => {
        utils.getAxios('/cbt/getData', {title: title}).then((res) => {
            if (res.msg === 'success') {
                const data = res.data;
                setCbtData(data);
                setQuestionNo(no);
                setIsModalOpen(true);

                utils.showToast('데이터 로드 완료');
            } else {
                utils.showToast('데이터 로드 실패', res.error);
            }
        });
    };

    useEffect(() => {
        // 시험 목록
        getCbtList();

        // 전체 목록 랜덤 풀기용
        onClickBtnRandom();
    }, []);

    useEffect(() => {
        if (questionNo > 0) {
            const newCbtData = cbtData.filter((item) => (item.no === questionNo && item.test === testYear));

            if (newCbtData.length > 0) {
                setSelectedCbtData(newCbtData[0]);
                setCorrect(0);
            }
        } else {
            if (questionNo !== -1) {
                utils.showToast('첫번째 문제입니다.');
                setQuestionNo(1);
            }
        }
    }, [questionNo]);

    return (
        <>
            <Modal isOpen={isModalOpen} onClose={resetModal} closeBtn={false} onConfirm={null}>
                <p style={{ userSelect: 'none' }}>{getSubject(selectedCbtData?.no || wrongSelectedCbtData?.no || '')}</p>
                <h4 style={{ whiteSpace: 'pre-wrap', userSelect: 'none' }}>{resetTxt(selectedCbtData?.question || wrongSelectedCbtData?.question ||'')}</h4>
                <div>
                    <img src={selectedCbtData?.image || wrongSelectedCbtData?.image || ''}></img>

                    <p style={{ cursor: 'pointer', userSelect: 'none', color: correct === 1 ? 'red' : 'black'}} data-name='1' onClick={checkAnswer}>{selectedCbtData?.item1 || wrongSelectedCbtData?.item1 || ''}</p>
                    <p style={{ cursor: 'pointer', userSelect: 'none', color: correct === 2 ? 'red' : 'black' }} data-name='2' onClick={checkAnswer}>{selectedCbtData?.item2 || wrongSelectedCbtData?.item2 || ''}</p>
                    <p style={{ cursor: 'pointer', userSelect: 'none', color: correct === 3 ? 'red' : 'black' }} data-name='3' onClick={checkAnswer}>{selectedCbtData?.item3 || wrongSelectedCbtData?.item3 || ''}</p>
                    <p style={{ cursor: 'pointer', userSelect: 'none', color: correct === 4 ? 'red' : 'black' }} data-name='4' onClick={checkAnswer}>{selectedCbtData?.item4 || wrongSelectedCbtData?.item4 || ''}</p>
                    
                    {questionNo > -1 && <button type='button' className='button' onClick={(e) => {(setQuestionNo(questionNo - 1), setCorrect(0))}}>이전</button>}
                    {questionNo > -1 && <button type='button' className='button' onClick={(e) => {(setQuestionNo(questionNo + 1), setCorrect(0))}}>다음</button>}

                    {wrongQuestionNo > -1 && <button type='button' className='button' onClick={(e) => {beforeWrong(wrongQuestionNo)}}>이전</button>}
                    {wrongQuestionNo > -1 && <button type='button' className='button' onClick={(e) => {nextWrong(wrongQuestionNo)}}>다음</button>}
                </div>
            </Modal>

            <Modal isOpen={isRandomModalOpen} onClose={(e) => {setIsRandomModalOpen(false)}} closeBtn={false} onConfirm={null}>
                <p style={{ userSelect: 'none' }}>{allSelectedCbtData.test} / {getSubject(allSelectedCbtData?.no || '')}</p>
                <h4 style={{ whiteSpace: 'pre-wrap', userSelect: 'none' }}>{resetTxt(allSelectedCbtData?.question ||'')}</h4>
                <div>
                    <img src={allSelectedCbtData?.image || ''}></img>

                    <p style={{ cursor: 'pointer', userSelect: 'none', color: allCorrect === 1 ? 'red' : 'black'}} data-name='1' onClick={checkAllAnswer}>{allSelectedCbtData?.item1 || ''}</p>
                    <p style={{ cursor: 'pointer', userSelect: 'none', color: allCorrect === 2 ? 'red' : 'black' }} data-name='2' onClick={checkAllAnswer}>{allSelectedCbtData?.item2 || ''}</p>
                    <p style={{ cursor: 'pointer', userSelect: 'none', color: allCorrect === 3 ? 'red' : 'black' }} data-name='3' onClick={checkAllAnswer}>{allSelectedCbtData?.item3 || ''}</p>
                    <p style={{ cursor: 'pointer', userSelect: 'none', color: allCorrect === 4 ? 'red' : 'black' }} data-name='4' onClick={checkAllAnswer}>{allSelectedCbtData?.item4 || ''}</p>
                    
                    {allCbtData.length > 0 && <button type='button' className='button' onClick={(e) => {randomTextNext()}}>다음</button>}
                </div>
            </Modal>

            <button type='button' className='button danger' onClick={showWrong}>오답목록</button>
            <button type='button' className='button danger' onClick={randomTest}>랜덤풀기</button>
            <div>
                <SggGridReact
                    sggRef={(null)}
                    sggColumns={cbtGridCol} // 그리드 컬럼 Array
                    sggBtn={{'c': false, 'r': true, 'u': false, 'd': false, saveBtn : false}} // 그리드 위 행 CRUD 버튼, c/r/u/d boolean, saveBtn fnc
                    sggData={{gridData: cbtListData, setGridData: setCbtListData}} // 데이터 state, 적용(저장) 버튼 시 setState, 총 수 (앞단 페이징일 경우 필요 X) state
                    // sggSearchParam={{searchForm: searchForm, setSearchParam: setSearchParam, doSearch: doSearch}} // 검색조건 입력 폼 Array, 검색조건 setState, 검색 조회 버튼 fnc {3개는 세트로 하나 있으면 다 있어야함}
                    sggGridChecked={false} // 그리드 좌측 체크박스 boolean
                    sggGridFormChange={{resize: true, headerMove: true, rowMove: true}} // 컬럼 리사이징 boolean, 컬럼 이동 boolean, 행 이동 boolean
                    sggPaging={false} // 페이징 여부 boolean
                    // sggTrOnClick={(e, item) => {console.log(item)}} // 행 클릭 시 fnc
                    sggTrOnDoubleClick={(e, item) => {cbtGridDoubleClick(item)}} // 행 더블 클릭 시 fnc
                    />
            </div>
        </>
    );
}

export default Crawling;
