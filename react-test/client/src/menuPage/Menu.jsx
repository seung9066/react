import { useState, useEffect } from 'react'

import SggTreeNode from '@components/SggTreeNode'
import CRUDButton from "@components/CRUDButton";

function Menu( props ) {
    // 메뉴 데이터
    const [menuData, setMenuData] = useState([]);
    // 메뉴 데이터 트리 obj
    const [treeMenuData, setTreeMenuData] = useState([]);
    // 선택행 데이터
    const [selectedData, setSelectedData] = useState({});
    // 선택행 id
    const [selectId, setSelectId] = useState();
    // 선택행 id => 부모 id
    const [selectUpId, setSelectUpId] = useState();

    // 노드 선택행 제거
    const [diSelect, setDiSelect] = useState(false);

    // input disable
    let defaultInput = {
        showTitle: true,
        title: true,
        path: true,
        id: true,
        upId: true,
    }
    const [inputDisabled, setInputDisabled] = useState(defaultInput)

    // btn disable
    let defaultBtn = {
        CBtn : true,
        UBtn : true,
        DBtn : true,
        RBtn : false,
        etcBtn : false,
    }
    const [btnDisabled, setBtnDisabled] = useState(defaultBtn)

    useEffect(() => {
        getMenu();
    }, []);

    // 트리 선택
    useEffect(() => {
        if (selectedData) {
            let id = selectedData.id;

            let newMenuData = menuData.map((item) => {
                return item;
            })
        }
    }, [selectedData])

    // 메뉴 데이터 => 트리구조 obj
    useEffect(() => {
        setTreeMenuData(transformDataToTree(menuData));
    }, [menuData])

    // 트리 선택
    const selectedTree = (node) => {
        // 트리 선택 행 표시 on
        setDiSelect(false);

        setSelectedData(node);
        setSelectId(node.id);
        setSelectUpId(node.id);

        if (node.upId) {
            setBtnDisabled({
                ...btnDisabled,
                CBtn : true,
                UBtn : false,
                DBtn : false,
                etcBtn : true,
            })
        } else {
            setBtnDisabled({
                ...btnDisabled,
                CBtn : true,
                UBtn : false,
                DBtn : false,
                etcBtn: false,
            })
        }

        setInputDisabled({
            ...inputDisabled,
            id: true,
            upId: false,
            showTitle: false,
            path: false,
            title: false,
        })
    }

    // input 값 입력
    const changeValue = (e) => {
        let name = e.target.name;
        let value = e.target.value;

        if (name === 'id') {
            let newMenuData = structuredClone(menuData);
            let chkId = 0;
            for (const item of newMenuData) {
                item.id === value ? chkId++ : null;
            }

            if (chkId > 0 && value != selectId) {
                showToast("ID는 중복 불가능합니다.");
                value = selectId;
            }

        }
        
        setSelectedData({ ...selectedData, [name] : value });
    }

    const showToast = (msg) => {
        props.props.toastRef.current.showToast(msg);
    }

    const transformDataToTree = (data) => {
        const map = new Map();
        const roots = [];
    
        // 각 노드를 Map에 등록하고 children 초기화
        data.forEach((item) => {
            map.set(item.id, { ...item, children: [] });
        });
    
        // 부모-자식 관계 설정
        data.forEach((item) => {
            const node = map.get(item.id);
            if (item.upId === null || !map.has(item.upId)) {
                // 부모가 없으면 루트 노드로 간주
                roots.push(node);
            } else {
                const parent = map.get(item.upId);
                parent.children.push(node);
            }
        });
    
        return roots;
    };

    // server에서 메뉴 정보 가져오기
    const getMenu = async () => {
        try {
            const res = await fetch('/api/menu/getMenu');
            if (!res.ok) {
                throw new Error('서버 응답 오류');
            }
    
            const data = await res.json();
            setMenuData(data);
        } catch (err) {
            showToast("메뉴 데이터 로드 실패 ", err);
        }
    };

    // server에서 메뉴 정보 저장
    const saveMenu = async (menuData) => {
        try {
            const res = await fetch('/api/menu/updateMenu', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(menuData),
            });
    
            if (!res.ok) {
                throw new Error('서버 응답 오류');
            }
    
            const data = await res.json();
            return data.message;
        } catch (err) {
            showToast("메뉴 정보 저장 실패 ", err);
        }
    };
    
    // 순서 저장
    const orderBtn = async () => {
        let newMenuData = menuData.map((item) => item);
        
        let msg = await saveMenu(newMenuData);
        showToast(msg);

        await getMenu();
        RBtn();

        props.setMenu(treeMenuData);
    }

    // 초기화
    const RBtn = () => {
        // 메뉴 아이디
        setSelectId();
        // 메뉴 부모 아이디
        setSelectUpId();
        // 선택 트리 데이터
        setSelectedData({});

        // 트리 선택 행 표시 off
        setDiSelect(true);

        // CRUD 버튼
        setBtnDisabled(defaultBtn);
        // input
        setInputDisabled(defaultInput);
    }

    // 등록
    const CBtn = async () => {
        let newMenuData = concatMenu();

        let msg = await saveMenu(newMenuData);
        showToast(msg);
        
        await getMenu();
        RBtn();
    }
    
    // 수정
    const UBtn = async () => {
        let newMenuData = concatMenu();
        
        let msg = await saveMenu(newMenuData);
        showToast(msg);
        
        await getMenu();
        RBtn();
    }
    
    // 삭제
    const DBtn = async () => {
        let newMenuData = concatMenu("d");
        RBtn();
        
        let msg = await saveMenu(newMenuData);
        showToast(msg);

        await getMenu();
    }

    // 추가
    const AddBtn = () => {
        let newSelectedData = {...selectedData};
        if (newSelectedData.upId) {
            showToast("최상위 메뉴에만 하위메뉴를 추가할 수 있습니다.");
            return false;
        }
        setSelectId();
        setSelectedData({upId : selectUpId});

        setBtnDisabled({
            ...btnDisabled,
            CBtn: false,
        })

        if (selectUpId) {
            setInputDisabled({
                ...inputDisabled,
                id: false,
                upId: true,
                showTitle: false,
                path: false,
                title: false,
            })
        } else {
            setInputDisabled({
                ...inputDisabled,
                id: false,
                upId: false,
                showTitle: false,
                path: false,
                title: false,
            })
        }
    }

    // 메뉴 데이터 합치기
    const concatMenu = (cud) => {
        let newSelectedData = {...selectedData};
        let newMenuData = menuData.map((item) => item);
        if (selectId) {
            // 수정, 삭제
            let idx = 0;
            
            for (let i = 0; i < newMenuData.length; i++) {
                if (selectId === newMenuData[i].id) {
                    idx = i;
                    newMenuData[i] = newSelectedData;
                }
            }

            cud === "d" ? newMenuData.splice(idx, 1) : null;
        } else {
            // 등록
            newMenuData.push(newSelectedData);
        }

        return newMenuData;
    }

    return (
        <>
            <div>
                <button type='button' onClick={orderBtn}>순서저장</button>
                {menuData && <SggTreeNode data={menuData} setData={setMenuData} onSelect={selectedTree} diSelect={diSelect} notFold={true} />}
            </div>

            <div className="input-wrapper">
                {[
                    { id: 'showTitle', label: '메뉴명' },
                    { id: 'title', label: '화면명' },
                    { id: 'path', label: '경로' },
                    { id: 'id', label: 'ID' },
                ].map((field) => (
                    <div className="form-row" key={field.id}>
                        <label htmlFor={field.id}>{field.label}</label>
                        <input type="text" id={field.id} name={field.id} value={selectedData[field.id] ?? ''} disabled={inputDisabled[field.id]} onChange={changeValue} />
                    </div>
                ))}
                <div className='form-row'>
                    <label htmlFor='upId'>상위 ID</label>
                    <select id='upId' name='upId' disabled={inputDisabled['upId']} onChange={changeValue} value={selectedData['upId'] ?? ''}>
                        <option value=''></option>
                        {treeMenuData && treeMenuData.map((item) => 
                            <option value={item.id} key={item.id}>{item.showTitle}</option>
                        )}
                    </select>
                </div>
            </div>

            <div>
                <CRUDButton
                    CBtn={ {fnc: CBtn, disabled: btnDisabled.CBtn} }
                    RBtn={ {fnc: RBtn, disabled: btnDisabled.RBtn} }
                    UBtn={ {fnc: UBtn, disabled: btnDisabled.UBtn} }
                    DBtn={ {fnc: DBtn, disabled: btnDisabled.DBtn} }
                    etcBtn={{name:"추가", fnc: AddBtn, disabled: btnDisabled.etcBtn}}
                 />
            </div>


        </>
    );
}

export default Menu;
