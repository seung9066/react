import React, { useState, useEffect, useRef } from 'react';

import styles from '@css/SggGridReact.module.css';

import ToastAlert from '@components/ToastAlert';

import * as utils from '@utils';

/**
 * @param {columns={[{key:'', name:'', type:'', width: 10},]}}
 * Array [{*key:'데이터와 매칭할 실컬럼명', *name:'헤더명칭', type:'number/text/checkbox'(행수정시 인풋타임), width: 10}]
 * @param {data={{gridData: gridData, setGridData: setGridData, totalCount: totalCount}}}
 * useState *gridData(그리드에 담을 데이터)
 * setUseState *setGridData(그리드 데이터 set)
 * useState totalCount(데이터 총 수 - 없으면 앞단 페이징 처리)
 * @param {btn={{'c': true, 'r': true, 'u': true, 'd': true}}}
 * obj {'c': true/false(행추가버튼), 'r': true/false(초기화버튼), 'u': true/false(행수정버튼), 'd': true/false(행삭제버튼)}
 * @param {searchForm={[{key: 'userNmSearch', type: 'text', placeholder:'사용자명', ...}]}}
 * Array 검색조건 입력 폼에 들어갈 태그 (검색조건)
 * *key: 컬럼명, *type: input type, *placeholder: placeholder, ...: 기타 속성들 (readonly:true, disabled: true 등)
 * searchForm, doSearch, setSearchParam 이 3개는 세트
 * @param {doSearch={doSearch}}
 * function 검색조건 조회 함수
 * searchForm, doSearch, setSearchParam 이 3개는 세트
 * @param {setSearchParam={setSearchParam}}
 * useState searchParam={page: 1, row: 10} (검색조건)
 * searchForm, doSearch, setSearchParam 이 3개는 세트
 * @param {gridChecked={true}}
 * boolean true (그리드 첫 컬럼 체크박스)
 * @param {saveBtn={doSave}}
 * function doSave (적용 버튼 추가 로직 (setGridData 비동기 이슈로 doSave function에 매개변수 처리 doSave = (data) => {} 필수))
 * @param {resize={true}}
 * boolean 헤더 컬럼 사이즈 변경
 * @param {headerMove={true}}
 * boolean 헤더 컬럼 드래그드롭 순서 이동
 * @param {rowMove={true}}
 * boolean 행 드래그드롭 순서 이동
 * @param {onClick={(e, item) => {}}}
 * function onClick (행 클릭 추가 로직 (e, item) 매개변수 처리 필수)
 * @param {onDoubleClick={(e, item) => {}}}
 * function onDoubleClick (행 더블클릭 추가 로직 (e, item) 매개변수 처리 필수)
 * @returns 
 */
