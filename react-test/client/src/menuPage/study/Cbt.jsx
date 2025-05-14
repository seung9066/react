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
    const [questionNo, setQuestionNo] = useState(0);
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
    }
    const [selectedCbtData, setSelectedCbtData] = useState(resetSelectedData);
    
    // 과목 풀기
    const openKeywordPopup = (no) => {
        console.log(no)
    }

    // 그리드 컬럼
    const [cbtGridCol, setCbtGridCol] = useState([
        {key:'fileName', name:'년도,회차'},
        {key:'subject1', name:'1과목', width: 15, type:'button', btn: {btnText: '시작', onClick: ((e) => openKeywordPopup(1))}},
        {key:'subject2', name:'2과목', width: 15, type:'button', btn: {btnText: '시작', onClick: ((e) => openKeywordPopup(2))}},
        {key:'subject3', name:'3과목', width: 15, type:'button', btn: {btnText: '시작', onClick: ((e) => openKeywordPopup(3))}},
        {key:'subject4', name:'4과목', width: 15, type:'button', btn: {btnText: '시작', onClick: ((e) => openKeywordPopup(4))}},
    ]);

    // 모달
    const [isModalOpen, setIsModalOpen] = useState(false);

    // 그리드 더블클릭
    const cbtGridDoubleClick = async (item) => {
        getCbtData(item.fileName);
    }

    // 정답 확인
    const checkAnswer = (e) => {
        const selectAnswer = Number(selectedCbtData.answer);
        const chooseAnswer = Number(e.currentTarget.dataset.name);
        selectAnswer === chooseAnswer ? (utils.showToast('정답'), setCorrect(selectAnswer)) : utils.showToast('오답');
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
    const getCbtData = async (title) => {
        utils.getAxios('/cbt/getData', {title: title}).then((res) => {
            if (res.msg === 'success') {
                const data = res.data;
                setCbtData(data);

                utils.showToast('데이터 로드 완료');
            } else {
                utils.showToast('데이터 로드 실패', res.error);
            }
        });
    };

    useEffect(() => {
        getCbtList();
    }, []);

    useEffect(() => {
        if (cbtData.length > 0) {
            setQuestionNo(1);
            setIsModalOpen(true);
        }
    }, [cbtData])

    useEffect(() => {
        if (questionNo > 0) {
            setSelectedCbtData(cbtData.filter((item) => item.no === questionNo)[0] || {});
        }
    }, [questionNo]);

    return (
        <>
            <Modal isOpen={isModalOpen} onClose={() => (setIsModalOpen(false), setCbtData([]), setQuestionNo(0))} closeBtn={false} onConfirm={null}>
                <h4>{selectedCbtData?.question || ''}</h4>
                <div>
                    <img src={selectedCbtData?.image || ''}></img>
                    <p style={{ cursor: 'pointer', color: correct === 1 ? 'red' : 'black'}} data-name='1' onClick={checkAnswer}>{selectedCbtData?.item1 || ''}</p>
                    <p style={{ cursor: 'pointer', color: correct === 2 ? 'red' : 'black' }} data-name='2' onClick={checkAnswer}>{selectedCbtData?.item2 || ''}</p>
                    <p style={{ cursor: 'pointer', color: correct === 3 ? 'red' : 'black' }} data-name='3' onClick={checkAnswer}>{selectedCbtData?.item3 || ''}</p>
                    <p style={{ cursor: 'pointer', color: correct === 4 ? 'red' : 'black' }} data-name='4' onClick={checkAnswer}>{selectedCbtData?.item4 || ''}</p>
                    <button type='button' className='button' onClick={(e) => {questionNo >= 1 ? (setQuestionNo(questionNo - 1), setCorrect(0)) : null}}>이전</button>
                    <button type='button' className='button' onClick={(e) => {questionNo < 100 ? (setQuestionNo(questionNo + 1), setCorrect(0)) : null}}>다음</button>
                </div>
            </Modal>

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
