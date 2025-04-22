import React, { useState, useEffect, useRef } from 'react';

import styles from '@css/SggGridReact.module.css';

import ToastAlert from '@components/ToastAlert';

export default function SggGridReact({ data, columns = [], btn, setParam, resetBtn, onClick, onDoubleClick, gridChecked }) {
    // 상태컬럼
    const stateTd = '48px';
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
    const [computedColumns, setComputedColumns] = useState();
    // 선택행들
    const [checkedRows, setCheckedRows] = useState([]);

    const gridRef = useRef(null);

    const showToast = (msg, consoleMsg) => {
        toastRef.current.showToast(msg, consoleMsg);
    }

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
            if (!onClick) {
                setSelectedRow(item);
            }
            onDoubleClick(e, item);
        } else {
            if (btn && btn.u) {
                updateRow();
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
            showToast('수정할 행을 선택하세요.');
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
            showToast('신규 등록된 행은 수정할 수 없습니다.');
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
            showToast('체크된 행을 삭제합니다.');

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
            showToast('삭제할 행을 선택하세요.');
        }
    }

    // 그리드 행 초기화
    const resetRow = () => {
        if (checkedRows.length > 0) {
            showToast('체크된 행을 초기화 합니다.');
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
            showToast('행을 초기화 합니다.');

            let no = selectedRow.no;
            doReset(no);
        } else {
            showToast('전체 행을 초기화 합니다.');
            drawGrid('totalChecked');
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
            for (const item of newCurrentList) {
                item.rowState ? delete item.rowState : null;
            }
            setSelectedRow(null);
            data.setGridData(newCurrentList);
            showToast('적용되었습니다.');
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
    const getColLength = () => {
        const size = handleResize();
        const totalCols = columns.length;
        let usableSize = btn ? size - stateTd : size; // 여유 공간 반영
        usableSize = gridChecked ? usableSize - 25 : usableSize;
        const colLengthRatio = (usableSize / size) * 100 / totalCols;
    
        return colLengthRatio; // 퍼센트 비율 반환
    };

    const setColumn = () => {
        setComputedColumns(columns.length ? columns.map(col => ({ ...col, width: col.width || `${getColLength()}%` })) : []);
    }

    useEffect(() => {
        resetBtn ? null : setSelectedRow(null);
    }, [resetBtn])

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

    useEffect(() => {
        if (setParam) {
            setParam((prev) => ({
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
            pagination.push(<a key="first" onClick={() => clickPagingBtn(1)}>{'<<'}</a>);
            pagination.push(<a key="prev" onClick={() => clickPagingBtn(startBtn - 1)}>{'<'}</a>);
        }

        for (let i = startBtn; i <= lastBtn; i++) {
            pagination.push(
                <a
                    key={i}
                    onClick={() => clickPagingBtn(i)}
                    style={{ color: i === currentPage ? 'lightgray' : 'inherit' }}
                >
                    {i}
                </a>
            );
        }

        if (lastBtn < totalPage) {
            pagination.push(<a key="next" onClick={() => clickPagingBtn(lastBtn + 1)}>{'>'}</a>);
            pagination.push(<a key="last" onClick={() => clickPagingBtn(totalPage)}>{'>>'}</a>);
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
        handleResize();
    }, []);

    return (
        <>
            <ToastAlert ref={toastRef} />
            <div className={styles.tableContainer} ref={gridRef}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <p style={{ margin: 0 }}>
                        총 {data?.totalCount || data?.gridData?.length}건
                    </p>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ display: 'flex', gap: '8px' }}>
                            {btn?.c && <button type="button" className="accept" onClick={() => {addRow()}} >행 추가</button>}
                            {btn?.u && <button type="button" className="primary" onClick={() => {updateRow()}} >행 수정</button>}
                            {btn?.d && <button type="button" className="danger" onClick={() => {deleteRow()}} >행 삭제</button>}
                            {btn?.r && <button type="button" className="secondary" onClick={() => {resetRow()}} >초기화</button>}
                            {(btn?.c || btn?.r || btn?.u || btn?.d ) && <button type="button" className="etc" onClick={() => {setRow()}} >적용</button>}
                        </div>
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
                            {gridChecked && <th className={styles.th} style={{ width: '25px'}}> <input type="checkbox" name={'totalChecked'} style={{width: '20px', height: '20px'}} checked={totalCheck} onChange={allCheckBoxFirst}/> </th>}
                            {btn && 
                                <th className={styles.th} style={{  width: stateTd }}>
                                    상태
                                </th>
                            }
                            {computedColumns && computedColumns.map(col => (
                                <th
                                key={col.key}
                                className={styles.th}
                                style={{ width: col.width }}
                                >
                                    {col.type === 'checkbox' ? <input type="checkbox" name={col.key} style={{width: '20px', height: '20px'}} checked={checkChecked(col.key)} onChange={allCheckBox}/> : null}
                                    {col.name}
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
                                >   
                                    {gridChecked && <td className={styles.td}> <input type="checkbox" name={'totalChecked'} data-checkbox={item.no} style={{width: '20px', height: '20px'}} checked={setCheckValueFirst(item.no, item['totalChecked'])} onChange={setFirstCheck} /> </td>}
                                    {btn &&
                                        <td className={styles.td}>
                                            {item.rowState === 'INSERT' ? <span className={`${styles.state} ${styles.accept}`}>등록</span> : null}
                                            {item.rowState === 'UPDATE' ? <span className={`${styles.state} ${styles.primary}`}>수정</span> : null}
                                            {item.rowState === 'DELETE' ? <span className={`${styles.state} ${styles.danger}`}>삭제</span> : null}
                                        </td>
                                    }
                                    {computedColumns && computedColumns.map(col => (
                                        <td key={col.key} className={styles.td}>
                                            {getType(item, col)}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                            {(
                                Array.from({ length: perPage - currentList.length }).map((_, i) =>
                                    <tr key={'emptyTr' + i}>
                                        <td colSpan={(gridChecked && btn) ? columns.length + 2 
                                                                    : ((gridChecked && !btn) || !gridChecked && btn) ? columns.length + 1 
                                                                                                            : columns.length || 1} className={styles.td} key={'emptyTd' + i}>&nbsp;</td>
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
