import { useEffect, useRef, useState, forwardRef, useImperativeHandle } from 'react';

import styles from '@css/SggGridReact.module.css';

/**
 * @param {sggRef={sggRef}}
 * useRef
 * @param {sggColumns={[{key:'', name:'', type:'', auth:'' width: 10},]}}
 * useState [{*key:'데이터와 매칭할 실컬럼명'
 *          *name:'헤더명칭'
 *          type:'number/text/password/checkbox/select/image/a'(행수정시 인풋타임)
 *          auth: 'cu' 특정 그리드 버튼에만 수정 작용
 *          option: select의 options (useState) width: 10}] state 속의 state라서 리랜더링이 안되기 때문에 useEffect로 option 리랜더링 시 setColumns 설정 필요
 *                  ex) useEffect(() => {
                            for (const item of columns) {
                                if (item.key === 'userAuth') {
                                    item.option = typeOption;
                                }
                            }
                            setGridCol(columns)
                        }, [typeOption])
 *          width: 헤더 컬럼 비율
 * @param {sggData={{gridData: gridData, setGridData: setGridData, totalCount: totalCount}}}
 * useState *gridData(그리드에 담을 데이터)
 * setUseState *setGridData(그리드 데이터 set)
 * useState totalCount(데이터 총 수 - 없으면 앞단 페이징 처리)
 * @param {sggBtn={{'c': true, 'r': true, 'u': true, 'd': true, saveBtn: saveBtn, disabled: {'c': true/false, 'r': true/false, 'u': true/false, 'd': true/false, 'saveBtn': true/false}}}}
 * obj {'c': true/false(행추가버튼), 'r': true/false(초기화버튼), 'u': true/false(행수정버튼), 'd': true/false(행삭제버튼)}
 * function {c, r, u, d, saveBtn} 기본 crud의 콜백함수로 작동
 * boolean disabled
 * function saveBtn (적용 버튼 추가 로직 (setGridData 비동기 이슈로 doSave function에 매개변수 처리 doSave = (data) => {} 필수))
 * @param {sggSearchParam={{searchForm: searchForm, setSearchParam: setSearchParam, doSearch: doSearch}}}
 * sggSearchParam의 3개는 세트
 * Array searchForm 
 * - 검색조건 입력 폼에 들어갈 태그 (검색조건) - state로 하면 option state 상태 변경 시 리랜더링 안됨
 * - *key: 컬럼명, *type: input type || select, *placeholder: placeholder, *option: select의 options (useState) ...: 기타 속성들 (readonly:true, disabled: true 등)
 * setState setSearchParam
 * - *page: 1, *row: 10, (검색조건) 서버 페이징 시 page, row 필수
 * function doSearch
 * - 조회 함수
 * @param {sggGridChecked={true}}
 * boolean true (그리드 첫 컬럼 체크박스)
 * @param {sggGridFormChange={{resize: true, headerMove: true, rowMove: true}}}
 * boolean
 * resize : 헤더 컬럼 사이즈 변경
 * headerMove : 헤더 컬럼 드래그드롭 순서 이동
 * rowMove : 행 드래그드롭 순서 이동
 * @param {sggTrOnClick={(e, item) => {}}}
 * function sggTrOnClick (행 클릭 추가 로직 (e, item) 매개변수 처리 필수)
 * @param {sggTrOnDoubleClick={(e, item) => {}}}
 * function sggTrOnDoubleClick (행 더블클릭 추가 로직 (e, item) 매개변수 처리 필수)
 * @param {sggPaging={true}}
 * boolean 페이징 여부
 * @returns 
 */
