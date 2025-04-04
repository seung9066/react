import { useState, useEffect, useRef } from 'react';

function UrlDataTest ( param ) {
    // 테이블 style
    const [tableStyle, setTableStyle] = useState();
    // header 필수 : headerName, colName
    const [header, setHeader] = useState();
    // 그리드 data 필수 : colName과 같은 key
    const [data, setData] = useState();

    // 마우스호버 tr backgroudColor 용
    const [mouseHover, setMouseHover] = useState();
    // 행클릭 표시
    const [clickTrIdx, setClickTrIdx] = useState();
    // 선택된 값
    const [selectData, setSelectData] = useState();

    // 페이징
    const [paging, setPaging] = useState({
        // 페이징 현재 페이지
        currentPage: 1,
        // 페이지당 보여줄 게시글 수
        perPage: 1,
        // 페이징 버튼 수
        pageBtn: 10,
    });
    const [pagingBtn, setPagingBtn] = useState([]);

    useEffect(() => {
        if (param) {
            param.tableStyle ? setTableStyle(param.tableStyle) : "";
            param.header ? setHeader(param.header) : "";
            param.data ? setData(param.data) : "";
        }
    }, []);

    useEffect(() => {
        if (data) {
            const totalPage = Math.ceil(data.length / paging.perPage);
            
            let startBtn = Math.floor((paging.currentPage - 1) / paging.pageBtn) * paging.pageBtn;
            startBtn = startBtn < 1 ? 1 : startBtn + 1;
            let lastBtn = startBtn + (paging.pageBtn - 1);
            lastBtn = lastBtn < totalPage ? lastBtn : totalPage;

            let newBtn = [];
            
            for (let i = startBtn; i <= lastBtn; i++) {
                if (i != 1 && i == startBtn) {
                    newBtn.push('<a onClick="clickPaging(' + 1 + ')" style="cursor: pointer; letter-spacing: -5px"> << </a>');
                    newBtn.push('<a onClick="clickPaging(' + (i - 1) + ')" style="cursor: pointer;"> < </a>');
                }
                
                if (i == paging.currentPage) {
                    newBtn.push('<a onClick="clickPaging(' + i + ')" style="cursor: pointer; color: lightgray"> ' + i + ' </a>');
                } else {
                    newBtn.push('<a onClick="clickPaging(' + i + ')" style="cursor: pointer;"> ' + i + ' </a>');
                }
                
                if (i == lastBtn && i < totalPage) {
                    newBtn.push('<a onClick="clickPaging(' + (i + 1) + ')" style="cursor: pointer;"> > </a>');
                    newBtn.push('<a onClick="clickPaging(' + totalPage + ')" style="cursor: pointer; letter-spacing: -5px"> >> </a>');
                }
            }

            setPagingBtn(newBtn);
        }
    }, [data])

    // 행클릭
    const trClick = (idx) => {
        // 선택행 표시
        setClickTrIdx(idx);

        param.setSelectData ? param.setSelectData(data[idx]) : "";

        // 선택행 데이터
        setSelectData(data[idx]);
    };

    // 페이징 버튼 클릭
    const clickPaging = (idx) => {
        console.log(idx)
        setPaging({
            ...paging,
            currentPage: idx,
        })
    }

    return (
        <>
            <div style={{ width: "100%", overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "16px", minWidth: "600px", marginTop: "30px" }}>
                    <thead style={{ backgroundColor: "#59708a", color: "white", textAlign: "center" }}>
                        <tr>
                            {header && header.map((item) => 
                                <th style={ item.style ? { ...item.style, ...{padding: "12px", borderBottom: "1px solid #ddd" }} : {padding: "12px", borderBottom: "1px solid #ddd" } }> { item.headerName } </th>
                            )}
                        </tr>
                    </thead>
                    <tbody style={{ textAlign: "center" }}>
                        { data && data.map((item, idx) => 
                            <tr style={{ transition: "background-color 0.1s ease-in-out", backgroundColor : (clickTrIdx === idx ? "lightblue" : mouseHover === idx ? "#e0dfdf" : idx % 2 !== 0 ? "#f9f9f9" : "white") }}
                                onMouseEnter={() => setMouseHover(idx)}
                                onMouseLeave={() => setMouseHover()}
                                onClick={() => trClick(idx)}
                                >
                                {header && header.map((headerItem) =>
                                    <td style={{ padding: "12px", borderBottom: "1px solid #ddd" }} name={ headerItem.colName }> { item[headerItem.colName] } </td>
                                )}
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
            
            <div style={{ display: "flex", justifyContent: "center", gap: "10px" }} dangerouslySetInnerHTML={{ __html: pagingBtn }} >
            </div>
        </>
    )
}

export default UrlDataTest;