import { useEffect, useRef, useState } from 'react';

import DeleteIcon from '@mui/icons-material/Delete';
import LoopIcon from '@mui/icons-material/Loop';
import SaveIcon from '@mui/icons-material/Save';

import WiniAgGridReact from 'Components/atoms/AgGridReact/WiniAgGridReact';
import WiniBox from 'Components/atoms/Box/WiniBox';
import WiniButton from 'Components/atoms/Button/WiniButton';
import WiniCheckbox from 'Components/atoms/Checkbox/WiniCheckbox';
import WiniDialog from 'Components/atoms/Dialog/WiniDialog';
import WiniDialogActions from 'Components/atoms/DialogActions/WiniDialogActions';
import WiniDialogContent from 'Components/atoms/DialogContent/WiniDialogContent';
import WiniDialogTitle from 'Components/atoms/DialogTitle/WiniDialogTitle';
import WiniGridLayout from 'Components/atoms/Grid/WiniGridLayout';
import WiniMenuItem from 'Components/atoms/MenuItem/WiniMenuItem';
import WiniSelect from 'Components/atoms/Select/WiniSelect';
import WiniSnackbar from 'Components/atoms/Snackbar/WiniSnackbar';
import WiniText from 'Components/atoms/Text/WiniText';
import WiniTreeView from 'Components/atoms/TreeView/WiniTreeView';
import WiniTypography from 'Components/atoms/Typography/WiniTypography';
import WiniFormCommon from 'Components/blocks/Form/WiniFormCommon';
import winiCom from 'Library/winiCom';
import winiMsg from 'Library/winiMsg';

import ArrowRightIcon from "@mui/icons-material/ArrowRight";
import DescriptionIcon from "@mui/icons-material/Description";
import FolderIcon from "@mui/icons-material/Folder";
import { ArrowDropDownIcon } from '@mui/x-date-pickers/icons';
import WiniNumber from 'Components/atoms/Number/WiniNumber';

