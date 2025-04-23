import { useState, useEffect } from 'react'
import { getAxios } from '@utils';

import SggGridReact from '@components/SggGridReact';

function Menu( props ) {
    const [userList, setUserList] = useState([]);
    const [totalCount, setTotalCount] = useState(0);
    const [gridChecked, setGridChecked] = useState([]);

    const [searchParam, setSearchParam] = useState({
        userNmSearch: '',
        page: 1,
        row: 10,
        notM: 'Y',
    });

    const showToast = (msg, consoleMsg) => {
        props.props.toastRef.current.showToast(msg, consoleMsg);
    }

    const getUserList = () => {
        getAxios('/user/userList', searchParam).then((res) => {
            if (res.msg === 'success') {
                let data = res.data;
                setUserList(data.list);
                setTotalCount(data.totalCount);
            } else {
                showToast('사용자 목록을 가져오는 중 오류가 발생했습니다.', res.error);
            }
        });
    }

    const doSave = (data) => {
        console.log(data);
    }

    useEffect(() => {
        getUserList();
    }, [searchParam.page, searchParam.row]);


    useEffect(() => {
        setGridChecked(userList.filter((item) => item.totalChecked));
    }, [userList]);

    return (
        <>
            <div>
                <SggGridReact 
                    columns={[
                        {key:'rnum', name:'번호', type:'number', width: 10},
                        {key:'userId', name:'아이디', type:'text'},
                        {key:'userNm', name:'이름', type:'text'},
                        {key:'userAuthNm', name:'권한명'},
                    ]}
                    btn={{'c': true, 'r': true, 'u': true, 'd': true}}
                    data={{gridData: userList, setGridData: setUserList, totalCount: totalCount}}
                    setParam={setSearchParam}
                    gridChecked={true}
                    saveBtn={doSave}
                    resize={true}
                    headerMove={true}
                    rowMove={true}
                    // onClick={gridTrClick}
                    // onDoubleClick={gridTrDoubleClick}
                    // resetBtn={resetBtn}
                    />
            </div>
        </>
    );
}

export default Menu;
