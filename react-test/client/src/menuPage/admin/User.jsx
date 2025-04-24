import { useState, useEffect } from 'react'
import * as utils from '@utils';

import SggGridReact from '@components/SggGridReact';

function Menu( props ) {
    const [userList, setUserList] = useState([]);
    const [totalCount, setTotalCount] = useState(0);

    // 검색조건 값
    const [searchParam, setSearchParam] = useState({
        userNmSearch: '',
        userIdSearch: '',
        page: 1,
        row: 10,
        notM: 'Y',
    });

    // 검색조건 권한 type
    const [typeOption, setTypeOption] = useState([]);

    // 그리드 컬럼
    const columns = [
        {key:'rnum', name:'번호', type:'number', width: 10},
        {key:'userId', name:'아이디', type:'text'},
        {key:'userNm', name:'이름', type:'text'},
        {key:'userAuth', name:'권한명', type:'select', option:typeOption},
    ];

    // 검색조건 폼
    const searchForm= [
        {key: 'userIdSearch', type: 'text', placeholder:'아이디',},
        {key: 'userNmSearch', type: 'text', placeholder:'사용자명',},
        {key: 'type', type: 'select', placeholder:'권한명', option: typeOption},
    ];

    // 사용자 목록
    const getUserList = async () => {
        utils.getAxios('/user/userList', searchParam).then((res) => {
            if (res.msg === 'success') {
                let data = res.data;
                setUserList(data.list);
                setTotalCount(data.totalCount);
            } else {
                utils.showToast('사용자 목록을 가져오는 중 오류가 발생했습니다.', res.error);
            }
        });
    }

    // 권한 목록
    const getAuthList = async () => {
        utils.getAxios('/sggCd/sggCdList', {cdId : 'USER_AUTH', delYn: 'N'}).then((res) => {
            if (res.msg === 'success') {
                let data = res.data;
                let newData = [{label:'전체', value:''}];
                for (const item of data) {
                    let newItem = {label: item.cdDtlName, value: item.cdDtl};
                    newData.push(newItem);
                }
                setTypeOption(newData);
            } else {
                utils.showToast('권한 목록을 가져오는 중 오류가 발생했습니다.', res.error);
            }
        });
    }

    const doSearch = async () => {
        await getUserList();
    }

    const doSave = (data) => {
        console.log(data);
    }

    useEffect(() => {
        getAuthList();
    }, [])

    useEffect(() => {
        getUserList();
    }, [searchParam.page, searchParam.row]);

    return (
        <>
            <div>
                <SggGridReact 
                    columns={columns}
                    btn={{'c': true, 'r': true, 'u': true, 'd': true}}
                    data={{gridData: userList, setGridData: setUserList, totalCount: totalCount}}
                    searchForm={searchForm}
                    setSearchParam={setSearchParam}
                    doSearch={doSearch}
                    gridChecked={true}
                    saveBtn={doSave}
                    resize={true}
                    headerMove={true}
                    rowMove={true}
                    // onClick={(e, item) => {}}
                    // onDoubleClick={(e, item) => {}}
                    />
            </div>
        </>
    );
}

export default Menu;