export default function SggGridReact({ sggRef,
                                        sggData, 
                                        sggColumns = [], 
                                        sggBtn, 
                                        sggSearchParam, 
                                        sggTrOnClick, 
                                        sggTrOnDoubleClick, 
                                        sggGridChecked = false, 
                                        sggGridFormChange = {resize: false, headerMove: false, rowMove: false}, 
                                        sggPaging = true }) {
    // toast
    const toastRef = useRef(null);
    // 상태컬럼
    const stateTd = '48';
    // 현재 페이지
    const [currentPage, setCurrentPage] = useState(1);
    // 데이터 목록
    const [currentList, setCurrentList] = useState([]);
    // 선택 행
    const [selectedRow, setSelectedRow] = useState(null);
    // 페이지당 데이터 개수
    const [perPage, setPerPage] = useState(10);
    // 페이지 버튼 개수
    const [pageBtnCount, setPageBtnCount] = useState(10);
    // 컬럼별 체크박스
    const [allCheck, setAllCheck] = useState(sggColumns?.filter(col => col.type === 'checkbox'));
    // 가장 앞에 오는 순수 선택용 체크박스
    const [totalCheck, setTotalCheck] = useState(false);
    // 컬럼
    const [computedColumns, setComputedColumns] = useState([]);
    // 선택행들
    const [checkedRows, setCheckedRows] = useState([]);

    // 총 가로 화면 뽑아오기용
    const gridRef = useRef(null);

    // input required 체크용
    const searchFormInputRef = useRef(null);

    // 행 클릭 시
    const trClick = (e, item) => {
        setSelectedRow(item);
        if (sggTrOnClick) {
            sggTrOnClick(e, item);
        }
    }

    // 행 더블 클릭 시
    const trDoubleClick = (e, item) => {
        if (sggTrOnDoubleClick) {
            setSelectedRow(item);
            sggTrOnDoubleClick(e, item);
        } else {
            if (sggBtn && sggBtn.u) {
                let state = item.rowState;
                if (state !== 'INSERT' && state !== 'DELETE') {
                    updateRow('row');
                }
            }
        }
    }

    // 그리드 td select 클릭
    const clickSelectTr = (e, disabledNow) => {
        if (!disabledNow) {
            e.preventDefault();
        }
    }

    // 화면 그릴 때 체크 여부
    const setCheckValue = (key, value) => {
        let trueFalse = false;
        for (const col of computedColumns) {
            if (col.key === key) {
                if (col.type === 'checkbox') {
                    trueFalse = value === col.trueValue;
                }
                break;
            }
        }
        return trueFalse;
    }

    // 화면 그릴 때 체크 여부 첫번째
    const setCheckValueFirst = (key, value) => {
        let trueFalse = false;
        for (const item of currentList) {
            if (item.no === key) {
                item.totalChecked ? trueFalse = true : trueFalse = false;
            }
        }
        return trueFalse;
    }

    // 체크박스 값 가져오기
    const getCehckValue = (key, trueFalse) => {
        let value = '';
        for (const col of computedColumns) {
            if (col.key === key) {
                if (col.type === 'checkbox') {
                    value = trueFalse ? col.trueValue : col.falseValue;
                }
                break;
            }
        }
        return value;
    }
    
    // 전체 선택 클릭
    const allCheckBox = (e) => {
        const key = e.target.name;
        if (!sggBtn.u && key !== 'totalChecked') {
            return false;
        }

        let value = getCehckValue(key, e.target.checked);

        setCurrentList((prevList) =>
            prevList.map((item) => ({
                ...item,
                [key]: value,
            }))
        );
    }

    // checked 설정 시 전체선택
    const allCheckBoxFirst = (e) => {
        setTotalCheck(e.target.checked);

        let newCurrentList = structuredClone(currentList);
        for (const item of newCurrentList) {
            item.totalChecked = e.target.checked;
        }
        setCurrentList(newCurrentList);

        let newGridData = structuredClone(sggData.gridData);
        let chkDifferent = 0;
        for (const item of newGridData) {
            if (item.totalChecked !== e.target.checked) {
                chkDifferent++;
                item.totalChecked = e.target.checked;
            }
        }

        if (sggData?.setGridData && chkDifferent > 0) {
            sggData.setGridData(newGridData);
        }
    }

    // 전체 체크 박스 체크 여부
    const checkChecked = (name) => {
        for (const item of allCheck) {
            if (name === item.key) {
                return !!item.checked;
            }
        }
        return false;
    }

    // 검색조건 값 변경시
    const searchInputChange = (e) => {
        let { name, value } = e.target;

        sggSearchParam.setSearchParam((prev) => ({
            ...prev,
            [name]: value,
        }));
    }

    // 검색조건 엔터키
    const searchInputKeyDown = (e) => {
        if (e.key === 'Enter') {
            const current = searchFormInputRef.current;
            const inputTags = current.querySelectorAll('input');
            for (let i = 0; i < inputTags.length; i++) {
                if (inputTags[i] === e.target) {
                    if (i === inputTags.length - 1) {
                        sggSearchParam.doSearch();
                    } else {
                        inputTags[i + 1].focus();
                    }
                }
            }
        }
    }

    // 검색조건 초기화
    const onBtnSearchReset = (e) => {
        const current = searchFormInputRef.current;
        const inputTags = current.querySelectorAll('input');
        let newSearchParam = {};
        for (const item of inputTags) {
            item.value = '';
            newSearchParam[item.name] = '';
        }

        const selectTags = current.querySelectorAll('select');
        for (const item of selectTags) {
            if (item.options.length > 0) {
                item.value = item.options[0].value; // 첫 번째 option 선택
                newSearchParam[item.name] = item.options[0].value;
            }
        }

        sggSearchParam.setSearchParam((prev) => {
            const updated = {
                ...prev,             // 기존 값 유지
                ...newSearchParam,   // 동일한 키는 덮어씀
            };
            return updated;
        });
    }

    const checkRequired = (ref) => {
        const requiredTag = ref.current.querySelectorAll('[required]');
        for (const item of requiredTag) {
            const tagValue = item.value;
            if (!tagValue.trim() || tagValue.trim() === '') {
                item.focus();
                let msg = ' 은(는) 필수값 입니다.';
                if (item.id && ref.current.querySelector('label[' + item.id + ']')?.innerText) {
                    let innerText = ref.current.querySelector('label[' + item.id + ']').innerText;
                    msg = innerText + msg;
                    toastRef.current.showToast(msg);
                } else if (item.placeholder) {
                    msg = item.placeholder + msg;
                    toastRef.current.showToast(msg);
                }
                return false;
            }
        }
        return true;
    }

    // 검색조건 조회
    const onBtnSearchClick = (e) => {
        // 검색조건 필수값 체크
        if (!checkRequired(searchFormInputRef)) {
            return false;
        }

        if (currentPage !== 1) {
            setCurrentPage(1);
        } else {
            sggSearchParam.doSearch();
        }
    }
    
    // 그리드에서 input 값 변경 시
    const inputChange = (e) => {
        let { name, value, type } = e.target;

        let no = '';
        if (selectedRow) {
            no = selectedRow.no;
        }

        if (type === 'checkbox') {
            value = getCehckValue(name, e.target.checked);
            no = Number(e.target.dataset.checkbox);
            if (!sggBtn.u && name !== 'totalChecked') {
                return false;
            }
        }

        // 상태값 체크
        let state = '';
        for (const item of currentList) {
            if (item.no === no) {
                state = item.rowState;
                break;
            }
        }
        
        // insert는 그대로 insert
        if (state === 'INSERT') {
            state = 'INSERT';
        } else {
            state = 'UPDATE';
        }

        setCurrentList((prevList) =>
                prevList.map((item) =>
                    item.no === no ? { ...item, [name]: value, rowState: state } : item
            )
        );
    }

    // 첫 체크박스 값 변경시
    const setFirstCheck = (e) => {
        let no = Number(e.target.dataset.checkbox);

        let newCurrentList = structuredClone(currentList);
        for (const item of newCurrentList) {
            if (item.no === no) {
                item.totalChecked = e.target.checked;
            }
        }
        setCurrentList(newCurrentList);

        let newGridData = structuredClone(sggData.gridData);
        let chkDifferent = 0;
        for (const item of newGridData) {
            if (item.no === no) {
                if (item.totalChecked !== e.target.checked) {
                    chkDifferent++;
                }
                item.totalChecked = e.target.checked;
            }
        }

        if (sggData?.setGridData && chkDifferent > 0) {
            sggData.setGridData(newGridData);
        }
    }

    // 그리드 랜더링 시 타입에 맞는 값 리턴
    const getType = (item, col) => {
        const stateToCRUD = {
            INSERT: 'c',
            UPDATE: 'u',
        }

        const crudAuth = col.auth ? col.auth?.indexOf(stateToCRUD[item.rowState]) > -1 : true;
        if (col.type === 'number') {
            return selectedRow && selectedRow.no === item.no && item.rowState && crudAuth ? <div style={{ padding: '0px 20px' }}>
                                                                                    <input type="number" name={col.key} value={item[col.key]} className={styles.tdInput} onChange={inputChange} />
                                                                                </div>
                                                                            : <span title={item[col.key]}>{item[col.key]}</span>;
        }
        if (col.type === 'text') {
            return selectedRow && selectedRow.no === item.no && item.rowState && crudAuth ? <div style={{ padding: '0px 20px' }}>
                                                                                    <input type="text" name={col.key} value={item[col.key]} className={styles.tdInput} onChange={inputChange} />
                                                                                </div>
                                                                            : <span title={item[col.key]}>{item[col.key]}</span>;
        }
        if (col.type === 'password') {
            return selectedRow && selectedRow.no === item.no && item.rowState && crudAuth ? <div style={{ padding: '0px 20px' }}>
                                                                                    <input type="password" name={col.key} value={item[col.key]} className={styles.tdInput} onChange={inputChange} />
                                                                                </div>
                                                                            : '****';
        }
        if (col.type === 'checkbox') {
            let value = setCheckValue(col.key, item[col.key]);
            return <input type="checkbox" name={col.key} data-checkbox={item.no} checked={value} style={{ width: '15px', height: '15px', border: 'none', backgroundColor: 'transparent' }} onChange={inputChange} />;
        }
        if (col.type === 'select') {
            const className = selectedRow && selectedRow.no === item.no && item.rowState ? styles.selected : styles.diSelected;
            const disabledNow = !!(selectedRow && selectedRow.no === item.no && item.rowState);

            const option = col.option;
            return <select name={col.key} value={item[col.key]} onChange={inputChange} className={className + ' ' + styles.tdSelect} onMouseDown={(e) => clickSelectTr(e, disabledNow)}>
                        {option?.map((opt) => (
                            <option key={item.no + '-' + item.key + '-' + opt.value} value={opt.value}>
                                {opt.label}
                            </option>
                        ))}
                    </select>
        }
        if (col.type === 'image') {
            return <img src={item[col.key]} name={col.key} value={item[col.key]} className={styles.tdImg} />
        }
        if (col.type === 'a') {
            return selectedRow && selectedRow.no === item.no && item.rowState && crudAuth ? <div style={{ padding: '0px 20px' }}>
                                                                                    <input type="text" name={col.key} value={item[col.key]} className={styles.tdInput} onChange={inputChange} />
                                                                                </div>
                                                                            : <a href={item[col.key]} target="_blank" >{item[col.key]}</a>;
        }
        if (col.type === 'button') {
            let btnDisabled = false;
            if (typeof col.btn.disabled === 'boolean') {
                btnDisabled = col.btn.disabled;
            }

            if (typeof col.btn.disabled === 'function') {
                btnDisabled = col.btn.disabled(item);
            }

            return <button type='button' 
                            className={col.btn.className || 'button'} 
                            onClick={(e) => {e.stopPropagation(); if (col.btn.onClick) col.btn.onClick(item);}}
                            disabled={btnDisabled}
                    >{col.btn.btnText}</button>
        }
        if (!col.type) {
            return <span title={item[col.key]}>{item[col.key]}</span>;
        }
    }

    // 그리드 행추가
    const addRow = () => {
        const newRow = {
            no: currentList.length + 1,
            rowState: 'INSERT',
        };

        let newCurrentList = structuredClone(currentList);
        for (const item of newCurrentList) {
            const no = item.no;

            if (Number(newRow.no) <= Number(no)) {
                newRow.no = Number(no) + 1;
            }
        }

        let arrIdx = 0;
        if (selectedRow) {
            for (let i = 0; i < newCurrentList.length; i++) {
                if (newCurrentList[i].no === selectedRow.no) {
                    arrIdx = i + 1;
                    break;
                }
            }
        } else {
            arrIdx = 0;
        }
        newCurrentList.splice(arrIdx, 0, newRow);
        sggData.gridData.splice(arrIdx, 0, newRow);
        setCurrentList(newCurrentList);
        setSelectedRow(newRow);

        if (typeof sggBtn.c === 'function') {
            sggBtn.c();
        }
    }

    // 그리드 행수정
    const updateRow = (type) => {
        if (checkedRows.length > 0 && type !== 'row') {
            let newCurrentList = structuredClone(currentList);
            for (const item of newCurrentList) {
                let state = item.rowState;
                if (item.totalChecked) {
                    if (state !== 'INSERT' && state !== 'DELETE') {
                        item.rowState = 'UPDATE';
                        for (const item2 of sggData.gridData) {
                            if (item.no === item2.no) {
                                item2.rowState = 'UPDATE';
                                break;
                            }
                        }
                    }
                }
            }

            setCurrentList(newCurrentList);

            if (typeof sggBtn.u === 'function') {
                sggBtn.u(newCurrentList.filter(item => item.rowState === 'UPDATE'));
            }
        } else if (selectedRow && type !== 'check') {
            let no = selectedRow.no;
            doUpdate(no);

            let newCurrentList = structuredClone(currentList);

            if (typeof sggBtn.u === 'function') {
                sggBtn.u(newCurrentList.filter(item => item.no === no));
            }
        } else {
            toastRef.current.showToast('수정할 행을 선택하세요.');
            return false;
        }
    }

    const doUpdate = (no) => {
        let state = '';
        for (const item of currentList) {
            if (item.no === no) {
                state = item.rowState;
                break;
            }
        }

        if (state === 'INSERT') {
            toastRef.current.showToast('신규 등록된 행은 수정할 수 없습니다.');
        } else {
            setCurrentList((prevList) =>
                prevList.map((item) =>
                    item.no === selectedRow.no ? { ...item, rowState: 'UPDATE' } : item
                )
            );

            for (const item of sggData.gridData) {
                if (item.no === no) {
                    item.rowState = 'UPDATE';
                }
            }
        }
    }

    // 그리드 행삭제
    const deleteRow = () => {
        if (checkedRows.length > 0) {
            toastRef.current.showToast('체크된 행을 삭제합니다.');

            let newCurrentList = structuredClone(currentList);
            for (const item of newCurrentList) {
                let state = item.rowState;
                if (item.totalChecked) {
                    if (state === 'INSERT') {
                        item.rowState = 'INSERTDELETE';
                    } else {
                        item.rowState = 'DELETE';
                    }

                    for (const item2 of sggData.gridData) {
                        if (item2.no === item.no) {
                            if (state === 'INSERT') {
                                item2.rowState = 'INSERTDELETE';
                            } else {
                                item2.rowState = 'DELETE';
                            }
                        }
                    }
                }
            }

            sggData.gridData = sggData.gridData.filter((item) => item.rowState !== 'INSERTDELETE');
            setCurrentList(newCurrentList.filter((item) => item.rowState !== 'INSERTDELETE'));

            if (typeof sggBtn.d === 'function') {
                sggBtn.d(newCurrentList.filter((item) => item.rowState === 'DELETE'));
            }
        } else if (selectedRow) {
            let no = selectedRow.no;
            let state = '';
            for (const item of currentList) {
                if (item.no === no) {
                    state = item.rowState;
                    break;
                }
            }

            if (state === 'INSERT') {
                sggData.gridData = sggData.gridData.filter((item) => item.no !== no);
                setCurrentList((prevList) => prevList.filter((item) => item.no !== no));

                if (typeof sggBtn.d === 'function') {
                    sggBtn.d(sggData.gridData);
                }
            } else {
                for (const item of sggData.gridData) {
                    if (item.no === selectedRow.no) {
                        item.rowState = 'DELETE';
                    }
                }
                
                setCurrentList((prevList) =>
                    prevList.map((item) =>
                        item.no === selectedRow.no ? { ...item, rowState: 'DELETE' } : item
                    )
                );

                if (typeof sggBtn.d === 'function') {
                    let newCurrentList = structuredClone(currentList);
                    newCurrentList.filter(item => item.no === selectedRow.no)[0].rowState = 'DELETE';
                    sggBtn.d(newCurrentList.filter(item => item.no === selectedRow.no));
                }
            }
            setSelectedRow(null);
        } else {
            toastRef.current.showToast('삭제할 행을 선택하세요.');
            return false;
        }
    }

    // 그리드 행 초기화
    const resetRow = () => {
        if (checkedRows.length > 0) {
            if (sggData?.setGridData) {
                sggData.setGridData((prev) => 
                    prev
                        .filter(item => !(item.totalChecked && item.rowState === 'INSERT')) // INSERT + 체크된 항목 제거
                        .map(item => {
                            if (item.totalChecked) {
                                const newItem = { ...item };
                                delete newItem.rowState;
                                delete newItem.totalChecked;
                                return newItem;
                            }
                            return item;
                        })
                );
            } else {
                let resetRowData = [];
                let newCurrentList = structuredClone(currentList);
                let noArr = [];
                for (const item of newCurrentList) {
                    let state = item.rowState;
                    if (item.totalChecked) {
                        if (state === 'INSERT') {
                            noArr.push(item.no);
                        } else {
                            for (let i = 0; i < sggData.gridData.length; i++) {
                                if (item.no === sggData.gridData[i].no) {
                                    delete sggData.gridData[i].rowState;
                                    delete sggData.gridData[i].totalChecked;
                                    resetRowData.push(sggData.gridData[i]);
                                }
                            }
                        }
                    } else {
                        resetRowData.push(item);
                    }
                }

                for (let i = 0; i < sggData.gridData.length; i++) {
                    for (const item of noArr) {
                        if (item === sggData.gridData[i].no) {
                            sggData.gridData.splice(i, 1);
                            i--;
                        }
                    }
                }

                setCurrentList(resetRowData);
            }

            toastRef.current.showToast('체크된 행을 초기화 합니다.');
        } else if (selectedRow) {
            let no = selectedRow.no;
            doReset(no);
            
            toastRef.current.showToast('행을 초기화 합니다.');
        } else {
            if (sggData?.setGridData) {
                sggData.setGridData((prev) =>
                    prev
                        .filter(item => item.rowState !== 'INSERT') // INSERT 항목 제거
                        .map(item => {
                            const newItem = { ...item };
                            delete newItem.rowState;
                            delete newItem.totalChecked;
                            return newItem;
                        })
                );
            } else {
                for (let i = 0; i < sggData.gridData.length; i++) {
                    let state = sggData.gridData[i].rowState;
    
                    if (state === 'INSERT') {
                        sggData.gridData.splice(i, 1);
                        i--;
                    } else {
                        delete sggData.gridData[i].rowState;
                        delete sggData.gridData[i].totalChecked;
                    }
                }
            }

            drawGrid(['totalChecked', 'rowState']);
            setColumn();
            toastRef.current.showToast('전체 행을 초기화 합니다.');
        }

        setSelectedRow(null);

        if (sggBtn && typeof sggBtn.r === 'function') {
            let msg = '';
            if (checkedRows.length > 0) {
                msg = 'CHECK';
            } else if (selectedRow) {
                msg = 'ROW';
            } else {
                msg = 'ALL';
            }
            sggBtn.r(msg);
        }
    }

    const doReset = (no) => {
        let resetRowData = {};
        for (const item of sggData.gridData) {
            if (item.no === no) {
                resetRowData = item;
                delete resetRowData.totalChecked;
                break;
            }
        }
        
        let state = '';
        for (const item of currentList) {
            if (item.no === no) {
                state = item.rowState;
                break;
            }
        }
        if (state === 'INSERT') {
            sggData.gridData.filter((item) => item.no !== no);
            setCurrentList((prevList) => prevList.filter((item) => item.no !== no));
        } else {
            for (const item of sggData.gridData) {
                if (item.no === no) {
                    delete item.rowState;
                }
            }
            setCurrentList((prevList) =>
                prevList.map((item) =>
                    item.no === no ? resetRowData : item
                )
            );
        }
        setSelectedRow(null);
    }

    // 그리드 데이터 적용
    const setRow = () => {
        let newCurrentList = structuredClone(currentList);

        for (let i = 0; i < newCurrentList.length; i++) {
            if (newCurrentList[i].totalChecked) {
                newCurrentList[i].setTotalChecked = true;
                delete newCurrentList[i].totalChecked;
            }

            if (newCurrentList[i].rowState) {
                newCurrentList[i].setRowState = newCurrentList[i].rowState;
                delete newCurrentList[i].rowState;
            }
        }

        if (sggBtn.saveBtn && typeof sggBtn.saveBtn === 'function') {
            const saveBtnCurrentList = structuredClone(newCurrentList);
            sggBtn.saveBtn(saveBtnCurrentList);
        }

        for (let i = 0; i < newCurrentList.length; i++) {
            if (newCurrentList[i].setRowState) {
                if (newCurrentList[i].setRowState === 'DELETE') {
                    newCurrentList.splice(i, 1);
                    i--;
                }
            }
        }

        setSelectedRow(null);
        if (sggData?.setGridData) {
            sggData.setGridData(newCurrentList);
        } else {
            setCurrentList(newCurrentList);
        }
        toastRef.current.showToast('적용되었습니다.');

        setTotalCheck(false);
    }

    // 그리드 창 크기
    const handleResize = () => {
        if (gridRef.current) {
            const gridWidth = gridRef.current.offsetWidth;
            return gridWidth;
        }
    }

    // 열의 width가 지정되지 않았다면 균등하게 분할
    const getColLength = (totalWidth, widthCnt) => {
        // 그리드 총 width
        const size = handleResize();
        const totalCols = sggColumns.length || 0;
        // sggBtn이 있어야 상태 컬럼 생김
        let usableSize = sggBtn ? size - stateTd : size; // 여유 공간 반영
        // 선택 체크박스 여부
        usableSize = sggGridChecked ? usableSize - 25 : usableSize;
        // 지정된 width가 있는 경우 그 총 지정 width값 빼기
        if (totalWidth) {
            usableSize = usableSize - totalWidth;
        }
        // 지정된 애들 제외한 나머지 균등 분할
        const colLengthRatio = (usableSize / size) * 100 / (totalCols - widthCnt);

        return Math.floor(colLengthRatio); // 퍼센트 비율 반환
    };

    const setColumn = () => {
        // 지정된 width 총 길이, 수 찾기
        let totalWidth = 0;
        let widthCnt = 0;
        for (const item of sggColumns) {
            if (item.width) {
                let width = item.width;
                if (width.toString().includes('%')) {
                    width = Number(width.replace('%', ''));
                }
                totalWidth += width;
                widthCnt++;
            }
        }

        setComputedColumns(
            sggColumns.length > 0
                ? sggColumns.map(col => ({
                        ...col,
                        width: col.width ? col.width.toString().includes('%') ? col.width
                                                                            : `${col.width}%`
                                        : `${getColLength(totalWidth, widthCnt)}%`
                    }))
                : []
        );
    }

    // 드래그 시작 시 노드 ID 저장
    const handleDragStart = (e) => {
        let key = e.target.dataset.key;
        e.dataTransfer.setData("application/th-key", key);
    };
    
    // 드래그 오버 시 기본 동작 막기 (drop 허용)
    const handleDragOver = (e) => {
        e.preventDefault();
    };
    
    // 노드 위에 드롭했을 때 처리
    const handleDrop = (e) => {
        e.preventDefault();
        let key = e.target.dataset.key;
        const draggedThKey = e.dataTransfer.getData("application/th-key");
        if (draggedThKey && draggedThKey !== key) {
            let from = -1;
            let to = -1;
            for (let i = 0; i < computedColumns.length; i++) {
                computedColumns[i].key === draggedThKey ? from = i : null;
                computedColumns[i].key === key ? to = i : null;
            }

            if (from !== -1 && to !== -1) {
                handleSwap(from, to);
            }
        }
    };

    // th 재정렬
    const handleSwap = (from, to) => {
        let newComputedColumns = [...computedColumns];
        // 뽑아내기
        let [fromObj] = newComputedColumns.splice(from, 1);
        // 넣기
        newComputedColumns.splice(to, 0, fromObj);
        setComputedColumns(newComputedColumns);
    };

    // 드래그 시작 시 노드 ID 저장
    const handleDragStartRow = (e) => {
        let key = e.target.dataset.no;
        e.dataTransfer.setData("application/tr-no", key);
    };
    
    // 노드 위에 드롭했을 때 처리
    const handleDropRow = (e) => {
        e.preventDefault();
        let key = e.target.dataset.no;
        const draggedThKey = e.dataTransfer.getData("application/tr-no");
        if (draggedThKey && draggedThKey !== key && key !== '-1') {
            findRowFromTo(draggedThKey, key);
        } else {
            if (key === '-1') {
                findRowFromTo(draggedThKey, key, (currentList.length - 1))
            }
        }
    };

    const findRowFromTo = (draggedThKey, key, toIdx) => {
        let from = -1;
        let to = toIdx || -1;
        for (let i = 0; i < currentList.length; i++) {
            let no = currentList[i].no.toString();
            no === draggedThKey ? from = i : null;
            if (!toIdx) {
                no === key ? to = i : null;
            }
        }

        if (from !== -1 && to !== -1) {
            handleSwapRow(from, to);
        }
    }

    // tr 재정렬
    const handleSwapRow = (from, to) => {
        let newCurrentList = structuredClone(currentList);
        // 뽑아내기
        let [fromObj] = newCurrentList.splice(from, 1);
        // 넣기
        newCurrentList.splice(to, 0, fromObj);

        setCurrentList(newCurrentList);
    };

    // 컬럼 너비 변경 핸들러
    const handleMouseDown = (e, idx) => {
        e.preventDefault();
        const startX = e.clientX;
        let nextIdx = idx + 1;
        const startWidth = computedColumns[idx].width;
        const totalWidth = handleResize();

        let nextWidth = 0;
        if (nextIdx !== computedColumns.length) {
            nextWidth = computedColumns[idx + 1].width;
        }

        const handleMouseMove = (moveEvent) => {
            if (idx === computedColumns.length - 1) {
                return
            }
            const moveWidth = moveEvent.clientX - startX;
            const newWidthPer = Math.floor((moveWidth / totalWidth) * 100);
            const newWidth = (Number(startWidth.replace('%', '')) + newWidthPer);

            const nextNewWidth = (Number(nextWidth.replace('%', '')) - newWidthPer);

            if (newWidth < 5 || nextNewWidth < 5) {
                return
            }

            setComputedColumns((prev) => {
                const newComputedColumns = [...prev];
                newComputedColumns[idx].width = newWidth + '%';
                newComputedColumns[idx + 1].width = nextNewWidth + '%';
                return newComputedColumns
            })
        };

        const handleMouseUp = () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
    };

    const drawGrid = (deleteCol) => {
        if (sggData?.gridData) {
            let chkNo = 0;
            let gridData = structuredClone(sggData.gridData);
            if (gridData.length > 0) {
                for (const item of gridData) {
                    item.no ? chkNo++ : chkNo--;
                }

                // 데이터가 보여줄 수 보다 많은지 체크
                const pageLength = sggPaging !== false ? perPage < gridData.length ? perPage
                                                                                : gridData.length 
                                                    : gridData.length;

                if (sggData.totalCount) {
                    const dataList = [];
                    for (let i = 0; i < pageLength; i++) {
                        gridData[i].no ? null : gridData[i].no = (gridData.length - i) + (currentPage - 1) * perPage;
                        sggGridChecked ? gridData[i].totalChecked ? null 
                                                                    : gridData[i].totalChecked = false 
                                        : null;
                        if (gridData[i].setRowState !== 'DELETE') {
                            delete gridData[i].setRowState;
                            dataList.push(gridData[i]);
                        }
                    }
                    if (deleteCol) {
                        for (let i = 0; i < pageLength; i++) {
                            for (const item of deleteCol) {
                                delete dataList[i][item];
                            }
                        }
                    }
                    sggData.gridData = dataList;
                    setCurrentList(dataList);
                } else {
                    const dataList = [];
                    for (let i = 0; i < gridData.length; i++) {
                        gridData[i].no ? null : gridData[i].no = gridData.length - i;
                        sggGridChecked ? gridData[i].totalChecked ? null 
                                                                : gridData[i].totalChecked = false 
                                        : null;
                        if (gridData[i].setRowState) {
                            if (gridData[i].setRowState !== 'DELETE') {
                                delete gridData[i].setRowState;
                                dataList.push(gridData[i]);
                            }
                        }
                    }

                    if (deleteCol) {
                        for (let i = 0; i < gridData.length; i++) {
                            for (const item of deleteCol) {
                                delete gridData[i][item];
                            }
                        }
                    }
                    
                    if (sggPaging !== false) {
                        sggData.gridData = gridData;
                        const startIdx = (currentPage - 1) * perPage;
                        const endIdx = startIdx + perPage;
                        const reversed = [...sggData.gridData];
                        setCurrentList(reversed.slice(startIdx, endIdx));
                    } else {
                        sggData.gridData = gridData;
                        const reversed = [...sggData.gridData];
                        setCurrentList(reversed)
                    }
                }
            } else {
                setCurrentList([]);
            }
        }
    }

    useEffect(() => {
        drawGrid();
    }, [sggData]);

    // 페이징 처리
    useEffect(() => {
        if (sggSearchParam && sggSearchParam.setSearchParam) {
            sggSearchParam.setSearchParam((prev) => ({
                ...prev,
                page: currentPage,
                row: perPage,
            }));
        } else {
            drawGrid();
        }
    }, [currentPage, perPage]);

    const totalPage = Math.ceil((sggData?.totalCount || sggData?.gridData?.length || 0) / perPage);

    const clickPagingBtn = (num) => {
        setCurrentPage(num);
        setSelectedRow();
    };

    const renderPagination = () => {
        if (!totalPage) return null;

        let pagination = [];
        const startBtn = Math.floor((currentPage - 1) / pageBtnCount) * pageBtnCount + 1;
        const lastBtn = Math.min(startBtn + pageBtnCount - 1, totalPage);

        if (startBtn > 1) {
            pagination.push(<a className={styles.a} key="first" onClick={() => clickPagingBtn(1)}>{'<<'}</a>);
            pagination.push(<a className={styles.a} key="prev" onClick={() => clickPagingBtn(startBtn - 1)}>{'<'}</a>);
        }

        for (let i = startBtn; i <= lastBtn; i++) {
            pagination.push(
                <a className={styles.a}
                    key={i}
                    onClick={() => clickPagingBtn(i)}
                    style={{ color: i === currentPage ? 'lightgray' : 'inherit' }}
                >
                    {i}
                </a>
            );
        }

        if (lastBtn < totalPage) {
            pagination.push(<a className={styles.a} key="next" onClick={() => clickPagingBtn(lastBtn + 1)}>{'>'}</a>);
            pagination.push(<a className={styles.a} key="last" onClick={() => clickPagingBtn(totalPage)}>{'>>'}</a>);
        }

        return <div className={styles.pagination}>{pagination}</div>;
    };

    useEffect(() => {
        if (currentList.length > 0) {
            // 컬럼별 체크박스 헤드
            if (allCheck.length > 0) {
                setAllCheck(allCheck?.map(col => {
                    let chkCount = 0;
                    for (const item of currentList) {
                        col.trueValue === item[col.key] ? chkCount++ : chkCount--;
                    }
                    if (chkCount === currentList.length) {
                        col.checked = true;
                        return col;
                    } else {
                        col.checked = false;
                        return col;
                    }
                }));
            }

            // 선택용 체크박스 헤드
            setTotalCheck(
                currentList.every(item => item.totalChecked) ? true : false
            );

            // 선택용 체크박스 선택된 행들
            setCheckedRows(
                currentList.filter(item => item.totalChecked)
            );
        }
    }, [currentList]);

    useEffect(() => {
        if (sggData && sggData.gridData && sggGridChecked) {
            let chkArr = [];
            for (const item of sggData.gridData) {
                if (item.totalChecked) {
                    chkArr.push(item);
                }
            }
        }
    }, [sggData]);

    useEffect(() => {
        setColumn();
    }, [sggColumns]);

    return (
        <>
            <ToastAlert ref={toastRef} />
            <div className={styles.tableContainer} ref={gridRef}>
                {sggSearchParam && sggSearchParam.searchForm && sggSearchParam.setSearchParam && sggSearchParam.doSearch && (
                    <div className={styles.searchForm}>
                        {/* 왼쪽: 입력 필드들 */}
                        <div className={styles.searchFormInput} ref={searchFormInputRef}>
                            {sggSearchParam.searchForm.map((item) => {
                                const { key, option, ...rest } = item;

                                if (rest.type !== 'select') {
                                    const commonProps = {
                                        name: item.key,
                                        onChange: searchInputChange,
                                        onKeyDown: searchInputKeyDown,
                                        ...rest,
                                    };
                                    
                                    return <input key={item.key} className={styles.searchInput} {...commonProps}/>;
                                } else {
                                    const commonProps = {
                                        name: item.key,
                                        onChange: searchInputChange,
                                        ...rest,
                                    };
                                    
                                    return (
                                        <select key={item.key} className={styles.searchInput + ' ' + styles.select} {...commonProps}>
                                            {option?.map((opt) => (
                                                <option key={item.key + '-' + opt.value} value={opt.value}>
                                                    {opt.label}
                                                </option>
                                            ))}
                                        </select>
                                    );
                                }
                            })}
                        </div>
                    
                        {/* 오른쪽: 검색 버튼 */}
                        <button type='button' className={`${styles.button} ${styles.searchFormSearchBtn}`} onClick={onBtnSearchClick}>
                            검색
                        </button>
                        <button type='button' className={`${styles.button} ${styles.secondary} ${styles.searchFormSearchBtn}`} onClick={onBtnSearchReset}>
                            초기화
                        </button>
                    </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <p style={{ margin: 0 }}>
                        총 {sggData?.totalCount || sggData?.gridData?.length}건
                    </p>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ display: 'flex' }}>
                            {sggBtn?.c && <button type="button" 
                                                className={`${styles.button} ${styles.accept}`} 
                                                onClick={() => {addRow()}} 
                                                disabled={sggBtn?.disabled?.c} 
                                            >
                                                    행 추가
                                            </button>}
                            {sggBtn?.u && <button type="button" 
                                                className={`${styles.button} ${styles.primary}`} 
                                                onClick={() => {updateRow()}} 
                                                disabled={sggBtn?.disabled?.u} 
                                            >
                                                    {checkedRows.length > 0 ? '체크 ' : selectedRow ? '선택 ' : ''}행 수정
                                            </button>}
                            {sggBtn?.d && <button type="button" 
                                                className={`${styles.button} ${styles.danger}`} 
                                                onClick={() => {deleteRow()}} 
                                                disabled={sggBtn?.disabled?.d} 
                                            >
                                                    {checkedRows.length > 0 ? '체크 ' : selectedRow ? '선택 ' : ''}행 삭제
                                            </button>}
                            {sggBtn?.r && <button type="button" 
                                                className={`${styles.button} ${styles.secondary}`} 
                                                onClick={() => {resetRow()}} 
                                                disabled={sggBtn?.disabled?.r} 
                                            >
                                                    {checkedRows.length > 0 ? '체크 행 ' : selectedRow ? '선택 행 ' : '전체 '}초기화
                                            </button>}
                            {(sggBtn?.c || sggBtn?.u || sggBtn?.d || sggBtn?.saveBtn) && <button type="button" 
                                                                                                className={`${styles.button} ${styles.etc}`} 
                                                                                                onClick={() => {setRow()}} 
                                                                                                disabled={sggBtn?.disabled?.saveBtn} 
                                                                                            >
                                                                                                    {'전체 ' + (sggBtn.saveBtn ? '저장' : '적용')}
                                                                                            </button>}
                        </div>
                        {sggPaging !== false &&
                            <select value={perPage}
                                className={styles.select}
                                onChange={(e) => {
                                    setPerPage(Number(e.target.value));
                                    setCurrentPage(1);
                                }}
                                >
                                <option value="10">10개씩</option>
                                <option value="5">5개씩</option>
                            </select>
                        }
                    </div>
                </div>

                <table className={styles.table} id="noticeGrid" ref={sggRef}>
                    <thead className={styles.thead}>
                        <tr>
                            {sggGridChecked &&
                                <th className={styles.th} style={{ width: '25px'}}>
                                    <input type="checkbox" name={'totalChecked'} style={{width: '15px', height: '15px'}} checked={totalCheck} onChange={allCheckBoxFirst} />
                                </th>
                            }
                            {(sggBtn?.c || sggBtn?.u || sggBtn?.d) && 
                                <th className={styles.th} style={{  width: stateTd + 'px' }}>
                                    상태
                                </th>
                            }
                            {computedColumns && computedColumns.map((col, idx) => (
                                <th
                                    key={col.key}
                                    data-key={col.key}
                                    className={styles.th}
                                    style={{ width: col.width, position: 'relative', overflow: 'visible' }}  
                                    draggable={sggGridFormChange.headerMove}
                                    onDragStart={handleDragStart}
                                    onDragOver={handleDragOver}
                                    onDrop={handleDrop}
                                >
                                    {col.type === 'checkbox' &&
                                        <input type="checkbox" name={col.key} style={{width: '15px', height: '15px'}} checked={checkChecked(col.key)} onChange={allCheckBox}/>
                                    }
                                    {col.name}
                                    {sggGridFormChange.resize && idx !== computedColumns.length - 1 && 
                                        <span
                                            onMouseDown={(e) => handleMouseDown(e, idx)}
                                            className={styles.resize}
                                        >
                                            <div className={styles.resize}/>
                                        </span>
                                    }
                                </th>
                            ))}
                            {(!computedColumns || computedColumns.length === 0) && (
                                <th
                                    key={'none'}
                                    className={styles.th}
                                    style={{ position: 'relative', overflow: 'visible' }}
                                    colSpan={(sggGridChecked && sggBtn) ? (sggColumns.length || 1) + 2 
                                                                        : ((sggGridChecked && !sggBtn) || !sggGridChecked && sggBtn) ? (sggColumns.length || 1) + 1
                                                                                                                : (sggColumns.length || 1) || 1}
                                >
                                    -
                                </th>
                            )}
                        </tr>
                    </thead>
                    <tbody className={styles.tbody}>
                        {currentList.length > 0 ? (
                            <>
                            {currentList.map((item) => (
                                <tr
                                    key={item.no}
                                    className={styles.tbodyRow}
                                    onClick={(e) => trClick(e, item)}
                                    onDoubleClick={(e) => trDoubleClick(e, item)}
                                    style={{
                                        backgroundColor: selectedRow?.no === item.no ? 'lightblue' : '',
                                        cursor: 'pointer'
                                    }}
                                    data-no={item.no}
                                    draggable={sggGridFormChange.rowMove}
                                    onDragStart={handleDragStartRow}
                                    onDragOver={handleDragOver}
                                    onDrop={handleDropRow}
                                >   
                                    {sggGridChecked && 
                                        <td className={styles.td} data-no={item.no}>
                                            <input type="checkbox" name={'totalChecked'} data-checkbox={item.no} style={{width: '15px', height: '15px'}} checked={setCheckValueFirst(item.no, item['totalChecked'])} onChange={setFirstCheck} />
                                        </td>
                                    }
                                    {(sggBtn?.c || sggBtn?.u || sggBtn?.d) &&
                                        <td className={styles.td} data-no={item.no}>
                                            {item.rowState === 'INSERT' ? <span className={`${styles.state} ${styles.accept}`}>등록</span> : null}
                                            {item.rowState === 'UPDATE' ? <span className={`${styles.state} ${styles.primary}`}>수정</span> : null}
                                            {item.rowState === 'DELETE' ? <span className={`${styles.state} ${styles.danger}`}>삭제</span> : null}
                                        </td>
                                    }
                                    {computedColumns && computedColumns.map(col => (
                                        <td key={col.key} className={styles.td} data-no={item.no}>
                                            {getType(item, col)}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                            {sggPaging !== false && (
                                Array.from({ length: perPage - currentList.length }).map((_, i) =>
                                    <tr key={'emptyTr' + i} draggable={sggGridFormChange.rowMove} onDragStart={handleDragStartRow} onDragOver={handleDragOver} onDrop={handleDropRow}>
                                        <td colSpan={(sggGridChecked && sggBtn) ? (sggColumns.length || 1) + 2 
                                                                                : ((sggGridChecked && !sggBtn) || !sggGridChecked && sggBtn) ? (sggColumns.length || 1) + 1 
                                                                                                                                            : (sggColumns.length || 1) || 1} className={styles.td} key={'emptyTd' + i} data-no={-1}>&nbsp;</td>
                                    </tr>
                                )
                            )}
                        </>
                        ) : (
                            <>
                                <tr>
                                    <td colSpan={(sggGridChecked && sggBtn) ? (sggColumns.length || 1) + 2 
                                                                            : ((sggGridChecked && !sggBtn) || !sggGridChecked && sggBtn) ? (sggColumns.length || 1) + 1
                                                                                                                                        : (sggColumns.length || 1) || 1} className={styles.td}>데이터가 없습니다.</td>
                                </tr>
                                {sggPaging !== false && 
                                    Array.from({ length: perPage - 1}).map((_, i) => 
                                        <tr key={'emptyTr' + i}>
                                            <td colSpan={(sggGridChecked && sggBtn) ? (sggColumns.length || 1) + 2 
                                                                                    : ((sggGridChecked && !sggBtn) || !sggGridChecked && sggBtn) ? (sggColumns.length || 1) + 1 
                                                                                                                                                : (sggColumns.length || 1) || 1} className={styles.td} key={'emptyTd' + i}>&nbsp;</td>
                                        </tr>
                                    )
                                }
                            </>
                        )}
                    </tbody>
                </table>
                {sggPaging !== false && renderPagination()}
            </div>
        </>
    );
}

const ToastAlert = forwardRef((props, ref) => {
    const [toasts, setToasts] = useState([]);

    // 부모 컴포넌트에서 showToast 호출 가능하도록 설정
    useImperativeHandle(ref, () => ({
        showToast(message, consoleMessage) {
            setToasts(prev => [...prev, { id: Date.now(), message }]);

            if (consoleMessage) {
                console.log(consoleMessage); // 콘솔에 메시지 출력
            }
        }
    }));

    useEffect(() => {
        if (toasts.length === 0) return; // 토스트가 없으면 실행 X

        const timers = toasts.map(toast =>
            setTimeout(() => {
                setToasts(prev => prev.filter(t => t.id !== toast.id)); // 개별적으로 제거
            }, 1000) // 1초 후 제거
        );

        return () => timers.forEach(timer => clearTimeout(timer)); // 정리(cleanup)
    }, [toasts]); // 토스트 배열이 변경될 때마다 실행

    return (
        <div className={styles.toastContainer}>
            {toasts.map((toast) => (
                <div key={toast.id} className={`${styles.toast} show`}>
                    {toast.message}
                </div>
            ))}
        </div>
    );
});