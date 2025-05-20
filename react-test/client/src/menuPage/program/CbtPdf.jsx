import { useEffect, useRef, useState } from 'react';
import * as utils from '@utils';

import Modal from '@components/Modal';
import SggGridReact from '@components/SggGridReact';

function CbtPdf( props ) {
    // input file
    const fileRef = useRef(null);
    const [cbtType, setCbtType] = useState('written'); // CBT 유형
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

    const [disabledTitle, setDisabledTitle] = useState(true);

    // 목록
    const [writtenCbtListData, setWrittenCbtListData] = useState([]);
    const [practicalCbtListArr, setPracticalCbtListArr] = useState([]);

    // 그리드 저장 버튼
    const [disabledSaveBtn, setDisabledSaveBtn] = useState(true);

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
                    item.imageYN = '';
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
        setIsListModalOpen(true);
    }

    // 목록 그리드 더블클릭
    const cbtListGridDoubleClick = (item) => {
        getCbtData(item.fileName);
        let year = '';
        let count = '';
        if (cbtType === 'practical') {
            year = item.fileName.substring(2, 6);
            count = item.fileName.substring(6);
        } else {
            year = item.fileName.substring(0, 4);
            count = item.fileName.substring(4);
        }
        setTitle({
            year: year,
            count: count,
        });
        setIsListModalOpen(false);

        setDisabledTitle(true);

        setDisabledSaveBtn(false);
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

            setDisabledTitle(false);

            setCbtFile(null);

            setDisabledSaveBtn(true);
        }
    }

    // 저장
    const saveCbtGrid = async (item) => {
        const saveTitle = (cbtType === 'practical' ? 'p_' : '') + (title.year + title.count);

        for (const item2 of item) {
            if (cbtType === 'practical') {
                item2.test = 'p_' + title.year + title.count;
            } else {
                item2.test = title.year + title.count;
            }
        }

        for (const item2 of item) {
            if (!item2.question) {
                utils.showToast('문제를 입력해주세요');
                return;
            }

            if (!item2.answer) {
                utils.showToast('정답을 입력해주세요');
                return;
            }

            if (cbtType === 'written') {
                if (!item2.item1) {
                    utils.showToast('보기1을 입력해주세요');
                    return;
                }
                if (!item2.item2) {
                    utils.showToast('보기2를 입력해주세요');
                    return;
                }
                if (!item2.item3) {
                    utils.showToast('보기3을 입력해주세요');
                    return;
                }
                if (!item2.item4) {
                    utils.showToast('보기4를 입력해주세요');
                    return;
                }
            }
        }

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
                        item.imageYN = '';
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
            const regexNumber = /[^0-9]/g;
            const fileName = file.name.replaceAll(regexNumber, '');

            const fileNameYear = fileName.substring(0, 4);
            const fileNameCount = ('00' + fileName.substring(4, 6)).slice(-2);
            setTitle({
                year: fileNameYear,
                count: fileNameCount,
            });

            setDisabledTitle(false);
            setDisabledSaveBtn(true);
            setCbtFile(file);
        }
    };

    // 파일 업로드 핸들러
    const handleUpload = async () => {
        const formData = new FormData();
        formData.append("pdf", cbtFile);

        utils.postAxiosFile('/pdfReader/uploadPdf', formData).then((res) => {
            if (res.msg === 'success') {
                const data = res.data;
                const text = data.text;
                
                let dataArr = [];
                if (cbtType === 'written') {
                    dataArr = getCbtWritten(text);
                }
                if (cbtType === 'practical') {
                    dataArr = getCbtPractical(text);
                }
                setCbtData(dataArr);

                setDisabledSaveBtn(false);
                utils.showToast('pdf 변환 완료');
            } else {
                utils.showToast("pdf 로딩 실패", res.error);
            }
        });
    };

    // 필기 pdf 변환
    const getCbtWritten = (text) => {
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
                q.imageYN = '';

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

        return questionArr;
    }

    // 실기 pdf 변환
    const getCbtPractical = (text) => {
        const regexHDTeacher = /\[\d{4}년\s?\d{1,2}회\s?정보처리기사\s?실기\]\s?기출해설\s?특강\s?학습자료/g;
        const regexNullCode = /\u0000/g;
        text = text.replaceAll(regexNullCode, ' ');
        text = text.replaceAll(regexHDTeacher, '');
        text = text.replaceAll('with. 흥달쌤', '');
        // 문제,  보기
        const questionArr = [];
        let questionText = text;
        for (let i = 1; i <= 20; i++) {
            let questionNo = '00';
            questionNo = questionNo + i;
            questionNo = questionNo.slice(-2);
            questionNo = questionNo + '.';
            const questionIdx = questionText.indexOf(questionNo);

            let nextQuestionNo = '00';
            if (i < 20) {
                nextQuestionNo = nextQuestionNo + (i + 1);
                nextQuestionNo = nextQuestionNo.slice(-2);
                nextQuestionNo = nextQuestionNo + '.';
            } else {
                nextQuestionNo = '정답';
            }
            const nextQuestionIdx = questionText.indexOf(nextQuestionNo);

            const question = questionText.substring(questionIdx, nextQuestionIdx)
                                        .replace('시오.', '시오.\n')
                                        .split('').map(ch => {
                                            const code = ch.charCodeAt(0);
                                            return (code === 376) ? '• ' : ch;
                                        })
                                        .join('');
            questionText = questionText.substring(questionIdx);
            questionArr.push(question);
        }

        // 정답
        const answerArr = [];
        const answerText = text.substring(text.indexOf('정답') + 3);
        const answerTextArr = answerText.split('\n');
        let answer = '';
        const regexAnswer = /^(0[1-9]|1[0-9]|20)[\s\S]*/;
        for (let i = 0; i < answerTextArr.length; i++) {
            if (regexAnswer.test(answerTextArr[i])) {
                if (i !== 0) {
                    answerArr.push(answer.substring(2));
                }
                answer = answerTextArr[i];
            } else {
                answer += answerTextArr[i];
            }

            if (i === answerTextArr.length - 1) {
                answerArr.push(answer.substring(2));
            }
        }

        const returnArr = [];
        for (let i = 0; i < questionArr.length; i++) {
            const q = {};
            q.no = i + 1;
            q.question = questionArr[i];
            q.answer = answerArr[i];
            q.imageYN = '';

            returnArr.push(q);
        }

        return returnArr;
    }

    // 목록 가져오기
    const getCbtList = async () => {
        utils.getAxios('/cbt/getList').then((res) => {
            if (res.msg === 'success') {
                const data = res.data;
                const writtenCbtListArr = [];
                const practicalCbtListArr = [];
                for (const item of data) {
                    const cbtItem = {fileName : item.replace('.json', '')};
                    if (item.indexOf('p_') > -1) {
                        practicalCbtListArr.push(cbtItem);
                    } else {
                        writtenCbtListArr.push(cbtItem);
                    }
                }
                setWrittenCbtListData(writtenCbtListArr);
                setPracticalCbtListArr(practicalCbtListArr);
    
                utils.showToast('목록 조회 완료');
            } else {
                utils.showToast('목록 조회 실패', res.error);
            }
        });
    }

    useEffect(() => {
        getCbtList();
    }, [])

    useEffect(() => {
        if (cbtFile) {
            handleUpload();
        } else {
            setDisabledSaveBtn(true);
            fileRef.current.value = null;
        }
    }, [cbtFile]);

    useEffect(() => {
        onClickBtnReset('ALL');
    }, [cbtType]);

    useEffect(() => {
        if (cbtType === 'practical') {
            const questionElement = document.querySelector('.textarea[name="question"]');
            if (questionElement) {
                const nowHeight = (questionElement.style.height).replace('px', '');
                if (nowHeight < questionElement.scrollHeight) {
                    questionElement.style.height = 'auto';
                    questionElement.style.height = `${questionElement.scrollHeight}px`;
                }
            }
        }
    }, [selectedCbtData.question]);

    useEffect(() => {
        if (cbtType === 'practical') {
            const answerElement = document.querySelector('.textarea[name="answer"]');
            if (answerElement) {
                const nowHeight = answerElement.style.height;
                if (nowHeight < answerElement.scrollHeight) {
                    answerElement.style.height = 'auto';
                    answerElement.style.height = `${answerElement.scrollHeight}px`;
                }
            }
        }
    }, [selectedCbtData.answer]);

    return (
        <>
            <Modal isOpen={isListModalOpen} onClose={() => setIsListModalOpen(false)}>
                <button type='button' className='button primary' onClick={getCbtList}>새로고침</button>
                <div>
                    <SggGridReact
                        sggRef={(null)}
                        sggColumns={cbtListGridCol} // 그리드 컬럼 Array
                        sggBtn={{'c': false, 'r': true, 'u': false, 'd': true, saveBtn : deleteCbt}} // 그리드 위 행 CRUD 버튼, c/r/u/d boolean, saveBtn fnc
                        sggData={{gridData: (cbtType === 'written' ? writtenCbtListData : practicalCbtListArr), setGridData: (cbtType === 'written' ? setWrittenCbtListData : setPracticalCbtListArr)}} // 데이터 state, 적용(저장) 버튼 시 setState, 총 수 (앞단 페이징일 경우 필요 X) state
                        // sggSearchParam={{searchForm: searchForm, setSearchParam: setSearchParam, doSearch: doSearch}} // 검색조건 입력 폼 Array, 검색조건 setState, 검색 조회 버튼 fnc {3개는 세트로 하나 있으면 다 있어야함}
                        sggGridChecked={true} // 그리드 좌측 체크박스 boolean
                        sggGridFormChange={{resize: true, headerMove: true, rowMove: true}} // 컬럼 리사이징 boolean, 컬럼 이동 boolean, 행 이동 boolean
                        sggPaging={false} // 페이징 여부 boolean
                        sggTrOnClick={(e, item) => {cbtListGridDoubleClick(item)}} // 행 클릭 시 fnc
                        // sggTrOnDoubleClick={(e, item) => {cbtListGridDoubleClick(item)}} // 행 더블 클릭 시 fnc
                    />
                </div>
            </Modal>
            <Modal isOpen={isModalOpen} onClose={() => (setIsModalOpen(false), setReadOnlyTF(resetReadOnlyTF))} onConfirm={onConfirmModal}>
                <div>
                    {readOnlyTF.question === true ? 
                            <textarea
                            className="textarea"
                            data-name='question'
                            name="question"
                            style={{ width: '500px', height: '80px', resize: 'vertical' }}
                            value={selectedCbtData.question}
                            onChange={onChangeValueSelected}
                            onDoubleClick={onDoubleClickModalItem}
                            />
                        : cbtType === 'written' ?
                                <h4 data-name='question' onDoubleClick={onDoubleClickModalItem}>
                                    {selectedCbtData.question || '...'}
                                </h4>
                            :
                                <textarea
                                    className="textarea"
                                    data-name='question'
                                    name="question"
                                    style={{ width: '500px', height: '200px', resize: 'vertical', border: 'none' }}
                                    value={selectedCbtData.question}
                                    onChange={onChangeValueSelected}
                                />
                        }
                </div>
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
                {cbtType === 'written' &&
                    <>
                        {readOnlyTF.item1 === true ?
                                <textarea
                                className="textarea"
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
                                className="textarea"
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
                                className="textarea"
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
                                className="textarea"
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
                    </>
                }
                {readOnlyTF.answer === true ?
                    cbtType === 'written' ?
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
                        :
                            <div>
                                <p>정답</p>
                                <textarea
                                    className="textarea"
                                    data-name='answer'
                                    name="answer"
                                    style={{ width: '500px', height: '100px', resize: 'vertical', border: 'none' }}
                                    value={selectedCbtData.answer}
                                    onChange={onChangeValueSelected}
                                />
                            </div>
                }
            </Modal>
            
            <div>
                <label>
                    <input type='radio' name='cbtType' value='written' onChange={(e) => {setCbtType(e.target.value)}} checked={cbtType === 'written'} /> 필기
                </label>
                <label>
                    <input type='radio' name='cbtType' value='practical' onChange={(e) => {setCbtType(e.target.value)}} checked={cbtType === 'practical'} /> 실기
                </label>
            </div>

            <div>
                <button type='button' className='button' onClick={onClickBtnList}>목록</button>
                <input type="file" className='inputFile' accept="application/pdf" ref={fileRef} onChange={handleFileChange} />
            </div>

            <div>
                <input type='number' className='input' name='year' value={title.year} onChange={onChangeValue} disabled={disabledTitle}/> 년도 <input type='number' className='input' name='count' value={title.count} onChange={onChangeValue} disabled={disabledTitle}/> 월
                <SggGridReact
                    sggRef={(null)}
                    sggColumns={cbtGridCol} // 그리드 컬럼 Array
                    sggBtn={{'c': false, 'r': onClickBtnReset, 'u': false, 'd': false, saveBtn : saveCbtGrid, disabled : {saveBtn : disabledSaveBtn}}} // 그리드 위 행 CRUD 버튼, c/r/u/d boolean, saveBtn fnc
                    sggData={{gridData: cbtData, setGridData: setCbtData}} // 데이터 state, 적용(저장) 버튼 시 setState, 총 수 (앞단 페이징일 경우 필요 X) state
                    // sggSearchParam={{searchForm: searchForm, setSearchParam: setSearchParam, doSearch: doSearch}} // 검색조건 입력 폼 Array, 검색조건 setState, 검색 조회 버튼 fnc {3개는 세트로 하나 있으면 다 있어야함}
                    sggGridChecked={false} // 그리드 좌측 체크박스 boolean
                    sggGridFormChange={{resize: true, headerMove: true, rowMove: true}} // 컬럼 리사이징 boolean, 컬럼 이동 boolean, 행 이동 boolean
                    sggPaging={false} // 페이징 여부 boolean
                    sggTrOnClick={(e, item) => {cbtGridDoubleClick(item)}} // 행 클릭 시 fnc
                    // sggTrOnDoubleClick={(e, item) => {cbtGridDoubleClick(item)}} // 행 더블 클릭 시 fnc
                    />
            </div>
        </>
    );
}

export default CbtPdf;