export default function SysCmmnCode(props) {
    // 권한별 CRUD
    const { winiEvent , winiAut, connector } = winiCom.getFormInfo();

    // 스낵바
    const [barReason, setBarReason] = useState('');
    const [barOpen, setBarOpen] = useState(false);
    const handleBarClose = (event, reason) => {
        if (reason === "clickaway") return;
        setBarOpen(false);
        setBarReason('');
    };

    useEffect(() => {
        if(barReason) {
            setBarOpen(true);
        }
    }, [barReason]);

    // 메뉴 목록 ref
    const menuTreeRef = useRef(null);

    // 메뉴 ref
    const menuRef = useRef(null);

    // 메뉴 목록 selectoption
    const [menuSelectOption, setMenuSelectOption] = useState([]);

    // 상위메뉴ID selectoption
    const [upperMenuSelectOption, setUpperMenuSelectOption] = useState([]);

    // 메뉴 목록 selectoption 선택
    const [selectMenuOption, setSelectMenuOption] = useState("");

    // 메뉴 트리 체크 목록
    const [menuTreeCheck, setMenuTreeCheck] = useState([]);

    // 메뉴 트리 목록
    const [menuTree, setMenuTree] = useState([]);

    // 메뉴 트리 선택 행
    const [selectMenu, setSelectMenu] = useState({
        "chk": false,
        "id": "",
        "menuCode": "",
        "menuMapping": "",
        "menuStatus": "DISABLE",
        "menuType": "MENU",
        "name": "",
        "parentMenuId": "",
        "selectMenu": "",
        "programId": "",
        "programMapping": "",
        "sortSeq": "",
        "status": "ENABLE"
    });

    // 메뉴 enabled
    const [menuEnabled, setMenuEnabled] = useState({
        resetBtn : false,
        saveBtn : false,
        updateBtn : true,
        deleteBtn : true,
        selectUpper : false,
    })

    // 화면ref
    const programRef = useRef(null);

    // 화면 검색
    const [programSearchKeyword, setProgramSearchKeyword] = useState("");

    // 화면 목록
    const [programList, setProgramList] = useState([]);

    // 화면 그리드
    const programGridRef = useRef(null);

    // 화면 enabled
    const [programEnabled, setProgramEnabled] = useState({
        resetBtn : false,
        saveBtn : false,
        updateBtn : true,
        deleteBtn : true,
    });

    // 화면 그리드 선택 행
    const [selectProgram, setSelectProgram] = useState({
        "menuStatus": "DISABLE",
        "mobileStatus": "DISABLE",
        "parentProgramId": "",
        "programCode": "",
        "programId": "",
        "programMapping": "",
        "programMappingStatus": "DEFAULT",
        "programName": "",
        "remark": "",
        "status": "DISABLE",
        "relProgramList" : []
    });

    // 화면 관련경로 팝업
    const [openProgramMappingDialog, setOpenProgramMappingDialog] = useState(false);

    // 화면관련경로 목록
    const [programDisableList, setProgramDisableList] = useState([]);

    // 화면관련경로 추가 목록
    const [selectProgramDisable, setSelectProgramDisable] = useState([]);

    // 화면관련경로 팝업 검색
    const [dialogSearchKeyword, setDialogSearchKeyword] = useState("");

    // 메뉴 목록 트리 조회
    const getMenuListTree = async() => {
        try {
            const response = await connector.client.get("/api/v1/system/menu/tree");
            
            if (response && response.data && response.data.result === "SUCCESS") {
                if (response.data.data) {
                    let data = response.data.data;
                    // 메뉴목록 selectoption
                    setMenuSelectOption(data);

                    // 상위메뉴ID selectoption
                    makeUpperMenuId(data);

                    if (selectMenuOption && selectMenuOption !== "defaultValue") {
                        data = data.filter((objson) => {
                            return objson.id === selectMenuOption
                        });
                    }

                    addParentMenuName(data, "");
                    // 메뉴목록 트리
                    setMenuTree(data);
                    // 초기화
                    doResetMenu();
                }
            }
        } catch(error) {
            setBarReason('메뉴 목록 조회 중 오류 발생');
        }
    }
    
    // 메뉴 목록 트리 순서수정
    const postMenuOrder = async(params) => {
        try {
            const response = await connector.client.put("/api/v1/system/menu/order", params);
            
            if (response && response.data && response.data.result === "SUCCESS") {
                setBarReason('메뉴 순서 수정 완료');
            }
        } catch(error) {
            setBarReason('메뉴 순서 수정 중 오류 발생');
        }
    }
    
    // 메뉴 추가
    const doSaveMenu = async() => {
        try {
            let params = {...selectMenu};
            params.menuName = params.name;

            if (!checkRequired(menuRef)) {
                return false
            }

            const response = await connector.client.post("/api/v1/system/menu", params);
            
            if (response && response.data && response.data.result === "SUCCESS") {
                setBarReason('메뉴 추가 완료');
                // 조회
                getMenuListTree();
            }
        } catch(error) {
            setBarReason('메뉴 추가 중 오류 발생');
        }
    }

    // 메뉴 수정
    const doUpdateMenu = async() => {
        try {
            let params = {...selectMenu};
            params.menuName = params.name;

            if (!checkRequired(menuRef)) {
                return false
            }

            const response = await connector.client.patch("/api/v1/system/menu/" + params.id, params);
            
            if (response && response.data && response.data.result === "SUCCESS") {
                setBarReason('메뉴 수정 완료');
                // 조회
                getMenuListTree();
            }
        } catch(error) {
            setBarReason('메뉴 수정 중 오류 발생');
        }
    }

    // 메뉴 삭제
    const doDeleteMenu = async() => {
        try {
            let params = {...selectMenu};
            const response = await connector.client.delete("/api/v1/system/menu/" + params.id + "?confirmYn=Y");
            
            if (response && response.data && response.data.result === "SUCCESS") {
                setBarReason('메뉴 삭제 완료');
                // 조회
                getMenuListTree();
            }
        } catch(error) {
            setBarReason('메뉴 삭제 중 오류 발생');
        }
    }

    // 메뉴 프로그램 삭제
    const doDeleteMenuProgram = async(id, fnc) => {
        try {
            const response = await connector.client.delete("/api/v1/system/menu/" + id + "?confirmYn=Y");
            
            if (response && response.data && response.data.result === "SUCCESS") {
                setBarReason('메뉴 삭제 완료');
                fnc();
            }
        } catch(error) {
            setBarReason('메뉴 삭제 중 오류 발생');
        }
    }

    // 메뉴 프로그램 추가
    const doSaveMenuProgram = async(params, fnc) => {
        try {
            const response = await connector.client.post("/api/v1/system/menu", params);
            
            if (response && response.data && response.data.result === "SUCCESS") {
                setBarReason('메뉴 추가 완료');
                fnc();
            }
        } catch(error) {
            setBarReason('메뉴 추가 중 오류 발생');
        }
    }

    // 화면 목록 조회
    const getprogramListData = async() => {
        try {
            let keyword = programSearchKeyword ? programSearchKeyword : "";
            const response = await connector.client.get("/api/v1/system/program?searchKeyword=" + keyword);

            if (response && response.data && response.data.result === "SUCCESS") {
                if (response.data.data) {
                    let data = response.data.data;
                    let pageNo = 1;
                    for (const item of data) {
                        item.selected = false;
                        item.no = pageNo;
                        pageNo++;
                    }

                    doResetProgram();
                    setProgramList(data);
                }
            }
        } catch(error) {
            setBarReason('화면 목록 조회 중 오류 발생');
        }
    }

    // 화면 상세 조회
    const getProgramDetail = async(programId) => {
        try {
            const response = await connector.client.get("/api/v1/system/program/" + programId);

            if (response && response.data && response.data.result === "SUCCESS") {
                if (response.data.data) {
                    let data = response.data.data;
                    for (let item of data.relProgramList) {
                        item.forDelete = "X";
                    }
                    
                    setSelectProgram(data);
                    setSelectProgramDisable(data.relProgramList);
                }
            }
        } catch(error) {
            setBarReason('화면 상세 조회 중 오류 발생');
        }
    }

    // 화면 추가
    const doSaveProgram = async() => {
        try {
            let params = validateProgram();

            if (params) {
                const response = await connector.client.post("/api/v1/system/program", params);
                
                if (response && response.data && response.data.result === "SUCCESS") {
                    setBarReason('화면 추가 완료');
                    // 조회
                    getprogramListData();
                }
            }
        } catch(error) {
            setBarReason('화면 추가 중 오류 발생');
        }
    }

    // 화면 수정
    const doPatchProgram = async() => {
        try {
            let params = validateProgram();

            if (params) {
                const response = await connector.client.patch("/api/v1/system/program/" + params.programId, params);
                
                if (response && response.data && response.data.result === "SUCCESS") {
                    setBarReason('화면 수정 완료');
                    // 조회
                    getprogramListData();
                }
            }
        } catch(error) {
            setBarReason('화면 수정 중 오류 발생');
        }
    }

    // 화면 삭제
    const doDeleteProgram = async() => {
        try {
            let params = {...selectProgram};

            if (params) {
                const response = await connector.client.delete("/api/v1/system/program/" + params.programId);
                
                if (response && response.data && response.data.result === "SUCCESS") {
                    setBarReason('화면 삭제 완료');
                    // 조회
                    getprogramListData();
                }
            }
        } catch(error) {
            setBarReason('화면 삭제 중 오류 발생');
        }
    }

    // 화면관련경로 조회
    const getProgramDisableListData = async() => {
        try {
            const response = await connector.client.get("/api/v1/system/program/?MenuStatus=DISABLE");

            if (response && response.data && response.data.result === "SUCCESS") {
                let data = response.data.data;
                if (dialogSearchKeyword) {
                    data = data.filter((item) => {
                        return item.programName.indexOf(dialogSearchKeyword) > -1
                    })
                }
                setProgramDisableList(data);
            }
        } catch (error) {
            setBarReason('화면관련경로 조회 중 오류 발생');
        }
    }

    // 메뉴 초기화
    const doResetMenu = () => {
        setSelectMenu({
            "chk": false,
            "id": "",
            "menuCode": "",
            "menuMapping": "",
            "menuStatus": "DISABLE",
            "menuType": "MENU",
            "name": "",
            "parentMenuId": "",
            "selectMenu": "",
            "programId": "",
            "programMapping": "",
            "sortSeq": "",
            "status": "ENABLE"
        });

        setMenuEnabled({
            resetBtn : false,
            saveBtn : false,
            updateBtn : true,
            deleteBtn : true,
            selectUpper : false,
        });

        // 체크된 메뉴 트리 초기화
        setMenuTreeCheck([]);

        // 체크 표시 제거
        const removeAllCheckMenuTree = (treeData) => {
            for (const item of treeData) {
                item.chk ? item.chk = false : "";

                item.children ? removeAllCheckMenuTree(item.children) : "";
            }
        }

        removeAllCheckMenuTree(menuTree);

        menuTreeRef.current.deselectAll();
    }

    // 화면 초기화
    const doResetProgram = () => {
        setSelectProgram({
            "menuStatus": "DISABLE",
            "mobileStatus": "DISABLE",
            "parentProgramId": "",
            "programCode": "",
            "programId": "",
            "programMapping": "",
            "programMappingStatus": "DEFAULT",
            "programName": "",
            "remark": "",
            "status": "DISABLE",
            "relProgramList" : []
        });

        setProgramEnabled({
            resetBtn : false,
            saveBtn : false,
            updateBtn : true,
            deleteBtn : true,
        });

        setSelectProgramDisable([]);

        // 체크박스 해제
        let newProgramList = [...programList].map((item) => {
            return { ...item, selected : false }
        })

        setProgramList(newProgramList);
    }

    // 메뉴 목록 부모명 추가
    const addParentMenuName = (data, parentMenuName) => {
        // 자식 제거 + 하나의 배열로 합치기
        for (const item of data) {
            item.parentMenuName = parentMenuName;
            if (item.children && item.children.length > 0) {
                let newparentMenuName = item.name;
                addParentMenuName(item.children, newparentMenuName);
            }
        }
    }

    // 상위메뉴ID selectoption
    const makeUpperMenuId = (data) => {
        let newData = makeTreeToListForUpperMenuId(data);
        setUpperMenuSelectOption(newData);
    }

    // 상위메뉴ID 찾기
    const makeTreeToListForUpperMenuId = (data) => {
        let treeToArr = [];

        // 자식 제거 + 하나의 배열로 합치기
        for (const item of data) {
            const newItem = { ...item };

            if (item.menuType === "MENU") {
                treeToArr.push(newItem);
            }
            
            if (item.children && item.children.length > 0) {
                treeToArr = treeToArr.concat(makeTreeToListForUpperMenuId(item.children));
            }
        }
    
        return treeToArr;
    }

    // 메뉴 트리 클릭
    const onClickMenuTree = (e) => {
        let chkMenu = 0;

        if (e.length > 0) {
            let data = e[0].data;
            setSelectMenu(data);

            if (data.menuType === "MENU") {
                chkMenu++;

                setMenuEnabled({
                    resetBtn : false,
                    saveBtn : true,
                    updateBtn : false,
                    deleteBtn : false,
                    selectUpper : false,
                });
            }
        }

        if (chkMenu === 0) {
            // 프로그램 선택 시
            let enableBtn = {
                resetBtn : false,
                saveBtn : true,
                updateBtn : true,
                deleteBtn : true,
                selectUpper : true,
            }

            // 초기화 버튼 눌렀을 때도 이 함수를 타서 선택된 행 없을 시 등록 버튼 활성화
            e.length === 0 ? (enableBtn.saveBtn = false, enableBtn.selectUpper = false) : "";
            
            setMenuEnabled(enableBtn);
        }
    }

    // 메뉴 목록 트리 순서 수정을 위한 가공
    const makeForPostMenuOrder = () => {
        let newMenuTree = menuTree.map((item) => ({...item}));
        let menuArr = makeTreeToList(newMenuTree, "");
        postMenuOrder(menuArr);
    }

    // 트리의 배열화
    const makeTreeToList = (data, parentMenuId) => {
        let treeToArr = [];

        // 자식 제거 + 하나의 배열로 합치기
        for (const item of data) {
            const newItem = { 
                ...item, 
                menuId: item.id, 
                parentMenuId: parentMenuId 
            };
            delete newItem.children;
    
            treeToArr.push(newItem);
    
            if (item.children && item.children.length > 0) {
                treeToArr = treeToArr.concat(makeTreeToList(item.children, newItem.menuId));
            }
        }
    
        return treeToArr;
    }

    // menu state 연결된 input 값 변경
    const onChangeMenu = (e) => {
        let nm = e.target.name;
        let value = e.target.value;

        if (value === "defaultValue") {
            value = "";
        }

        setSelectMenu({
            ...selectMenu,
            [nm]:value
        });
    }

    // program state 연결된 input 값 변경
    const onChangeProgram = (e) => {
        let nm = e.target.name;
        let value = e.target.value;

        if (value === "defaultValue") {
            value = "";
        }

        setSelectProgram({
            ...selectProgram,
            [nm]:value
        });
    }

    // 메뉴에서 화면 제거
    const doDeleteProgramMenu = () => {
        let newMenuTreeCheck = [...menuTreeCheck];

        let msg = "";
        if (newMenuTreeCheck.length === 0) {
            msg = "삭제할 프로그램을 체크해주세요.";
        }

        for (const item of newMenuTreeCheck) {
            let menuType = item.menuType;

            if (menuType === "MENU") {
                msg = "현재 메뉴가 체크되어 있습니다. \n프로그램만 체크해주세요.";
            }
        }
        
        if (msg) {
            showPopMsg(msg, "a");
            return false
        } else {
            showPopMsg("프로그램을 메뉴에서 삭제하시겠습니까.", "c", function () {
                for (const item of newMenuTreeCheck) {
                    doDeleteMenuProgram(item.id, function() {
                        // 초기화
                        doResetMenu();
                        // 조회
                        getMenuListTree();
                    });
                }
            });
        }
    }

    // 메뉴에 화면 추가
    const doInsertProgramMenu = () => {
        let menuType = selectMenu.menuType;
        let menuId = selectMenu.id;
        let msg = "";
        
        let newProgramList = programList.filter((item) => {
            return item.selected
        });

        if (!menuId) {
            msg = "프로그램을 등록할 메뉴를 선택해주세요.";
        } else if (menuType !== "MENU") {
            msg = "현재 프로그램이 선택되어 있습니다. \n메뉴를 선택해주세요.";
        } else if (newProgramList.length === 0) {
            msg = "등록할 프로그램을 체크해주세요."
        }
        
        if (msg) {
            showPopMsg(msg, "a");
            return false
        } else {
            let idx = 1;

            showPopMsg("프로그램을 메뉴에 등록하시겠습니까.", "c", function () {
                for (const item of newProgramList) {
                    let params = {
                        id:'',
                        menuCode: null,
                        menuMapping: item.programMapping,
                        menuName: item.programName,
                        menuStatus: item.menuStatus,
                        menuType: 'PROGRAM',
                        parentMenuId: menuId,
                        programId: item.programId,
                        sortSeq: idx,
                        status: item.status
                    }

                    idx++;
                    doSaveMenuProgram(params, function() {
                        // 조회
                        getMenuListTree();
                    });
                }
            });
        }
    }
 
    // 화면 그리드 행클릭
    const programGridRowClick = (e) => {
        let programId = e.data.programId;
        getProgramDetail(programId);
        setProgramEnabled({
            resetBtn : false,
            saveBtn : true,
            updateBtn : false,
            deleteBtn : false,
        })
    }

    // 화면경로 추가
    const addProgramMapping = () => {
        getProgramDisableListData();
        setOpenProgramMappingDialog(true);
    }

    // 화면경로 팝업 닫기
    const closeProgramMappingDialog = () => {
        setDialogSearchKeyword("");
        setOpenProgramMappingDialog(false);
    }

    // 화면경로 팝업 그리드 행 클릭
    const programDisableGridRowClick = (e) => {
        let data = e.data;
        data.forDelete = "X";
        let programId = data.programId;

        // 중복값 제외하며 추가
        // 그리드
        let newSelectProgramDisable = [...selectProgramDisable];

        let chk = 0;
        if (newSelectProgramDisable.length > 0) {
            for (const item of newSelectProgramDisable) {
                item.programId === programId ? chk++ : "";
            }

            if (chk === 0) {
                // 그리드용
                newSelectProgramDisable.push(data);
                setSelectProgramDisable(newSelectProgramDisable);
            }
        } else {
            // 그리드용
            newSelectProgramDisable.push(data);
            setSelectProgramDisable(newSelectProgramDisable);
        }

        chk === 0 ? closeProgramMappingDialog() : showPopMsg("이미 등록된 경로입니다.", "a");
    }

    // 화면경로 그리드 셀 클릭
    const programDisableGridCellClick = (e) => {
        let col = e.colDef.field;
        let rowIndex = e.rowIndex;

        // 제거 클릭
        if (col === "forDelete") {
            let newSelectProgramDisable = [...selectProgramDisable];

            showPopMsg("삭제하시겠습니까.", "c", function() {
                newSelectProgramDisable.splice(rowIndex, 1);
                setSelectProgramDisable(newSelectProgramDisable);
            })
        }
    }

    // 필수값 체크
    const checkRequired = (refNm) => {
        let frm = refNm.current;
        let chkRequiredNoValue = 0;
        for (const divItem of frm.children) {
            for (const item of Array.from(divItem.querySelectorAll('*')).reverse()) {
                if (item.tagName === 'INPUT' || item.tagName === 'SELECT' || item.tagName === 'TEXTAREA' || item.tagName === 'CHECKBOX') {
                    if (item.required && !item.value) {
                        item.focus();
                        chkRequiredNoValue++;
                    }
                }
    
                if (item.tagName === 'LABEL' && chkRequiredNoValue > 0) {
                    let msg = item.innerText.replace(" *", "") + ' 은(는) 필수입력 항목입니다.';
                    showPopMsg(msg, 'a');
                    return false;
                }
            }
        }

        return true
    };

    // 화면 저장, 수정 전 체크
    const validateProgram = () => {
        let returnData = {...selectProgram};

        // 필수값 체크
        if (!checkRequired(programRef)) {
            return false
        }

        // 화면관련경로 담아주기
        if (selectProgramDisable.length > 0) {
            returnData.relProgramIdList = selectProgramDisable.map((item) => {
                return item.programId
            });
        } else {
            returnData.relProgramIdList = [];
        }

        return returnData;
    }

    // 메시지 팝업
    // msg - 띄워줄 문자열
    // type - a : alert, c : confirm
    // fnc - 콜백함수
    const showPopMsg = async(msg, type, fnc) => {
        if (type === 'c') {
            const result = await winiMsg.showConfirm(msg);
            if (result === 'Y') {
                if (fnc) {
                    fnc()
                }
            }
        }
        if (type === 'a') {
            const result = await winiMsg.showAlert(msg);
            if (fnc) {
                fnc()
            }
        }
    };

    // 트리아이템 체크박스 클릭
    const toggleNodeCheck = (id, isChecked, data) => {
        // 해당 아이디 찾기
        const findId = (id, children) => {
            let menuObj = {};
            for (const item of children) {
                if (id === item.id) {
                    if (item.chk) {
                        item.chk = false;
                    } else {
                        item.chk = true;
                    }

                    menuObj = item
                } else {
                    if (item.children) {
                        menuObj = findId(id, item.children);
                    }
                }
            }

            return menuObj
        }

        // 중복 제거하여 담아두기
        const findDupleId = (id) => {
            let newMenuTreeCheck = [...menuTreeCheck];

            let newFindId = findId(id, menuTree);
            let chk = 0;
            for (let i = newMenuTreeCheck.length - 1; i >= 0; i--) {
                if (newMenuTreeCheck[i].id === newFindId.id && !newFindId.chk) {
                    newMenuTreeCheck.splice(i, 1);
                    chk++;
                }
            }

            if (chk === 0) {
                newMenuTreeCheck.push(newFindId);
            }

            setMenuTreeCheck(newMenuTreeCheck);
        }

        findDupleId(id);
    }

    // 트리아이템 체크박스
    const TreeItemCheck = (props)=>{
        const { node, style, dragHandle ,ChangeCheck,toggleCheck} = props;
        const [chk,setCheck] = useState(false);
        return(
            <>
                <WiniBox style={style} ref={dragHandle} onClick={() => node.toggle()}sx={{height:26,background: selectMenu.id==node.id?'#eaeaea':'transparent'}} >
                    {/* {node.isLeaf ? "🍁" : "🗀"} */}
                    <WiniBox style={{display:'flex', direction:'row',height:26}}>
                        
                        <WiniBox style={{width:22}}>
                            {!node.isLeaf ? node.isOpen ? <ArrowDropDownIcon/> : <ArrowRightIcon/>:"　"}
                        </WiniBox>
                        <input type='checkbox' checked={node.data.chk}  onChange={(e) => {
                            toggleCheck(node.id,e.target.checked,node.data)}
                            }/>
                        {/*node.isLeaf || */node.data.menuType == "PROGRAM" ? <DescriptionIcon fontSize="medium" sx={{color:'gray'}}/> : <FolderIcon fontSize="medium" sx={{color:'#f1d81f'}} />}
                        <WiniTypography sx={{paddingLeft:1}}> {node.data.name}</WiniTypography>
                    </WiniBox>
                    
                </WiniBox>
            </>
        )

    }

    useEffect(() => {
        getMenuListTree();
        getprogramListData();
    }, [])

    return (
        <>
            <WiniFormCommon  title={props.title} path={props.bread}>
                <WiniSnackbar
                    anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                    open={barOpen}
                    autoHideDuration={2500}
                    onClose={handleBarClose}
                    message={barReason}
                />

                <WiniBox>
                    <WiniGridLayout container>

                        <WiniGridLayout size={{ lg: 5, md: 5, xs: 12 }} sx={{ minHeight:510, borderStyle:'none', padding:1, mb:1 }}>

                                <WiniGridLayout container>
                                    <WiniGridLayout size={{ lg: 12, md: 12, xs: 12 }} sx={{ borderStyle: 'none' }}>
                                        <WiniTypography variant='h6' fontWeight={'bold'}>메뉴목록</WiniTypography>
                                    </WiniGridLayout>
                                    <WiniGridLayout size={{ lg: 12, md: 12, xs: 12 }} sx={{ borderStyle: 'none' }}>

                                        <WiniBox
                                            sx={{ marginLeft: 1, marginRight: 1 }}
                                            gap={ 1 }
                                            type={'searchBar'}
                                            noValidate
                                        >

                                            <WiniGridLayout size={{ lg: 8, md: 8, xs: 12 }} sx={{ borderStyle: 'none' }}>
                                                <WiniSelect
                                                    label="메뉴목록"
                                                    name="systemCode"
                                                    sx={{ width:"100%" }}
                                                    defaultValue={"defaultValue"}
                                                    value={selectMenuOption}
                                                    onChange={(e) => setSelectMenuOption(e.target.value)}
                                                    >
                                                    <WiniMenuItem value={'defaultValue'}>{"전체"}</WiniMenuItem>
                                                    {menuSelectOption.map((item) => (
                                                        <WiniMenuItem value={item.id}>{item.name}</WiniMenuItem>
                                                    ))}
                                                </WiniSelect>
                                            </WiniGridLayout>

                                            <WiniGridLayout size={{ lg: 2, md: 2, xs: 12 }} sx={{ borderStyle: 'none' }}>
                                                { winiCom.checkMenuAut('select',<WiniButton variant='contained' onClick={getMenuListTree} >검색</WiniButton>)}
                                            </WiniGridLayout>
                                            
                                            <WiniGridLayout size={{ lg: 2, md: 2, xs: 12 }} sx={{ borderStyle: 'none' }}>
                                                { winiCom.checkMenuAut('update',<WiniButton variant='contained' onClick={makeForPostMenuOrder} >순서수정</WiniButton>)}
                                            </WiniGridLayout>

                                        </WiniBox>

                                    </WiniGridLayout>

                                    <WiniGridLayout size={{ lg: 12, md: 12, xs: 12 }} sx={{ borderStyle: 'none', padding: 1, minHeight:"450px" }}>
                                        <WiniTreeView
                                            ref={menuTreeRef}
                                            winiData ={menuTree}
                                            height={450}
                                            width={'100%'}
                                            disableDrag={false}
                                            onSelect={onClickMenuTree}
                                            onChange={(state) => {setMenuTree(state)}}
                                        >
                                            {/* {WiniTreeItem} */}
                                            {(props) => (
                                                <TreeItemCheck {...props} toggleCheck={toggleNodeCheck} />
                                            )}
                                        </WiniTreeView>
                                    </WiniGridLayout>
                                </WiniGridLayout>

                                <WiniGridLayout container ref={ menuRef }>

                                    <WiniGridLayout size={{ lg: 12, md: 12, xs: 12 }} sx={{ borderStyle: 'none', mb:2 }}>
                                        <WiniText id="outlined-basic" label="메뉴코드" variant="outlined"
                                            sx={{ width: '100%'}}
                                            required
                                            InputLabelProps={{ shrink: true }}
                                            value={selectMenu.menuCode ? selectMenu.menuCode : ""}
                                            onChange={onChangeMenu}
                                            name='menuCode'
                                        />
                                    </WiniGridLayout>

                                    <WiniGridLayout size={{ lg: 12, md: 12, xs: 12 }} sx={{ borderStyle: 'none', mb:2 }}>
                                        <WiniText id="outlined-basic" label="메뉴명" variant="outlined"
                                            sx={{ width: '100%'}}
                                            required
                                            InputLabelProps={{ shrink: true }}
                                            value={selectMenu.name ? selectMenu.name : ""}
                                            onChange={onChangeMenu}
                                            name='name'
                                        />
                                    </WiniGridLayout>

                                    <WiniGridLayout size={{ lg: 12, md: 12, xs: 12 }} sx={{ borderStyle: 'none', mb:2 }}>
                                        <WiniSelect
                                            label="상위메뉴ID"
                                            name="parentMenuId"
                                            disabled={menuEnabled.selectUpper}
                                            sx={{ width:"100%" }}
                                            value={selectMenu.parentMenuId ? selectMenu.parentMenuId : ""}
                                            onChange={onChangeMenu}
                                            >
                                            {upperMenuSelectOption.map((item) => (
                                                <WiniMenuItem value={item.id}>{item.name}</WiniMenuItem>
                                            ))}
                                        </WiniSelect>
                                    </WiniGridLayout>

                                    <WiniGridLayout size={{ lg: 12, md: 12, xs: 12 }} sx={{ borderStyle: 'none', mb:2 }}>
                                        <WiniText id="outlined-basic" label="메뉴경로" variant="outlined"
                                            sx={{ width: '100%'}}
                                            disabled={true}
                                            InputLabelProps={{ shrink: true }}
                                            value={selectMenu.menuMapping ? selectMenu.menuMapping : ""}
                                            onChange={onChangeMenu}
                                            name='menuMapping'
                                        />
                                    </WiniGridLayout>

                                    <WiniGridLayout size={{ lg: 12, md: 12, xs: 12 }} sx={{ borderStyle: 'none', mb:2 }}>
                                        <WiniNumber id="outlined-basic" label="정렬순서" variant="outlined"
                                            sx={{ width: '100%'}}
                                            InputLabelProps={{ shrink: true }}
                                            value={selectMenu.sortSeq ? selectMenu.sortSeq : ""}
                                            onChange={onChangeMenu}
                                            name='sortSeq'
                                        />
                                    </WiniGridLayout>

                                    <WiniGridLayout size={{ lg: 12, md: 12, xs: 12 }} sx={{ borderStyle: 'none', mb:2 }}>
                                        <WiniCheckbox
                                            size="small"
                                            checked={ selectMenu.status === "ENABLE" }
                                            onClick={(e) => { e.target.checked ? setSelectMenu({...selectMenu, status : "ENABLE" }) : setSelectMenu({...selectMenu, status : "DISABLE" }) }}
                                            name='status'
                                            label={"사용여부"}
                                        />
                                    </WiniGridLayout>

                                </WiniGridLayout>

                                <WiniGridLayout container>
                                    <WiniGridLayout size={{ lg: 12, md: 12, xs: 12 }} sx={{ borderStyle: 'none', mb:2 }}>
                                        <WiniBox sx={{ display:'flex', justifyContent:'flex-end', mb: 1, mr: 1 }}>
                                            { winiCom.checkMenuAut('insert',<WiniButton variant='outlined' sx={{minWidth: 10, ml: 1}} onClick={doResetMenu} disabled={menuEnabled.resetBtn} >초기화</WiniButton>)}
                                            { winiCom.checkMenuAut('insert',<WiniButton variant='contained' sx={{minWidth: 10, ml: 1}} startIcon={<SaveIcon/>} onClick={doSaveMenu} disabled={menuEnabled.saveBtn} >등록</WiniButton>)}
                                            { winiCom.checkMenuAut('update',<WiniButton variant='contained' color={"success"} sx={{minWidth: 10, ml: 1}} startIcon={<LoopIcon/>} onClick={doUpdateMenu} disabled={menuEnabled.updateBtn} >수정</WiniButton>)}
                                            { winiCom.checkMenuAut('delete',<WiniButton variant='contained' color={"error"} sx={{minWidth: 10, ml: 1}} startIcon={<DeleteIcon/>} onClick={doDeleteMenu} disabled={menuEnabled.deleteBtn} >삭제</WiniButton>)}
                                        </WiniBox>
                                    </WiniGridLayout>
                                </WiniGridLayout>
                        </WiniGridLayout>

                        <WiniGridLayout size={{ lg: 2, md: 2, xs: 12 }} sx={{ borderStyle:'none', padding:1, mb:1, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center' }}>
                            { winiCom.checkMenuAut(['insert','update','delete'],<WiniButton variant='contained' sx={{ mb: 2 }} onClick={doDeleteProgramMenu} disabled={menuEnabled.resetBtn} >{'>'}</WiniButton>)}
                            { winiCom.checkMenuAut(['insert','update','delete'],<WiniButton variant='contained' onClick={doInsertProgramMenu} disabled={menuEnabled.resetBtn} >{'<'}</WiniButton>)}
                        </WiniGridLayout>

                        <WiniGridLayout size={{ lg: 5, md: 5, xs: 12 }} sx={{ minHeight:510, borderStyle:'none'}}>

                            <WiniGridLayout container>
                                
                                <WiniGridLayout size={{ lg: 12, md: 12, xs: 12 }} sx={{ borderStyle: 'none' }}>
                                    <WiniTypography variant='h6' fontWeight={'bold'}>화면목록</WiniTypography>
                                </WiniGridLayout>
                                
                                <WiniGridLayout size={{ lg: 12, md: 12, xs: 12 }} sx={{ borderStyle: 'none', mb: 1 }}>

                                    <WiniBox
                                        sx={{ marginLeft: 1, marginRight: 1 }}
                                        gap={ 1 }
                                        type={'searchBar'}
                                        noValidate
                                    >

                                        <WiniGridLayout size={{ lg: 8, md: 8, xs: 12 }} sx={{ borderStyle: 'none' }}>
                                            <WiniText id="outlined-basic" variant="outlined"
                                                sx={{ width: '100%'}}
                                                InputLabelProps={{ shrink: true }}
                                                value={programSearchKeyword}
                                                onChange={(e) => {setProgramSearchKeyword(e.target.value)}}
                                                onKeyUp={(e) => { e.key === "Enter" ? getprogramListData() : ""}}
                                                name='searchKeyword'
                                            />
                                        </WiniGridLayout>

                                        <WiniGridLayout size={{ lg: 4, md: 4, xs: 12 }} sx={{ borderStyle: 'none' }}>
                                            { winiCom.checkMenuAut('select',<WiniButton variant='contained' onClick={getprogramListData} >검색</WiniButton>)}
                                        </WiniGridLayout>
                                        
                                    </WiniBox>
                                    
                                </WiniGridLayout>

                                <WiniGridLayout size={{ lg: 12, md: 12, xs: 12 }} sx={{ borderStyle: 'none', mb:2, minHeight:"410px" }}>
                                    <WiniAgGridReact
                                        // rowStyle={{ lineHeight: 20}}
                                        ref={programGridRef}
                                        rowData={programList}
                                        onRowClicked={programGridRowClick}
                                        columnDefs={[
                                                { field: "selected", headerName:"선택", flex: 1, 
                                                    cellRenderer: 'agCheckboxCellRenderer', 
                                                    cellEditor: 'agCheckboxCellEditor', 
                                                    editable:true, //에디터랑 세트
                                                    valueGetter: (params) => params.data.selected,
                                                    valueSetter: (params) => { 
                                                        let rowIndex = params.node.rowIndex;
                                                        let newProgramList = [...programList];
                                                        let newProgramListRow = {...newProgramList[rowIndex]};
                                                        
                                                        // 체크 시 값 true/false -> Y/N 으로 변경
                                                        newProgramListRow.selected = params.newValue;
                                                        newProgramList[rowIndex] = newProgramListRow;
                                                        
                                                        setProgramList(newProgramList);
                                                        return true
                                                    },
                                                }, 
                                                { field: "no", headerName:"No", flex: 1, cellStyle: {textAlign:"center"}, }, 
                                                { field: "programCode", headerName:"화면코드", flex: 3, cellStyle: {textAlign:"center"} },
                                                { field: "programName", headerName:"화면명", flex: 3, cellStyle: {textAlign:"center"} },
                                                { field: "status", headerName:"사용여부", flex: 1, cellStyle: {textAlign:"center"}, valueGetter: (params) => params.data.status === "ENABLE" ? "Y" : "N" },
                                            ]
                                        }
                                        pagination={true}
                                        paginationPageSize={10}
                                        paginationPageSizeSelector={[10,20]}
                                    />
                                </WiniGridLayout>
                            </WiniGridLayout>
                            
                            <WiniGridLayout container ref={programRef}>

                                <WiniGridLayout size={{ lg: 6, md: 6, xs: 12 }} sx={{ borderStyle: 'none', mb:2 }}>
                                    <WiniText id="outlined-basic" label="화면코드" variant="outlined"
                                        sx={{ width: '100%'}}
                                        InputLabelProps={{ shrink: true }}
                                        value={selectProgram.programCode}
                                        required
                                        onChange={onChangeProgram}
                                        name='programCode'
                                        />
                                </WiniGridLayout>

                                <WiniGridLayout size={{ lg: 6, md: 6, xs: 12 }} sx={{ borderStyle: 'none', mb:2 }}>
                                    <WiniText id="outlined-basic" label="화면명" variant="outlined"
                                        sx={{ width: '100%'}}
                                        InputLabelProps={{ shrink: true }}
                                        value={selectProgram.programName}
                                        onChange={onChangeProgram}
                                        name='programName'
                                        />
                                </WiniGridLayout>
                                
                                <WiniGridLayout size={{ lg: 6, md: 6, xs: 12 }} sx={{ borderStyle: 'none', mb:2 }}>
                                    <WiniText id="outlined-basic" label="화면경로" variant="outlined"
                                        sx={{ width: '100%'}}
                                        required
                                        InputLabelProps={{ shrink: true }}
                                        value={selectProgram.programMapping}
                                        onChange={onChangeProgram}
                                        name='programMapping'
                                        />
                                </WiniGridLayout>

                                <WiniGridLayout size={{ lg: 6, md: 6, xs: 12 }} sx={{ borderStyle: 'none', mb:2 }}>
                                    <WiniCheckbox
                                        size="small"
                                        checked={ selectProgram.programMappingStatus !== "DEFAULT" }
                                        onClick={(e) => { e.target.checked ? setSelectProgram({...selectProgram, programMappingStatus : "IDONTKNOW" }) : setSelectProgram({...selectProgram, programMappingStatus : "DEFAULT" }) }}
                                        name='programMappingStatus'
                                        label={"화면경로 고정여부"}
                                        />
                                </WiniGridLayout>
                            
                                <WiniGridLayout size={{ lg: 12, md: 12, xs: 12 }} sx={{ borderStyle: 'none', mb:2 }}>
                                    <WiniText id="outlined-basic" label="비고" variant="outlined"
                                        sx={{ width: '100%'}}
                                        InputLabelProps={{ shrink: true }}
                                        value={selectProgram.remark}
                                        onChange={onChangeProgram}
                                        name='remark'
                                        />
                                </WiniGridLayout>

                                <WiniGridLayout size={{ lg: 6, md: 6, xs: 12 }} sx={{ borderStyle: 'none', mb:2 }}>
                                    <WiniCheckbox
                                        size="small"
                                        checked={ selectProgram.menuStatus === "ENABLE" }
                                        onClick={(e) => { e.target.checked ? setSelectProgram({...selectProgram, menuStatus : "ENABLE" }) : setSelectProgram({...selectProgram, menuStatus : "DISABLE" }) }}
                                        name='menuStatus'
                                        label={"메뉴여부"}
                                        />
                                </WiniGridLayout>

                                <WiniGridLayout size={{ lg: 6, md: 6, xs: 12 }} sx={{ borderStyle: 'none', mb:2 }}>
                                    <WiniCheckbox
                                        size="small"
                                        checked={ selectProgram.status === "ENABLE" }
                                        onClick={(e) => { e.target.checked ? setSelectProgram({...selectProgram, status : "ENABLE" }) : setSelectProgram({...selectProgram, status : "DISABLE" }) }}
                                        name='status'
                                        label={"사용여부"}
                                        />
                                </WiniGridLayout>
                                
                            </WiniGridLayout>

                            <WiniGridLayout container>
                                <WiniGridLayout size={{ lg: 12, md: 12, xs: 12 }} sx={{ borderStyle: 'none', mb:2 }}>
                                    화면관련경로 { winiCom.checkMenuAut(['insert','update'],<WiniButton variant='outlined' sx={{minWidth: 10, ml: 1}} onClick={addProgramMapping}>추가</WiniButton>)}
                                </WiniGridLayout>

                                <WiniGridLayout size={{ lg: 12, md: 12, xs: 12 }} sx={{ borderStyle: 'none', mb:2, minHeight:"120px" }}>
                                    <WiniAgGridReact
                                        rowData={selectProgramDisable}
                                        onCellClicked={programDisableGridCellClick}
                                        headerHeight={0}
                                        suppressNoRowsOverlay={true}
                                        columnDefs={[
                                            { field: "programName", headerName:"화면명", flex: 10, cellStyle: {textAlign:"center"}},
                                            { field: "forDelete", headerName:"삭제", flex: 2, cellStyle: {textAlign:"center"}},
                                        ]
                                    }
                                    />
                                </WiniGridLayout>
                            </WiniGridLayout>

                            <WiniGridLayout container>
                                <WiniGridLayout size={{ lg: 12, md: 12, xs: 12 }} sx={{ borderStyle: 'none', mb:2 }}>
                                    <WiniBox sx={{ display:'flex', justifyContent:'flex-end', mb: 1, mr: 1 }}>
                                        { winiCom.checkMenuAut('insert',<WiniButton variant='outlined' sx={{minWidth: 10, ml: 1}} onClick={doResetProgram} disabled={programEnabled.resetBtn} >초기화</WiniButton>)}
                                        { winiCom.checkMenuAut('insert',<WiniButton variant='contained' sx={{minWidth: 10, ml: 1}} startIcon={<SaveIcon/>} onClick={doSaveProgram} disabled={programEnabled.saveBtn} >등록</WiniButton>)}
                                        { winiCom.checkMenuAut('update',<WiniButton variant='contained' color={"success"} sx={{minWidth: 10, ml: 1}} startIcon={<LoopIcon/>} onClick={doPatchProgram} disabled={programEnabled.updateBtn} >수정</WiniButton>)}
                                        { winiCom.checkMenuAut('delete',<WiniButton variant='contained' color={"error"} sx={{minWidth: 10, ml: 1}} startIcon={<DeleteIcon/>} onClick={doDeleteProgram} disabled={programEnabled.deleteBtn} >삭제</WiniButton>)}
                                    </WiniBox>
                                </WiniGridLayout>
                            </WiniGridLayout>
                        </WiniGridLayout>

                    </WiniGridLayout>
                </WiniBox>

                <WiniDialog 
                    open={openProgramMappingDialog}
                    onClose={closeProgramMappingDialog}
                    fullWidth={true}
                    maxWidth={"lg"}
                >
                    <WiniDialogTitle>화면관련경로</WiniDialogTitle>
                    
                    <WiniDialogContent>
                        <WiniBox sx={{ mb : 1 }}>
                            <WiniText
                                id="outlined-basic" label="화면명" variant="outlined"
                                required
                                InputLabelProps={{ shrink: true }}
                                value={dialogSearchKeyword}
                                onChange={(e) => {setDialogSearchKeyword(e.target.value)}}
                                name='searchKeyword'
                                />
                            { winiCom.checkMenuAut('select',<WiniButton variant='outlined' sx={{minWidth: 50, ml: 1}} onClick={getProgramDisableListData} >검색</WiniButton>)}
                        </WiniBox>
                        <WiniBox sx={{ height:"300px"}}>
                            <WiniAgGridReact
                                rowData={programDisableList}
                                onRowClicked={programDisableGridRowClick}
                                columnDefs={[
                                    { field: "programCode", headerName:"화면코드", flex: 1, cellStyle: {textAlign:"center"}},
                                    { field: "programName", headerName:"화면명", flex: 1, cellStyle: {textAlign:"center"}},
                                    { field: "programMapping", headerName:"화면경로", flex: 1, cellStyle: {textAlign:"center"}},
                                    ]}
                                pagination={true}
                                paginationPageSize={10}
                                paginationPageSizeSelector={[10,20]}
                            />
                        </WiniBox>
                    </WiniDialogContent>

                    <WiniDialogActions>
                        <WiniButton variant='contained' onClick={closeProgramMappingDialog}>닫기</WiniButton>
                    </WiniDialogActions>
                
                </WiniDialog>
            </WiniFormCommon>
        </>
    )
}