export default function SggGridReact({ data, columns = [], btn, setSearchParam, searchForm, doSearch, onClick, onDoubleClick, gridChecked, saveBtn, resize, headerMove, rowMove }) {
    // 상태컬럼
    const stateTd = '48';
    const toastRef = React.useRef(null);
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
    const [allCheck, setAllCheck] = useState(columns.filter(col => col.type === 'checkbox'));
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
        if (onClick) {
            onClick(e, item);
        }
    }

    // 행 더블 클릭 시
    const trDoubleClick = (e, item) => {
        if (onDoubleClick) {
            setSelectedRow(item);
            onDoubleClick(e, item);
        } else {
            if (btn && btn.u) {
                let state = item.rowState;
                if (state !== 'INSERT') {
                    updateRow();
                }
            }
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
        if (!btn.u && key !== 'totalChecked') {
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

        let newGridData = structuredClone(data.gridData);
        let chkDifferent = 0;
        for (const item of newGridData) {
            if (item.totalChecked !== e.target.checked) {
                chkDifferent++;
                item.totalChecked = e.target.checked;
            }
        }

        if (chkDifferent > 0) {
            data.setGridData(newGridData);
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

        setSearchParam((prev) => ({
            ...prev,
            [name]: value,
        }));
    }

    // 검색조건 엔터키
    const searchInputKeyDown = (e) => {
        if (e.key === 'Enter') {
        
        }
    }

    // 검색조건 필수값 체크
    const onBtnSearchClick = (e) => {
        if (!utils.checkRequired(searchFormInputRef)) {
            return false;
        }

        doSearch();
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
            if (!btn.u && name !== 'totalChecked') {
                return false;
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

        let newGridData = structuredClone(data.gridData);
        let chkDifferent = 0;
        for (const item of newGridData) {
            if (item.no === no) {
                if (item.totalChecked !== e.target.checked) {
                    chkDifferent++;
                }
                item.totalChecked = e.target.checked;
            }
        }

        if (chkDifferent > 0) {
            data.setGridData(newGridData);
        }
    }

    // 그리드 랜더링 시 타입에 맞는 값 리턴
    const getType = (item, col) => {
        if (col.type === 'number') {
            return selectedRow && selectedRow.no === item.no && item.rowState ? <input type="number" name={col.key} value={item[col.key]} style={{ width: '99%', border: 'none', backgroundColor: 'transparent' }} onChange={inputChange} /> : item[col.key];
        }
        if (col.type === 'text') {
            return selectedRow && selectedRow.no === item.no && item.rowState ? <input type="text" name={col.key} value={item[col.key]} style={{ width: '99%', border: 'none', backgroundColor: 'transparent' }} onChange={inputChange} /> : item[col.key];
        }
        if (col.type === 'checkbox') {
            let value = setCheckValue(col.key, item[col.key]);
            return <input type="checkbox" name={col.key} data-checkbox={item.no} checked={value} style={{ width: '20px', height: '20px', border: 'none', backgroundColor: 'transparent' }} onChange={inputChange} />;
        }
        if (!col.type) {
            return item[col.key];
        }
    }

    // 그리드 행추가
    const addRow = () => {
        const newRow = {
            no: currentList.length + 1,
            rowState: 'INSERT',
        };
        let newCurrentList = structuredClone(currentList);
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
        setCurrentList(newCurrentList);
        setSelectedRow(newRow);
    }

    // 그리드 행수정
    const updateRow = () => {
        if (checkedRows.length > 0) {
            let newCurrentList = structuredClone(currentList);
            for (const item of newCurrentList) {
                let state = item.rowState;
                if (item.totalChecked) {
                    if (state !== 'INSERT') {
                        item.rowState = 'UPDATE';
                    }
                }
            }

            setCurrentList(newCurrentList);
        } else if (selectedRow) {
            let no = selectedRow.no;
            doUpdate(no);
        } else {
            utils.showToast();
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
            utils.showToast('신규 등록된 행은 수정할 수 없습니다.');
        } else {
            setCurrentList((prevList) =>
                prevList.map((item) =>
                    item.no === selectedRow.no ? { ...item, rowState: 'UPDATE' } : item
                )
            );
        }
    }

    // 그리드 행삭제
    const deleteRow = () => {
        if (checkedRows.length > 0) {
            utils.showToast('체크된 행을 삭제합니다.');

            let newCurrentList = structuredClone(currentList);
            for (const item of newCurrentList) {
                let state = item.rowState;
                if (item.totalChecked) {
                    if (state !== 'INSERT') {
                        item.rowState = 'DELETE';
                    } else {
                        item.rowState = 'INSERTDELETE';
                    }
                }
            }

            setCurrentList(newCurrentList.filter((item) => item.rowState !== 'INSERTDELETE'));
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
                setCurrentList((prevList) => prevList.filter((item) => item.no !== no));
            } else {
                setCurrentList((prevList) =>
                    prevList.map((item) =>
                        item.no === selectedRow.no ? { ...item, rowState: 'DELETE' } : item
                    )
                );
            }
            setSelectedRow(null);
        } else {
            utils.showToast('삭제할 행을 선택하세요.');
        }
    }

    // 그리드 행 초기화
    const resetRow = () => {
        if (checkedRows.length > 0) {
            utils.showToast('체크된 행을 초기화 합니다.');
            let resetRowData = [];
            let newCurrentList = structuredClone(currentList);
            let newGridData = structuredClone(data.gridData);
            for (const item of newCurrentList) {
                for (const item2 of newGridData) {
                    if (item.no === item2.no) {
                        let state = item.rowState;
                        if (item.totalChecked) {
                            if (state !== 'INSERT') {
                                delete item2.totalChecked;
                                resetRowData.push(item2);
                            }
                        } else {
                            delete item2.totalChecked;
                            resetRowData.push(item2);
                        }
                    }
                }
            }

            setCurrentList(resetRowData);
        } else if (selectedRow) {
            utils.showToast('행을 초기화 합니다.');

            let no = selectedRow.no;
            doReset(no);
        } else {
            utils.showToast('전체 행을 초기화 합니다.');
            drawGrid('totalChecked');
            setColumn();
        }

        setSelectedRow(null);
    }

    const doReset = (no) => {
        let resetRowData = {};
        for (const item of data.gridData) {
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
            setCurrentList((prevList) => prevList.filter((item) => item.no !== no));
        } else {
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
        if (data?.setGridData) {
            let newCurrentList = structuredClone(currentList);

            for (let i = 0; i < newCurrentList.length; i++) {
                if (newCurrentList[i].totalChecked) {
                    delete newCurrentList[i].totalChecked;
                }

                if (newCurrentList[i].rowState) {
                    if (newCurrentList[i].rowState === 'DELETE') {
                        newCurrentList.splice(i, 1);
                        i--;
                    } else {
                        delete newCurrentList[i].rowState;
                    }
                }
            }

            setSelectedRow(null);
            data.setGridData(newCurrentList);
            if (saveBtn) {
                saveBtn(newCurrentList);
            } else {
                utils.showToast('적용되었습니다.');
            }
        }
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
        const totalCols = columns.length;
        // btn이 있어야 상태 컬럼 생김
        let usableSize = btn ? size - stateTd : size; // 여유 공간 반영
        // 선택 체크박스 여부
        usableSize = gridChecked ? usableSize - 25 : usableSize;
        // 지정된 width가 있는 경우 그 총 지정 width값 빼기
        if (totalWidth) {
            usableSize = usableSize - totalWidth;
        }
        // 지정된 애들 제외한 나머지 균등 분할
        const colLengthRatio = (usableSize / size) * 100 / (totalCols - widthCnt);

        return Math.floor(colLengthRatio); // 퍼센트 비율 반환
    };

    const setColumn = () => {
        const newColumns = structuredClone(columns);
        // 지정된 width 총 길이, 수 찾기
        let totalWidth = 0;
        let widthCnt = 0;
        for (const item of newColumns) {
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
            columns.length
                ? columns.map(col => ({
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
        let newComputedColumns = structuredClone(computedColumns);
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
        if (data?.gridData) {
            let chkNo = 0;
            let gridData = structuredClone(data.gridData);
            if (gridData.length > 0) {
                for (const item of gridData) {
                    item.no ? chkNo++ : chkNo--;
                }
                if (data.totalCount) {
                    if (chkNo !== data.totalCount) {
                        for (let i = 0; i < gridData.length; i++) {
                            gridData[i].no ? null : gridData[i].no = (gridData.length - i) + (currentPage - 1) * perPage;
                            gridChecked ? gridData[i].totalChecked ? null 
                                                                    : gridData[i].totalChecked = false 
                                            : null;
                        }
                    }
                    if (deleteCol) {
                        for (let i = 0; i < gridData.length; i++) {
                            delete gridData[i][deleteCol]
                        }
                    }
                    data.gridData = gridData;
                    setCurrentList([...data.gridData]);
                } else {
                    if (chkNo !== gridData.length) {
                        for (let i = 0; i < gridData.length; i++) {
                            gridData[i].no ? null : gridData[i].no = i + 1;
                            gridChecked ? gridData[i].totalChecked ? null 
                                                                    : gridData[i].totalChecked = false 
                                            : null;
                        }
                    }
                    if (deleteCol) {
                        for (let i = 0; i < gridData.length; i++) {
                            delete gridData[i][deleteCol]
                        }
                    }
                    data.gridData = gridData;
                    const startIdx = (currentPage - 1) * perPage;
                    const endIdx = startIdx + perPage;
                    const reversed = [...data.gridData].reverse();
                    setCurrentList(reversed.slice(startIdx, endIdx));
                }
            } else {
                setCurrentList([]);
            }
        }
    }

    useEffect(() => {
        drawGrid();
    }, [data]);

    // 페이징 처리
    useEffect(() => {
        if (setSearchParam) {
            setSearchParam((prev) => ({
                ...prev,
                page: currentPage,
                row: perPage,
            }));
        } else {
            drawGrid();
        }
    }, [currentPage, perPage]);

    const totalPage = Math.ceil((data?.totalCount || data?.gridData?.length || 0) / perPage);

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
            setAllCheck(allCheck.map(col => {
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
        if (data.gridData && gridChecked) {
            let chkArr = [];
            for (const item of data.gridData) {
                if (item.totalChecked) {
                    chkArr.push(item);
                }
            }
        }
    }, [data]);

    useEffect(() => {
        setColumn();
    }, []);

    return (
        <>
            <ToastAlert ref={toastRef} />
            <div className={styles.tableContainer} ref={gridRef}>
                {searchForm && setSearchParam && doSearch && (
                    <div className={styles.searchForm}>
                        {/* 왼쪽: 입력 필드들 */}
                        <div className={styles.searchFormInput} ref={searchFormInputRef}>
                            {searchForm.map((item) => {
                                const { key, ...rest } = item;
                    
                                const commonProps = {
                                    name: item.key,
                                    onChange: searchInputChange,
                                    onKeyDown: searchInputKeyDown,
                                    ...rest,
                                };
                    
                                return <input key={item.key} className={styles.searchInput} {...commonProps} />;
                            })}
                        </div>
                    
                        {/* 오른쪽: 검색 버튼 */}
                        <button type='button' className={`button ${styles.searchFormSearchBtn}`} onClick={onBtnSearchClick}>
                            검색
                        </button>
                    </div>
                )}

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <p style={{ margin: 0 }}>
                        총 {data?.totalCount || data?.gridData?.length}건
                    </p>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {data.setGridData && 
                            <div style={{ display: 'flex' }}>
                                {btn?.c && <button type="button" className="button accept" onClick={() => {addRow()}} >행 추가</button>}
                                {btn?.u && <button type="button" className="button primary" onClick={() => {updateRow()}} >{checkedRows.length > 0 ? '체크 ' : selectedRow ? '선택 ' : ''}행 수정</button>}
                                {btn?.d && <button type="button" className="button danger" onClick={() => {deleteRow()}} >{checkedRows.length > 0 ? '체크 ' : selectedRow ? '선택 ' : ''}행 삭제</button>}
                                {btn?.r && <button type="button" className="button secondary" onClick={() => {resetRow()}} >{checkedRows.length > 0 ? '체크 행 ' : selectedRow ? '선택 행 ' : '전체 '}초기화</button>}
                                {(btn?.c || btn?.r || btn?.u || btn?.d) && <button type="button" className="button etc" onClick={() => {setRow()}} >{'전체 ' + (saveBtn ? '저장' : '적용')}</button>}
                            </div>
                        }
                        <select value={perPage}
                            onChange={(e) => {
                                setPerPage(Number(e.target.value));
                                setCurrentPage(1);
                            }}
                            >
                            <option value="10">10개씩</option>
                            <option value="5">5개씩</option>
                        </select>
                    </div>
                </div>

                <table className={styles.table} id="noticeGrid">
                    <thead className={styles.thead}>
                        <tr>
                            {gridChecked && 
                                <th className={styles.th} style={{ width: '25px'}}>
                                    <input type="checkbox" name={'totalChecked'} style={{width: '20px', height: '20px'}} checked={totalCheck} onChange={allCheckBoxFirst} />
                                </th>
                            }
                            {btn && 
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
                                    draggable={headerMove}
                                    onDragStart={handleDragStart}
                                    onDragOver={handleDragOver}
                                    onDrop={handleDrop}
                                >
                                    {col.type === 'checkbox' &&
                                        <input type="checkbox" name={col.key} style={{width: '20px', height: '20px'}} checked={checkChecked(col.key)} onChange={allCheckBox}/>
                                    }
                                    {col.name}
                                    {resize && idx !== computedColumns.length - 1 && 
                                        <span
                                            onMouseDown={(e) => handleMouseDown(e, idx)}
                                            style={{
                                                position: 'absolute',
                                                right: 0,
                                                top: 0,
                                                bottom: 0,
                                                width: '10px',               // 넓이 증가
                                                cursor: 'col-resize',        // 드래그 커서
                                                backgroundColor: 'transparent',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                zIndex: 1,
                                            }}
                                        >
                                            <div
                                                style={{
                                                    width: '2.2px',
                                                    height: '70%',           // 세로 길이 강조
                                                    backgroundColor: 'white', // 눈에 띄는 색상
                                                    opacity: 0.8,
                                                }}
                                            />
                                        </span>
                                    }
                                </th>
                            ))}
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
                                    draggable={rowMove}
                                    onDragStart={handleDragStartRow}
                                    onDragOver={handleDragOver}
                                    onDrop={handleDropRow}
                                >   
                                    {gridChecked && <td className={styles.td} data-no={item.no}> <input type="checkbox" name={'totalChecked'} data-checkbox={item.no} style={{width: '20px', height: '20px'}} checked={setCheckValueFirst(item.no, item['totalChecked'])} onChange={setFirstCheck} /> </td>}
                                    {btn &&
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
                            {(
                                Array.from({ length: perPage - currentList.length }).map((_, i) =>
                                    <tr key={'emptyTr' + i} draggable={rowMove} onDragStart={handleDragStartRow} onDragOver={handleDragOver} onDrop={handleDropRow}>
                                        <td colSpan={(gridChecked && btn) ? columns.length + 2 
                                                                    : ((gridChecked && !btn) || !gridChecked && btn) ? columns.length + 1 
                                                                                                            : columns.length || 1} className={styles.td} key={'emptyTd' + i} data-no={-1}>&nbsp;</td>
                                    </tr>
                                ) 
                            )}
                        </>
                        ) : (
                            <>
                            <tr>
                                <td colSpan={(gridChecked && btn) ? columns.length + 2 
                                                            : ((gridChecked && !btn) || !gridChecked && btn) ? columns.length + 1 
                                                                                                    : columns.length || 1} className={styles.td}>데이터가 없습니다.</td>
                            </tr>
                            {Array.from({ length: perPage - 1}).map((_, i) => 
                                <tr key={'emptyTr' + i}>
                                    <td colSpan={(gridChecked && btn) ? columns.length + 2 
                                                                : ((gridChecked && !btn) || !gridChecked && btn) ? columns.length + 1 
                                                                                                        : columns.length || 1} className={styles.td} key={'emptyTd' + i}>&nbsp;</td>
                                </tr>
                            )}
                            </>
                        )}
                    </tbody>
                </table>
                {renderPagination()}
            </div>
        </>
    );
}
