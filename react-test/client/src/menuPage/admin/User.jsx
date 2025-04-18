import { useState, useEffect } from 'react'
import { getAxios } from '@utils';

import SggGridReact from '@components/SggGridReact';

function Menu( props ) {
    const [userList, setUserList] = useState([]);

    const [searchParam, setSearchParam] = useState({
        userNmSearch: '최승현',
    })

    const showToast = (msg) => {
        props.props.toastRef.current.showToast(msg);
    }

    useEffect(() => {
        getAxios('/user/userList', searchParam).then((res) => {
            if (res.msg === 'success') {
                setUserList(res.data);
            } else {
                showToast('사용자 목록을 가져오는 중 오류가 발생했습니다.');
            }
        });
    }, []);

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
                    data={{gridData: userList, totalCount: userList.length}}
                    // onClick={gridTrClick}
                    // onDoubleClick={gridTrDoubleClick}
                    // resetBtn={resetBtn}
                    />
            </div>
        </>
    );
}

export default Menu;
