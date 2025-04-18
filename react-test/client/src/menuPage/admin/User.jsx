import { useState, useEffect } from 'react'
import { getAxios } from '@utils';

import SggGridReact from '@components/SggGridReact';

function Menu( props ) {
    const [userList, setUserList] = useState([]);
    const [totalCount, setTotalCount] = useState(0);

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
                setUserList(data);
            } else {
                showToast('사용자 목록을 가져오는 중 오류가 발생했습니다.', res.error);
            }
        });

        getAxios('/user/userListCount', searchParam).then((res) => {
            if (res.msg === 'success') {
                let data = res.data;
                setTotalCount(data);
            } else {
                showToast('사용자 목록을 가져오는 중 오류가 발생했습니다.', res.error);
            }
        });
    }

    useEffect(() => {
        getUserList();
    }, [searchParam.page, searchParam.row])

    return (
        <>
            <div>
                <SggGridReact 
                    columns={[
                        {key:'rnum', name:'번호'},
                        {key:'userId', name:'아이디'},
                        {key:'userNm', name:'이름'},
                        {key:'userAuthNm', name:'권한명'},
                    ]}
                    data={{gridData: userList, totalCount: totalCount}}
                    param={searchParam}
                    setParam={setSearchParam}
                    // onClick={gridTrClick}
                    // onDoubleClick={gridTrDoubleClick}
                    // resetBtn={resetBtn}
                    />
            </div>
        </>
    );
}

export default Menu;
