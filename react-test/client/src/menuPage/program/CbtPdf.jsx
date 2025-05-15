import { useEffect, useRef, useState } from 'react';
import * as utils from '@utils';

import Modal from '@components/Modal';
import SggGridReact from '@components/SggGridReact';

function Crawling( props ) {
    const resetReadOnlyTF = {
        question: false,
        item1: false,
        item2: false,
        item3: false,
        item4: false,
        answer: false,
    };
    const [readOnlyTF, setReadOnlyTF] = useState(resetReadOnlyTF)
    const [cbtFile, setCbtFile] = useState(null);
    const [cbtData, setCbtData] = useState([]);
    const [selectedCbtData, setSelectedCbtData] = useState({});
    const [imgBase64, setImgBase64] = useState('');
    const [cbtGridCol, setCbtGridCol] = useState([
        {key:'question', name:'문제'},
        {key:'imageYN', name:'이미지 여부', width: 10},
    ]);
    const [title, setTitle] = useState({
        year: '',
        count: '',
    })

    // 목록
    const [cbtListData, setCbtListData] = useState([]);

    // 목록 그리드 컬럼
    const [cbtListGridCol, setCbtListGridCol] = useState([
        {key:'fileName', name:'년도,회차'},
    ]);

    // 모달
    const [isModalOpen, setIsModalOpen] = useState(false);

    // 목록 모달
    const [isListModalOpen, setIsListModalOpen] = useState(false);

    // 모달 컨펌
    const onConfirmModal = () => {
        const newCbtData = structuredClone(cbtData);
        for (const item of newCbtData) {
            if (selectedCbtData.no === item.no) {
                item.question = selectedCbtData.question;
                item.image = selectedCbtData.image;
                item.item1 = selectedCbtData.item1;
                item.item2 = selectedCbtData.item2;
                item.item3 = selectedCbtData.item3;
                item.item4 = selectedCbtData.item4;
                item.answer = selectedCbtData.answer;
                if (item.image) {
                    item.imageYN = 'Y';
                } else {
                    item.imageYN = 'N';
                }
            }
        }
        
        setCbtData(newCbtData);
        setIsModalOpen(false);
        setReadOnlyTF(resetReadOnlyTF);
    }

    const onChangeValueSelected = (e) => {
        setSelectedCbtData((prev) => ({
            ...prev,
            [e.target.name]: e.target.value,
        }))
    }

    // input value change
    const onChangeValue = (e) => {
        setTitle((prev) => ({
            ...prev,
            [e.target.name]: e.target.value,
        }))
    }

    // 목록 버튼
    const onClickBtnList = () => {
        getCbtList();
        setIsListModalOpen(true);
    }

    // 목록 그리드 더블클릭
    const cbtListGridDoubleClick = (item) => {
        getCbtData(item.fileName);
        setTitle({
            year: item.fileName.substring(0, 4),
            count: item.fileName.substring(4),
        });
        setIsListModalOpen(false);
    }

    // 그리드 더블클릭
    const cbtGridDoubleClick = (item) => {
        setSelectedCbtData(item);
        setIsModalOpen(true);
    }

    // 모달 문제 더블클릭
    const onDoubleClickModalItem = (e) => {
        setReadOnlyTF((prev) => ({
            ...prev,
            [e.currentTarget.dataset.name]: !(prev[e.currentTarget.dataset.name]),
        }))
    }

    // 초기화
    const onClickBtnReset = (msg) => {
        if (msg === 'ALL') {
            setCbtData([]);
            setTitle({
                year: '',
                count: '',
            });
            setSelectedCbtData({});
        }
    }

    // 저장
    const saveCbtGrid = async (item) => {
        const saveTitle = title.year + title.count;
        saveData(saveTitle, item);
    }

    // 삭제
    const deleteCbt = async (item) => {
        const deleteDataArr = [];
        for (const item2 of item) {
            if (item2.setRowState === 'DELETE') {
                deleteDataArr.push(item2);
            }
        }

        deleteData(deleteDataArr);
    }

    // server에서 정보 가져오기
    const getCbtData = async (title) => {
        utils.getAxios('/cbt/getData', {title: title}).then((res) => {
            if (res.msg === 'success') {
                const data = res.data;
                for (const item of data) {
                    if (item.image) {
                        item.imageYN = 'Y';
                    } else {
                        item.imageYN = 'N';
                    }
                }
                setCbtData(data);

                utils.showToast('데이터 로드 완료');
            } else {
                utils.showToast('데이터 로드 실패', res.error);
            }
        });
    };

    // server에 정보 저장
    const saveData = async (title, data) => {
        utils.postAxios('/cbt/updateData', {title: title, data: data}).then((res) => {
            if (res.msg === 'success') {
                const data = res.data;
                utils.showToast(data.message);
            } else {
                utils.showToast('저장 실패', res.error);
            }
        });
    };

    // server에 정보 삭제
    const deleteData = async (data) => {
        utils.deleteAxios('/cbt/deleteData', {data: data}).then((res) => {
            if (res.msg === 'success') {
                const data = res.data;
                utils.showToast(data.message);
            } else {
                utils.showToast('삭제 실패', res.error);
            }
        });
    }

    // 이미지 크기 줄이기
    const resizeImage = (file, maxWidth = 400, maxHeight = 400) => {
        return new Promise((resolve) => {
            const img = new Image();
            const reader = new FileReader();

            reader.onload = (e) => {
                img.src = e.target.result;
            };

            img.onload = () => {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;

                // 비율 유지하면서 최대 사이즈 조정
                if (width > height) {
                    if (width > maxWidth) {
                        height *= maxWidth / width;
                        width = maxWidth;
                    }
                } else {
                    if (height > maxHeight) {
                        width *= maxHeight / height;
                        height = maxHeight;
                    }
                }

                canvas.width = width;
                canvas.height = height;

                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);

                canvas.toBlob((blob) => {
                    resolve(blob); // 줄인 Blob 반환
                }, 'image/jpeg', 0.8); // 품질 80%
            };

            reader.readAsDataURL(file);
        });
    };

    // 이미지 붙여넣기
    const handlePasteImage = async (file) => {
        if (isModalOpen) {
            const fileName = file.name;
            const fileExtension = fileName.split('.').pop().toLowerCase();

            if (fileExtension != "jpg" && fileExtension != "jpeg" && fileExtension != "png") {
                utils.showToast('이미지 파일(jpg, jpeg, png)만 업로드 가능합니다.');
                return;
            }

            if (file) {
                const resizedBlob = await resizeImage(file);

                const reader = new FileReader();
                reader.onloadend = () => {
                    const base64 = reader.result;
                    setImgBase64(base64);
                    setSelectedCbtData((prev) => ({
                        ...prev,
                        image: base64,
                    }))
                };
                reader.readAsDataURL(resizedBlob); // base64 인코딩 시작
            }
        }
    }

    useEffect(() => {
        const handlePaste = (event) => {
            const items = event.clipboardData.items;
            let file = null;
            for (let i = 0; i < items.length; i++) {
                const item = items[i];
                if (item.type.indexOf('image') !== -1) {
                    const blob = item.getAsFile();
                    file = blob;
                }
            };

            handlePasteImage(file);
        }

        window.addEventListener('paste', handlePaste);

        return () => {
            window.removeEventListener('paste', handlePaste);
        };
    }, [isModalOpen]);

    // 사진 제거
    const handleImageDelete = () => {
        const newSelectedData = structuredClone(selectedCbtData);
        delete newSelectedData.image;
        setSelectedCbtData(newSelectedData);
    }

    // 파일 선택 핸들러
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setCbtFile(file);
        }
    };

    // 파일 업로드 핸들러
    const handleUpload = async () => {
        if (!cbtFile) {
            utils.showToast("PDF 파일을 선택해주세요.");
            return;
        }

        const formData = new FormData();
        formData.append("pdf", cbtFile);

        utils.postAxiosFile('/pdfReader/uploadPdf', formData).then((res) => {
            if (res.msg === 'success') {
                const data = res.data;
                const text = data.text;
                const regexQuestion = /(?=\b(100|[1-9][0-9]?)\.\s)/g;
                const regexQuestionDetail = /^(100|[1-9]?[0-9])\.\s.*/;
                const question = text.split(regexQuestion);
                const questionArr = [];
                let questionNo = 1;
                // 문제, 보기 넣기
                for (const item of question) {
                    if (regexQuestionDetail.test(item)) {
                        const q = {};
                        q.no = questionNo;
                        questionNo++;

                        const questionMark = item.indexOf('?') + 1;
                        let question = item.substring(0, questionMark);
                        if (item.indexOf('정보처리기사') > -1) {
                            const CBT = item.indexOf('정보처리기사');
                            const subject = item.indexOf('과목') - 1;
                            const CBTUrl = item.lastIndexOf('www.comcbt.com') + 'www.comcbt.com'.length;
                            const questionMark = item.indexOf('?');
                            const questionToMark = item.substring(0, (questionMark + 1));

                            if (subject > -1) {
                                question = questionToMark.substring(0, subject) + questionToMark.substring(CBTUrl);
                            } else {
                                question = questionToMark.substring(0, CBT) + questionToMark.substring(CBTUrl);
                            }
                        }
                        q.question = question;
                        
                        const itemNo1 = item.indexOf('①');
                        const itemNo2 = item.indexOf('②');
                        const itemNo3 = item.indexOf('③');
                        const itemNo4 = item.indexOf('④');
                        const itemEnd = item.indexOf('정보처리기사');
                        const item1 = item.substring(itemNo1, itemNo2);
                        const item2 = item.substring(itemNo2, itemNo3);
                        const item3 = item.substring(itemNo3, itemNo4);
                        let item4 = '';
                        if (questionNo !== 100) {
                            item4 = item.substring(itemNo4);
                        } else {
                            item4 = item.substring(itemNo4, itemEnd);
                        }
                        q.item1 = item1;
                        q.item2 = item2;
                        q.item3 = item3;
                        q.item4 = item4;

                        questionArr.push(q);
                    }
                }
                
                const textArr = text.split('\n');
                const regexAsnwer = /^[①②③④]+$/;
                const answerArr = [];
                const changeAnswerStrToint = {
                    '①' : 1,
                    '②' : 2,
                    '③' : 3,
                    '④' : 4,
                }
                // 답변 배열 만들기
                for (const item of textArr) {
                    if (regexAsnwer.test(item)) {
                        for (const item2 of item) {
                            answerArr.push(changeAnswerStrToint[item2]);
                        }
                    }
                }

                // 문제에 맞는 답 넣기
                for (let i = 0; i < questionArr.length; i++) {
                    questionArr[i].answer = answerArr[i]
                }

                setCbtData(questionArr);
            } else {
                utils.showToast("pdf 로딩 실패", res.error);
            }
        });
    };

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

    useEffect(() => {
        getCbtList();
    }, [])

    return (
        <>
            <Modal isOpen={isListModalOpen} onClose={() => setIsListModalOpen(false)}>
                <div>
                    <SggGridReact
                        sggRef={(null)}
                        sggColumns={cbtListGridCol} // 그리드 컬럼 Array
                        sggBtn={{'c': false, 'r': true, 'u': false, 'd': true, saveBtn : deleteCbt}} // 그리드 위 행 CRUD 버튼, c/r/u/d boolean, saveBtn fnc
                        sggData={{gridData: cbtListData, setGridData: setCbtListData}} // 데이터 state, 적용(저장) 버튼 시 setState, 총 수 (앞단 페이징일 경우 필요 X) state
                        // sggSearchParam={{searchForm: searchForm, setSearchParam: setSearchParam, doSearch: doSearch}} // 검색조건 입력 폼 Array, 검색조건 setState, 검색 조회 버튼 fnc {3개는 세트로 하나 있으면 다 있어야함}
                        sggGridChecked={true} // 그리드 좌측 체크박스 boolean
                        sggGridFormChange={{resize: true, headerMove: true, rowMove: true}} // 컬럼 리사이징 boolean, 컬럼 이동 boolean, 행 이동 boolean
                        sggPaging={false} // 페이징 여부 boolean
                        // sggTrOnClick={(e, item) => {console.log(item)}} // 행 클릭 시 fnc
                        sggTrOnDoubleClick={(e, item) => {cbtListGridDoubleClick(item)}} // 행 더블 클릭 시 fnc
                    />
                </div>
            </Modal>
            <Modal isOpen={isModalOpen} onClose={() => (setIsModalOpen(false), setReadOnlyTF(resetReadOnlyTF))} onConfirm={onConfirmModal}>
                {readOnlyTF.question === true ? 
                        <textarea
                            className="input"
                            data-name='question'
                            name="question"
                            style={{ width: '500px', height: '80px', resize: 'vertical' }}
                            value={selectedCbtData.question}
                            onChange={onChangeValueSelected}
                            onDoubleClick={onDoubleClickModalItem}
                        />
                    :
                        <h4 data-name='question' onDoubleClick={onDoubleClickModalItem}>
                            {selectedCbtData.question || '...'}
                        </h4>
                }
                {selectedCbtData.image && 
                    <div style={{ position: 'relative', display: 'inline-block' }}>
                        <button
                            onClick={handleImageDelete}
                            style={{
                                position: 'absolute',
                                top: '5px',
                                right: '5px',
                                background: 'red',
                                color: 'white',
                                border: 'none',
                                borderRadius: '50%',
                                width: '24px',
                                height: '24px',
                                cursor: 'pointer',
                                fontWeight: 'bold',
                                lineHeight: '20px',
                            }}
                        >
                            ×
                        </button>
                        <img src={selectedCbtData.image}></img>
                    </div>
                }

                {readOnlyTF.item1 === true ?
                        <textarea
                            className="input"
                            name="item1"
                            data-name='item1'
                            style={{ width: '500px', height: '80px', resize: 'vertical' }}
                            value={selectedCbtData.item1}
                            onChange={onChangeValueSelected}
                            onDoubleClick={onDoubleClickModalItem}
                        />
                    :
                        <p data-name='item1' onDoubleClick={onDoubleClickModalItem}>
                            {selectedCbtData.item1 || '...'}
                        </p>
                }
                {readOnlyTF.item2 === true ?
                        <textarea
                            className="input"
                            name="item2"
                            data-name='item2'
                            style={{ width: '500px', height: '80px', resize: 'vertical' }}
                            value={selectedCbtData.item2}
                            onChange={onChangeValueSelected}
                            onDoubleClick={onDoubleClickModalItem}
                        />
                    :
                        <p data-name='item2' onDoubleClick={onDoubleClickModalItem}>
                            {selectedCbtData.item2 || '...'}
                        </p>
                }
                {readOnlyTF.item3 === true ?
                        <textarea
                            className="input"
                            name="item3"
                            data-name='item3'
                            style={{ width: '500px', height: '80px', resize: 'vertical' }}
                            value={selectedCbtData.item3}
                            onChange={onChangeValueSelected}
                            onDoubleClick={onDoubleClickModalItem}
                        />
                    :
                        <p data-name='item3' onDoubleClick={onDoubleClickModalItem}>
                            {selectedCbtData.item3 || '...'}
                        </p>
                }
                {readOnlyTF.item4 === true ?
                        <textarea
                            className="input"
                            name="item4"
                            data-name='item4'
                            style={{ width: '500px', height: '80px', resize: 'vertical' }}
                            value={selectedCbtData.item4}
                            onChange={onChangeValueSelected}
                            onDoubleClick={onDoubleClickModalItem}
                        />
                    :
                        <p data-name='item4' onDoubleClick={onDoubleClickModalItem}>
                            {selectedCbtData.item4 || '...'}
                        </p>
                }
                {readOnlyTF.answer === true ?
                        <>
                            정답 : 
                            <input
                                type='input'
                                className="input"
                                name="answer"
                                data-name='answer'
                                value={selectedCbtData.answer}
                                onChange={onChangeValueSelected}
                                onDoubleClick={onDoubleClickModalItem}
                            />
                        </>
                    :
                        <p data-name='answer' onDoubleClick={onDoubleClickModalItem}>
                            정답 : {selectedCbtData.answer}
                        </p>
                }
            </Modal>
            <div>
                <input type="file" className='inputFile' accept="application/pdf" onChange={handleFileChange} />
                <button type='button' className='button' onClick={handleUpload}>변환</button>
            </div>
                <button type='button' className='button' onClick={onClickBtnList}>목록</button>

            <div>
                <input type='number' className='input' name='year' value={title.year} onChange={onChangeValue}/> 년도 <input type='number' className='input' name='count' value={title.count} onChange={onChangeValue}/> 월
                <SggGridReact
                    sggRef={(null)}
                    sggColumns={cbtGridCol} // 그리드 컬럼 Array
                    sggBtn={{'c': false, 'r': onClickBtnReset, 'u': false, 'd': false, saveBtn : saveCbtGrid}} // 그리드 위 행 CRUD 버튼, c/r/u/d boolean, saveBtn fnc
                    sggData={{gridData: cbtData, setGridData: setCbtData}} // 데이터 state, 적용(저장) 버튼 시 setState, 총 수 (앞단 페이징일 경우 필요 X) state
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
