import { useState, useEffect } from 'react'

import SggGridReact from '@components/SggGridReact';

function Menu( props ) {
    const [userList, setUserList] = useState([]);
    // server에서 사용자 정보 가져오기
    const getUserList = async () => {
        try {
            const res = await fetch('/api/user/userList');
            if (!res.ok) {
                throw new Error('서버 응답 오류');
            }
    
            const data = await res.json();
            setUserList(data);
        } catch (err) {
            console.log(err)
        }
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
