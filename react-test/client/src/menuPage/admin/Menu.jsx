import { useState, useEffect } from 'react'

import SggTreeNode from '@components/SggTreeNode'
import CRUDButton from "@components/CRUDButton";
import SggGridReact from '@components/SggGridReact';
import Modal from '@components/Modal';

const modules = import.meta.glob('/src/menuPage/*.jsx');
const modules2 = import.meta.glob('/src/menuPage/*/*.jsx');

const thisPage = '/admin/menu';

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
        title: true,
        path: true,
        id: true,
        upId: true,
    }
    const [inputDisabled, setInputDisabled] = useState(defaultInput);

    // btn disable
    let defaultBtn = {
        CBtn : true,
        UBtn : true,
        DBtn : true,
        RBtn : false,
        etcBtn : false,
    }
    const [btnDisabled, setBtnDisabled] = useState(defaultBtn);

    // 동적으로 불러온 컴포넌트들을 저장할 state
    const [components, setComponents] = useState([]);
    const [gridData, setGridData] = useState([]);

    // 새 파일 경로 목록
    const [filePath, setFilePath] = useState({});
    
    // delNode 추가용 체크
    const [menuComponents, setMenuComponents] = useState(0);
    
    // 그리드 행클릭 초기화
    const [resetBtn, setResetBtn] = useState(true);

    // 그리드 버튼
    const [gridDisableAdd, setGridDisableAdd] = useState(true);

    // 추천 경로
    const [recommendArr, setRecommendArr] = useState([]);
    // 추천 경로
    const [recommendPath, setRecommendPath] = useState({});

    // 모달
    const [isModalOpen, setIsModalOpen] = useState(false);

    // 트리 선택
    const selectedTree = (node) => {
        // 트리 선택 행 표시 on
        setDiSelect(false);

        setSelectedData(node);
        setSelectId(node.id);
        setSelectUpId(node.id);

        if (node.upId) {
            // 하위 메뉴
            selectTreeChildrenDisabled();
        } else {
            if (node.children?.length > 0) {
                // 자식 있는 부모 메뉴 클릭
                selectTreeParentHasChildrenDisabled();
            } else {
                // 자식 없는 부모 메뉴 클릭
                selectTreeParentNoChildrenDisabled();
            }
        }

        if (node.path === '/main') {
            // 메인 메뉴 클릭
            selectTreeHomeDisabled();
        }

        getRecommendPath(node);
    }

    // 메인 메뉴 클릭
    const selectTreeHomeDisabled = () => {
        setBtnDisabled({
            ...btnDisabled,
            CBtn : true,
            UBtn : true,
            DBtn : true,
            etcBtn: true,
        })

        setInputDisabled({
            ...inputDisabled,
            path: true,
            title: true,
        })
    }

    // 하위 메뉴 클릭
    const selectTreeChildrenDisabled = () => {
        setBtnDisabled({
            ...btnDisabled,
            CBtn : true,
            UBtn : false,
            DBtn : false,
            etcBtn : true,
        })
        
        setInputDisabled({
            ...inputDisabled,
            path: false,
            title: false,
        })
    }

    // 자식 있는 부모 메뉴 클릭
    const selectTreeParentHasChildrenDisabled = () => {
        setBtnDisabled({
            ...btnDisabled,
            CBtn : true,
            UBtn : false,
            DBtn : false,
            etcBtn: false,
        })

        setInputDisabled({
            ...inputDisabled,
            path: false,
            title: false,
        })
    }

    // 자식 없는 부모 메뉴 클릭
    const selectTreeParentNoChildrenDisabled = () => {
        setBtnDisabled({
            ...btnDisabled,
            CBtn : true,
            UBtn : false,
            DBtn : false,
            etcBtn: false,
        })
        
        setInputDisabled({
            ...inputDisabled,
            path: false,
            title: false,
        })
    }

    // input 값 입력
    const changeValue = (e) => {
        let name = e.target.name;
        let value = e.target.value;
        let newSelectedData = {...selectedData};

        newSelectedData[name] = value;

        setSelectedData(newSelectedData);
    }

    // 타이틀 입력 후 focus out + path 없을 시 path를 title로 자동 입력
    const onBlur = (e) => {
        let id = e.target.id;
        
        if (id === 'title') {
            let title = selectedData.title;
            if (title) {
                title = title.charAt(0).toLowerCase() + title.slice(1);
                let path = selectedData.path;
                path ? null 
                    : title ? setSelectedData({...selectedData, path: '/' + title}) 
                            : null;
            }
        }
    }

    const beforeChkDuple = () => {
        let newSelectedData = {...selectedData};
        let newMenuData = structuredClone(menuData);
        let chkDupleKey = '';

        for (const item of newMenuData) {
            for (const key in item) {
                if (key !== 'upId') {
                    if (item['id'] !== selectId) {
                        item[key] === newSelectedData[key] ? chkDupleKey = key : null;
                    }
                    if (chkDupleKey) {
                        break;
                    }
                }
            }
        }

        // 연결된 label
        let label = document.querySelector(`label[for="${chkDupleKey}"]`);
        let labelText = label?.textContent
        let input = document.querySelector(`input[id="${chkDupleKey}"]`);

        if (chkDupleKey) {
            showToast(labelText + '는 중복 불가능합니다.');
            input.focus();
            return false;
        }

        return true;
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
            props.setMenu(transformDataToTree(data));
            setMenuComponents(0);
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

    // 순서 초기화
    const resetOrderBtn = async() => {
        await getMenu();

        RBtn();
    }
    
    // 순서 저장
    const orderBtn = async () => {
        let newMenuData = menuData.map((item) => item);
        newMenuData.map((item) => delete item.children);
        
        let msg = await saveMenu(newMenuData);
        showToast(msg);

        await getMenu();
        RBtn();
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

        // 그리드
        onGridReset();
    }
    
    // 등록
    const CBtn = async () => {
        if (!beforeChkDuple()) {
            return false;
        }
        
        let newMenuData = concatMenu();
        
        let msg = await saveMenu(newMenuData);
        showToast(msg);
        
        await getMenu();
        RBtn();
    }
    
    // 수정
    const UBtn = async () => {
        if (!beforeChkDuple()) {
            return false;
        }
        
        let newMenuData = concatMenu();

        let msg = await saveMenu(newMenuData);
        showToast(msg);
        
        await getMenu();
        RBtn();
    }
    
    // 삭제
    const DBtn = async () => {
        let newMenuData = concatMenu("d");
        
        let msg = await saveMenu(newMenuData);
        showToast(msg);
        
        await getMenu();
        RBtn();
    }

    // 추가
    const AddBtn = () => {
        let newSelectedData = {...selectedData};
        if (newSelectedData.upId && !selectUpId) {
            showToast("최상위 메뉴에만 하위메뉴를 추가할 수 있습니다.");
            return false;
        }
        setSelectId();
        let id = makeId();
        setSelectedData({
            upId : selectUpId,
            id : id,
        });

        setBtnDisabled({
            ...btnDisabled,
            CBtn: false,
        })

        if (selectUpId) {
            setInputDisabled({
                ...inputDisabled,
                path: false,
                title: false,
            })
        } else {
            setInputDisabled({
                ...inputDisabled,
                path: false,
                title: false,
            })
        }
    }

    // 메뉴 id 생성
    const makeId = (upId) => {
        let newMenuData = structuredClone(menuData);
        let depth = upId ? upId.charAt(0) === 'A' ? 'B' : 'A' : selectUpId?.charAt(0) === 'A' ? 'B' : 'A';
        let maxId = '';
        for (const item of newMenuData) {
            let itemDepth = item.id.substring(0, 1);
            
            if (depth === itemDepth) {
                let itemId = item.id.substring(1);
                maxId < itemId ? maxId = Number(itemId) + 1: maxId = maxId;
            }
        }
        let id = depth + ('00' + maxId).slice(-3);
        return id;
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

        newMenuData.map((item) => item.delNode ? delete item.delNode : item);
        newMenuData.map((item) => item.children ? delete item.children : item);
        newMenuData.map((item) => item.totalPath ? delete item.totalPath : item);
        newMenuData.map((item) => item.path.charAt(0) === '/' ? item : item.path = '/' + item.path);

        return newMenuData;
    }

    // 메뉴, 파일 비교
    const chkMenuComponents = (menu = [], component = []) => {
        let newMenuData = structuredClone(menu);
        let newComponents = structuredClone(component);
        
        // 파일
        for (const item of newComponents) {
            let src = '/src/menuPage';
            item.path = item.path.replace('.jsx', '');
            item.path = item.path.substring(src.length);
        }
        
        // 메뉴
        for (const item of newMenuData) {
            if (!item.upId) {
                item.totalPath = item.path;
            }
            
            for (const item2 of newMenuData) {
                if (item2.upId === item.id) {
                    item2.totalPath = item.path + item2.path;
                }
            }
        }
        
        // 실제 파일 경로와 메뉴 경로 다른거 찾기
        chkPathMenuComponents(newMenuData, newComponents);
        // 등록되어 있지 않는 파일 찾기
        setGridData(chkDupleMenuComponents(newMenuData, newComponents));
        // 유사도 비교
        getLevenShtein(newMenuData, newComponents);
    }

    // 실제 파일 경로와 메뉴 경로 다른거 찾기
    const chkPathMenuComponents = (newMenuData = [], newComponents = []) => {
        let chkDifferent = 0;
        // 등록되어 있지 않은 파일
        for (const [idx, item] of newMenuData.entries()) {
            let chk = 0;
            
            if (!item.upId || item.delNode || item.totalPath === thisPage) {
                chk++;
            }

            for (const item2 of newComponents) {
                if (item2.path.toLowerCase() === item.totalPath.toLowerCase()) {
                    chk++;
                }
            }

            if (chk === 0) {
                chkDifferent++;
                item.delNode = true;
            } else {
                item.delNode ? (chkDifferent++, delete item.delNode) : null;
            }
        }
        
        if (chkDifferent > 0) {
            setMenuData(newMenuData);
        }
    }

    // 등록되어 있지 않는 파일 찾기
    const chkDupleMenuComponents = (newMenuData = [], newComponents = []) => {
        // 등록되어 있지 않은 파일
        let concatMenu = [];
        for (const item of newComponents) {
            let chk = 0;

            for (const item2 of newMenuData) {
                if (item.path.toLowerCase() === item2.totalPath.toLowerCase()) {
                    chk++;
                }
            }

            chk === 0 ? concatMenu.push(item) : null;
        }

        let pathArr = [];
        for (const item of concatMenu) {
            pathArr.push(splitPath(item));
        }

        return pathArr;
    }

    // 문자열 유사도 비교
    const getLevenShtein = (newMenuData, newComponents) => {
        let gridArr = chkDupleMenuComponents(newMenuData, newComponents);
        let levenArr = [];
        // for (const item of newMenuData) {
        //     for (const item2 of gridArr) {
        //         let levenObj = levenshtein(item.totalPath, (item2.upPath + item2.path));
        //         if (levenObj) {
        //             levenArr.push(levenObj);
        //         }
        //     }
        // }

        levenArr = includePath(newMenuData, gridArr);

        setRecommendArr(levenArr);
    }

    // 문자열 유사도
    const levenshtein = (a, b) => {
        if (!a || !b) return 0.0;

        const lowerA = a.toLowerCase();
        const lowerB = b.toLowerCase();

        const lenA = lowerA.length;
        const lenB = lowerB.length;

        const matrix = Array.from({ length: lenB + 1 }, () => Array(lenA + 1).fill(0));

        for (let i = 0; i <= lenB; i++) {
            matrix[i][0] = i;
        }
        for (let j = 0; j <= lenA; j++) {
            matrix[0][j] = j;
        }

        for (let i = 1; i <= lenB; i++) {
            for (let j = 1; j <= lenA; j++) {
                if (lowerB[i - 1] === lowerA[j - 1]) {
                    matrix[i][j] = matrix[i - 1][j - 1];
                } else {
                    matrix[i][j] = Math.min(
                        matrix[i - 1][j] + 1,     // 삭제
                        matrix[i][j - 1] + 1,     // 삽입
                        matrix[i - 1][j - 1] + 1  // 교체
                    );
                }
            }
        }

        const distance = matrix[lenB][lenA];
        const maxLen = Math.max(lenA, lenB);

        const similarity = maxLen === 0 ? 100 : (1 - distance / maxLen) * 100;
        const returnValue = similarity.toFixed(2);
        if (maxLen !== 0) {
            let splitLeven = levenshteinSplit(a, b);
            
            if (splitLeven) {
                return splitLeven;
            } else {
                return {menuTotalPath: a, componentTotalPath: b, leven: returnValue};
            }
        }
    }

    const levenshteinSplit = (a, b) => {
        let slashA = 0;
        for (let i = 0; i < a.length; i++) {
            a[i] === '/' ? slashA = i : null;
        }
        let pathA = a.substring(slashA);
        let slashB = 0;
        for (let i = 0; i < b.length; i++) {
            b[i] === '/' ? slashB = i : null;
        }
        let pathB = b.substring(slashB);

        let slicePath = {};
        if (slashA > 0 || slashB > 0) {
            slicePath = levenshtein(pathA, pathB);
        }

        if (Object.keys(slicePath).length > 0) {
            return {menuTotalPath: a, componentTotalPath: b, leven: slicePath.leven}
        }
    }

    // 메뉴로 상위메뉴까지 찾기
    const getMenuUpPath = (path) => {
        const newMenuData = structuredClone(menuData);
        let returnValue = '';
        for (const item of newMenuData) {
            if (item.path === path) {
                returnValue = item.upPath;
            }
        }
        return returnValue;
    }

    // 컴포넌트 상위 경로 찾기
    const getComponentUpPath = (path) => {
        const newComponents = structuredClone(components);
        let returnValue = '';
        for (const item of newComponents) {
            let slash = 0;
            let itemPath = item.path;
            for (let i = 0; i < itemPath.length; i++) {
                itemPath[i] === '/' ? slash = i : null;
            }

            let splitPath = itemPath.substring(slash);
            splitPath = splitPath.replace('.jsx', '');

            if (splitPath.toLowerCase() === path.toLowerCase()) {
                let returnPath = item.path;
                returnPath = returnPath.replace('/src/menuPage', '');
                returnPath = returnPath.replace('.jsx', '');
                
                let slash2 = 0;
                for (let i = 0; i < returnPath.length; i++) {
                    returnPath[i] === '/' ? slash2 = i : null;
                }
                slash2 !== 0 ? returnPath = returnPath.substring(0, slash2) : null;
                returnValue = returnPath
            }
        }
        return returnValue;
    }

    // 문자열 유사도에 걸리는게 없을 때 포함값으로 체크
    const includePath = (newMenuData, gridArr) => {
        let arr = [];
        
        let gridArr2 = [];
        for (const item of gridArr) {
            let gridPath = item.upPath + item.path;
            for (const item2 of newMenuData) {
                let menuPath = item2.totalPath;
                // 유사도 넣기 (gridArr 수 만큼 넣기 위해서 순서 바꿈)
                gridArr2.push(levenshtein(gridPath, menuPath));
            }
        }

        let maxArr = [];
        let max = {};
        for (const item of gridArr2) {
            if (max.menuTotalPath === item.menuTotalPath) {
                if (Number(max.leven) < Number(item.leven)) {
                    max = {...item};
                    for (let [idx, item2] of maxArr.entries()) {
                        if (max.menuTotalPath === item2.menuTotalPath) {
                            maxArr[idx] = max;
                        }
                    }
                }
            } else {
                max = {...item};
                maxArr.push(max);
            }
        }
        
        // 유사도 넣기 (gridArr 수 만큼 넣기 위해서 순서 바꾼거 풀어주기)
        for (let i = 0; i < maxArr.length; i++) {
            let newItem = {
                menuTotalPath: maxArr[i].componentTotalPath,
                componentTotalPath: maxArr[i].menuTotalPath,
                leven: maxArr[i].leven,
            }
    
            maxArr[i] = newItem;
        }

        return maxArr;
    }

    const splitPath = (item) => {
        let slashArr = [];
        let path = item.path;
        let pathArr = {};
        for (let i = 0; i < path.length; i++) {
            path[i] === '/' ? slashArr.push(i) : null;
        }

        for (let i = 0; i < slashArr.length; i++) {
            if (i !== slashArr.length - 1) {
                pathArr.upPath = path.substring(slashArr[i], slashArr[i + 1]);
            } else {
                let camelPath = path.substring(slashArr[i]);
                camelPath = '/' + camelPath.charAt(1).toLowerCase() + camelPath.slice(2);
                pathArr.path = camelPath;
            }
        }

        return pathArr;
    }
    
    // 그리드 행 클릭
    const gridTrClick = (e, item) => {
        // 선택 그리드 행 데이터
        setFilePath(item);

        // 그리드 행 선택 표시 유지
        setResetBtn(true);
        // 그리드 등록 버튼 disable
        setGridDisableAdd(false);
    }

    // 그리드 초기화
    const onGridReset = () => {
        setGridDisableAdd(true);
        setResetBtn(false);
        setFilePath({});
    }

    // 그리드 파일 메뉴 등록
    const addGridToMenu = () => {
        let newFilePath = structuredClone(filePath);
        if (Object.keys(newFilePath).length > 0) {
            let newMenuData = structuredClone(menuData);
            let chkUpId = 0;
            for (const item of newMenuData) {
                if (newFilePath.upPath) {
                    chkUpId++;
                    newFilePath.upPath === item.path ? newFilePath.upId = item.id : null;
                }
            }

            if (newFilePath.upPath && !newFilePath.upId) {
                showToast('상단 메뉴 생성 후 다시 진행해주세요.');
                newFilePath.path = newFilePath.upPath;
            }
            
            newFilePath.id = makeId(newFilePath.upId);
            
            // 트리 선택 행 표시 off
            setDiSelect(true);
            // 그리드 파일 메뉴 등록 데이터 세팅
            setGridAddData(newFilePath);
            // 그리드 파일 메뉴 등록 인풋, 버튼 disable
            setGridAddDisable();
        }
    }

    // 그리드 파일 메뉴 등록 데이터 세팅
    const setGridAddData = (data) => {
        // 메뉴 아이디
        setSelectId();
        // 메뉴 부모 아이디
        setSelectUpId(data.upId);
        // 선택 트리 데이터
        setSelectedData(data);
    }

    // 그리드 파일 메뉴 등록 인풋, 버튼 disable
    const setGridAddDisable = () => {
        setInputDisabled({
            ...inputDisabled,
            title: false,
            path: true,
            id: true,
            upId: true,
        })

        setBtnDisabled({
            ...btnDisabled,
            CBtn : false,
            UBtn : true,
            DBtn : true,
            etcBtn: true,
        })
    }

    // 유사한 경로 추천
    const getRecommendPath = (node) => {
        const newRecommend = structuredClone(recommendArr);
        let recommendFile = '';
        let arr = [];
        for (const item of newRecommend) {
            if (item.menuTotalPath === node.totalPath) {
                arr.push(item);
            }
        }

        let max = {};
        for (const item of arr) {
            if (Object.keys(max).length > 0) {
                if (Number(max.leven) < Number(item.leven)) {
                    max = item;
                }
            } else {
                max = item;
            }
        }

        if (max.componentTotalPath) {
            recommendFile = splitPath({path: max.componentTotalPath});
            recommendFile.leven = max.leven;
        }

        if (recommendFile) {
            setIsModalOpen(true);
        }

        setRecommendPath(recommendFile);
    }

    // 모달 유사 경로 사용 확인
    const onConfirmModal = () => {
        setIsModalOpen(false);
        const upPath = recommendPath.upPath;
        const path = recommendPath.path;
        let upId = '';
        const newMenuData = structuredClone(menuData);
        for (const item of newMenuData) {
            item.path === upPath ? upId = item.id : null;
        }
        let newSelectedData = structuredClone(selectedData);
        delete newSelectedData.delNode;
        newSelectedData.path = path;
        newSelectedData.upId = upId;

        setSelectedData(newSelectedData);
    }

    useEffect(() => {
        // 메뉴 데이터 => 트리구조 obj
        setTreeMenuData(transformDataToTree(menuData));
        
        // 항상 메인페이지는 젤 처음에
        if (menuData.length > 0 && menuData[0].path !== '/main') {
            // 깊은 복사
            let newMenuData = structuredClone(menuData);
            // 인덱스 찾기
            let idx = newMenuData.findIndex(item => item.path === '/main');
            let [item] = newMenuData.splice(idx, 1);
            newMenuData.unshift(item);
            setMenuData(newMenuData);

            showToast('메인 페이지는 항상 처음에 와야합니다.');
        }
    }, [menuData])
    
    useEffect(() => {
        // 컴포넌트 동적 로딩 함수
        const loadComponents = async () => {
            const totalModules = Object.assign({}, modules, modules2);
            // modules 객체의 각 파일을 import() 해서 default export만 추출
            const loaded = await Promise.all(
                Object.entries(totalModules).map(async ([path]) => {
                    return {
                        path
                    };
                })
            );
            
            // 추출한 컴포넌트 배열로 상태 설정
            setComponents(loaded);
        };

        loadComponents();

        getMenu();
    }, []);

    // 파일, 메뉴 조회 시 메뉴로 등록되어있는 파일 제거
    useEffect(() => {
        let newMenuData = structuredClone(menuData);
        let newComponents = structuredClone(components);

        if (newMenuData.length > 0 && newComponents.length > 0 && menuComponents === 0) {
            setMenuComponents(1);
        } else {
            setTimeout(() => {
                setMenuComponents(0);
            }, 0)
        }
        
    }, [components, menuData])

    useEffect(() => {
        if (menuComponents === 1) {
            let newMenuData = structuredClone(menuData);
            let newComponents = structuredClone(components);
    
            chkMenuComponents(newMenuData, newComponents);
        }
    }, [menuComponents]);

    return (
        <>
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onConfirm={onConfirmModal}>
                <h2>추천 경로</h2>
                <p>상위 경로 : {recommendPath.upPath}</p>
                <p>경로 : {recommendPath.path}</p>
                <p>유사율 : {recommendPath.leven}%</p>
            </Modal>
            <div className='flexLeftRight'>
                <div>
                    <div>
                        <button type='button' className='secondary' onClick={resetOrderBtn}>순서 초기화</button>
                        <button type='button' className='primary' onClick={orderBtn}>순서 저장</button>
                    </div>
                    <div>
                        {menuData && <SggTreeNode showCol={['title', 'path', 'id']} data={menuData} setData={setMenuData} onSelect={selectedTree} diSelect={diSelect} alwaysOpen={true} />}
                    </div>

                    <div className="input-wrapper">
                        {[
                            { id: 'title', label: '메뉴명' },
                            { id: 'path', label: '경로' },
                            { id: 'id', label: 'ID' },
                        ].map((field) => (
                            <div className="form-row" key={field.id}>
                                <label htmlFor={field.id}>{field.label}</label>
                                <input type="text" id={field.id} name={field.id} value={selectedData[field.id] ?? ''} disabled={inputDisabled[field.id]} onChange={changeValue} onBlur={onBlur}/>
                            </div>
                        ))}
                        <div className='form-row'>
                            <label htmlFor='upId'>상위 ID</label>
                            <select id='upId' name='upId' disabled={inputDisabled['upId']} onChange={changeValue} value={selectedData['upId'] ?? ''}>
                                {!selectedData['upId'] && (
                                    <option value=''></option>
                                )}
                                {treeMenuData && treeMenuData.map((item) => 
                                    item.id !== 'A001' && <option value={item.id} key={item.id}>{item.title}</option>
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
                </div>
                <div>
                    <h3>메뉴에 없는 파일</h3>
                    <div>
                        <SggGridReact 
                            columns={[{key:'upPath', name:'상위경로'}, {key:'path', name:'경로'}]}
                            data={{gridData:gridData}}
                            onClick={gridTrClick}
                            resetBtn={resetBtn}
                            />
                    </div>
                    <div>
                        <CRUDButton
                            CBtn={ {fnc: addGridToMenu, disabled: gridDisableAdd} }
                            RBtn={ {fnc: onGridReset} }
                        />
                    </div>
                </div>
            </div>
        </>
    );
}

export default Menu;
