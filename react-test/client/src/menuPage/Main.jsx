import { useEffect, useState } from 'react'

import RunawayButton from '@components/RunawayButton'
import SggGridReact from '@components/SggGridReact'
import Modal from '@components/Modal';

const modules = import.meta.glob('/src/menuPage/*.jsx');
const modules2 = import.meta.glob('/src/menuPage/*/*.jsx');

function Main ( props ) {
    // 컴포넌트 목록
    const [components, setComponents] = useState([]);
    // 메뉴 목록
    const [gridData, setGridData] = useState([]);
    // iframe 모달
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [filePath, setFilePath] = useState({});

    useEffect(() => {
        // 컴포넌트 동적 로딩 함수
        const loadComponents = async () => {
            const totalModules = Object.assign({}, modules, modules2);
            // modules 객체의 각 파일을 import() 해서 default export만 추출
            const loaded = await Promise.all(
                Object.entries(totalModules).map(async ([path, importer]) => {
                    const mod = await importer();
                    return {
                        component : mod.default,
                        path
                    };
                })
            );
            // 추출한 컴포넌트 배열로 상태 설정
            setComponents(loaded);
        };

        loadComponents();
    }, []);

    useEffect(() => {
        // 컴포넌트 목록을 기반으로 메뉴 데이터 생성
        const menuData = components.map((item) => {
            let path = item.path;
            path = path.replace('.jsx', '');
            path = path.replace('/src/menuPage', '');
            return splitPath(item);
        });
        setGridData(menuData);
    }, [components])

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
        pathArr.totalPath = item.path;

        return pathArr;
    }

    // 그리드 행 클릭
    const gridTrClick = (e, item) => {
        // 선택 그리드 행 데이터
        setFilePath(item);
        
        // 모달 오픈
        setIsViewModalOpen(true);
    }

    return (
        <>
            <Modal isOpen={isViewModalOpen} onClose={() => setIsViewModalOpen(false)} title={'파일 화면'}>
                {components.map((item) => {
                    let path = item.path;
                    if (path === filePath.totalPath) {
                        const Component = item.component;
                        return <Component key={item.path} props={props.props} />;
                    }
                })}
            </Modal>
            
            <RunawayButton toastRef={props.props.toastRef} msg={'ㅋㅋ 오소이(느리다는 뜻)'} />

            <div>
                <SggGridReact 
                    columns={[{key:'upPath', name:'상위경로'}, {key:'path', name:'경로'}]}
                    data={{gridData:gridData}}
                    onClick={gridTrClick}
                    />
            </div>
        </>
    )
}

export default Main;