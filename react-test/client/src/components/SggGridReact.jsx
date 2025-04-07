import React, { useState, useEffect } from 'react';
import styles from '@css/SggGridReact.module.css';

const PER_PAGE = 10;
const PAGE_BTN_COUNT = 10;

export default function SggGridReact({ data, columns = [] }) {
    const [currentPage, setCurrentPage] = useState(1);
    const [currentList, setCurrentList] = useState([]);
    const [selectedRow, setSelectedRow] = useState(null);

    useEffect(() => {
        if (data?.gridData) {
            const startIdx = (currentPage - 1) * PER_PAGE;
            const endIdx = startIdx + PER_PAGE;
            const reversed = [...data.gridData].reverse();
            setCurrentList(reversed.slice(startIdx, endIdx));
        }
    }, [data, currentPage]);

    const totalPage = Math.ceil((data?.gridData?.length || 0) / PER_PAGE);

    const clickPagingBtn = (num) => {
        setCurrentPage(num);
        setSelectedRow();
    };

    const renderPagination = () => {
        if (!totalPage) return null;

        let pagination = [];
        const startBtn = Math.floor((currentPage - 1) / PAGE_BTN_COUNT) * PAGE_BTN_COUNT + 1;
        const lastBtn = Math.min(startBtn + PAGE_BTN_COUNT - 1, totalPage);

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

    // 열의 width가 지정되지 않았다면 균등하게 분할
    const computedColumns = columns.length
        ? columns.map(col => ({ ...col, width: col.width || `${100 / columns.length}%` }))
        : [];

    return (
        <div className={styles.tableContainer}>
            <table className={styles.table} id="noticeGrid">
                <thead className={styles.thead}>
                    <tr>
                        {computedColumns.map(col => (
                            <th
                                key={col.key}
                                className={styles.th}
                                style={{ width: col.width }}
                            >
                                {col.name}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody className={styles.tbody}>
                    {currentList.length > 0 ? (
                        currentList.map((item) => (
                            <tr
                                key={item.no}
                                className={styles.tbodyRow}
                                onClick={() => setSelectedRow(item)}
                                style={{
                                    backgroundColor: selectedRow?.no === item.no ? 'lightblue' : '',
                                    cursor: 'pointer'
                                }}
                            >
                                {computedColumns.map(col => (
                                    <td key={col.key} className={styles.td}>
                                        {item[col.key]}
                                    </td>
                                ))}
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan={columns.length || 1} className={styles.td}>데이터가 없습니다.</td>
                        </tr>
                    )}
                </tbody>
            </table>
            {renderPagination()}
        </div>
    );
}
