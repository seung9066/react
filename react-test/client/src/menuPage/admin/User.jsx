import { useState, useEffect } from 'react'
import axios from 'axios';

import SggGridReact from '@components/SggGridReact';

function Menu( props ) {
    const [userList, setUserList] = useState([]);

    const [searchParam, setSearchParam] = useState({
        userNmSearch: '최승현',
    })
    // server에서 사용자 정보 가져오기
    const getUserList = async () => {
        axios.get('/api/user/userList', {
            params: searchParam,
        }).then((res) => {
            if (res.status === 200) {
                setUserList(res.data);
            } else {
                console.error('Error : ', res.statusText);
            }
        }).catch((err) => {
            console.error('Error : ', err);
        });
    };

    useEffect(() => {
        getUserList();
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
