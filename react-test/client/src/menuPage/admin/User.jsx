import { useState, useEffect } from 'react'
import * as utils from '@utils';

import SggGridReact from '@components/SggGridReact';
import AdminPage from '@components/AdminPage';

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
        {key:'rnum', name:'번호', width: 10},
        {key:'userId', name:'아이디', type:'text'},
        {key:'userNm', name:'이름', type:'text'},
        {key:'userPw', name:'비밀번호', type:'password'},
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

    const doSave = async (data) => {
        const newData = [];
        for (const item of data) {
            if (item.userAuth === '') {
                item.userAuth = '001';
            }
            if (item.setRowState) {
                if (item.setRowState === 'DELETE') {
                    item.userAuth = '000';
                }
                newData.push(item);
            }
        }

        if (newData.length > 0) {
            await utils.postAxios('/user/updateUser', newData).then((res) => {
                if (res.msg === 'success') {
                    let data = res.data;

                    if (data.cnt === newData.length) {
                        utils.showToast('사용자 정보 저장 성공');
                        getUserList();
                    } else {
                        utils.showToast('사용자 정보 저장 성공 오류');
                    }
                } else {
                    utils.showToast('사용자 정보 저장 중 오류가 발생했습니다.', res.error);
                }
            });
        }
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
                    sggColumns={columns} // 그리드 컬럼 Array
                    sggBtn={{'c': true, 'r': true, 'u': true, 'd': true, saveBtn : doSave}} // 그리드 위 행 CRUD 버튼, c/r/u/d boolean, saveBtn fnc
                    sggData={{gridData: userList, setGridData: setUserList, totalCount: totalCount}} // 데이터 state, 적용(저장) 버튼 시 setState, 총 수 (앞단 페이징일 경우 필요 X) state
                    sggSearchParam={{searchForm: searchForm, setSearchParam: setSearchParam, doSearch: doSearch}} // 검색조건 입력 폼 Array, 검색조건 setState, 검색 조회 버튼 fnc {3개는 세트로 하나 있으면 다 있어야함}
                    sggGridChecked={true} // 그리드 좌측 체크박스 boolean
                    sggGridFormChange={{resize: true, headerMove: true, rowMove: true}} // 컬럼 리사이징 boolean, 컬럼 이동 boolean, 행 이동 boolean
                    sggPaging={true} // 페이징 여부 boolean
                    // sggTrOnClick={(e, item) => {console.log(item)}} // 행 클릭 시 fnc
                    // sggTrOnDoubleClick={(e, item) => {console.log(e)}} // 행 더블 클릭 시 fnc
                />
            </div>
        </>
    );
}

export default Menu;
