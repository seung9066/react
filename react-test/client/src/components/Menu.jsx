import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react'
import '@css/Menu.css';

import Modal from '@components/Modal';
import AdminPage from '@components/AdminPage';

const modules = import.meta.glob('/src/menuPage/*.jsx');
const modules2 = import.meta.glob('/src/menuPage/*/*.jsx');

function Menu({ getMenuNm, menuData, setMenuData, sessionUserAuth, setSessionUserAuth, props }) {
    const [title, setTitle] = useState();

    const clickMenu = (e, path) => {
        let newMenuData = structuredClone(menuData);
        setTitle(findTitle(newMenuData, path));
    };

    useEffect(() => {
        let newMenuData = structuredClone(menuData);
        if (title) {
            getMenuNm(title);
        } else {
            let url = new URL(window.parent.location.href);
            let path = url.pathname;
            getMenuNm(findTitle(newMenuData, path));
        }
    }, [title])

    // 메뉴 경로로 메뉴명 찾기
    const findTitle = (data, path) => {
        if (Array.isArray(data)) {
            for (const item of data) {
                let itemPath = item.path;
                if (itemPath === path.substring(path.indexOf('/', 1))) {
                    return item.title;
                }
                if (item.children) {
                    const getTitle = findTitle(item.children, path);
                    if (getTitle) {
                        return getTitle;
                    }
                }
            }
        } else {
            let dataPath = data.path;
            if (dataPath === path.substring(path.indexOf('/', 1))) {
                return data.title;
            }
            if (data.children) {
                return findTitle(data.children, path);
            }
        }
        return '';
    };
    
    // 우클릭
    const handleContextMenu = (e) => {
        let url = new URL(e.target.href);
        let path = url.pathname;
        setFilePath(components.filter((item) => {
            let itemPath = item.path;
            itemPath = itemPath.replace('/src/menuPage', '');
            itemPath = itemPath.replace('.jsx', '');
            let newPath = '';
            for (let i = 0; i < itemPath.length; i++) {
                if (i !== 0 && itemPath[i - 1] === '/') {
                    newPath += itemPath[i].toLowerCase();
                } else {
                    newPath += itemPath[i];
                }
            }
            return newPath === path;
        })[0].path);

        setIsViewModalOpen(true);
        e.preventDefault();
    };

    // 컴포넌트 목록
    const [components, setComponents] = useState([]);
    // iframe 모달
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [filePath, setFilePath] = useState('');

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

    return (
        <>
            <Modal isOpen={isViewModalOpen} onClose={() => setIsViewModalOpen(false)} title={filePath.replace('/src/menuPage', '')}>
                {components.map((item, idx) => {
                    // pathName === "main" ? pathName = "" : null;
                    let root = './menuPage';
                    let path = item.path;
                    let pagePath = path?.substring(root.length).replace('.jsx', '')??'';
                    let nextPagePath = (idx !== components.length - 1) ? components[idx + 1].path.substring(root.length).replace('.jsx', '') : '';

                    pagePath === '' ? pagePath = nextPagePath : null;

                    // 메뉴 권한 체크
                    let pageAuth = '000';

                    for (const item of menuData) {
                        if (item.menuAuth) {
                            const menuPath = (item.upPath || '') + item.path.toLowerCase() + (item.upPath ? '' : '/');
                            const programPath = pagePath.toLowerCase();

                            if (programPath.indexOf(menuPath) > -1) {
                            pageAuth = item.menuAuth;
                            }
                        }
                    }

                    if (path === filePath) {
                        const Component = item.component;
                        return <AdminPage key={item.path + 'adminPage'} auth={pageAuth} sessionUserAuth={sessionUserAuth} setSessionUserAuth={setSessionUserAuth}><Component key={item.path + 'modal'} props={props} setMenu={setMenuData} /></AdminPage>;
                    }
                })}
            </Modal>

            <div className="navbar">
                <div className="navbarMenuForm">
                    {menuData && menuData.map((menu, index) => (
                        <div className="navbarMenuWrapper" key={index}>
                            {(
                                menu.children.length > 0 ? (
                                    <Link to={menu.path + menu.children[0].path} className="navbarMenu" onClick={(e) => clickMenu(e, menu.children[0].path)} onContextMenu={(e) => handleContextMenu(e)} key={menu.id}>
                                    {menu.title}
                                </Link> ) : (
                                    <Link to={menu.path} className="navbarMenu" onClick={(e) => clickMenu(e, menu.path)} onContextMenu={handleContextMenu} key={menu.id}>
                                    {menu.title}
                                </Link> 
                                )
                            )}
                            {menu.children.length > 0 && (
                                <div className="subMenu" key={menu.children.id}>
                                    {menu.children.map((sub, subIndex) => (
                                        <Link
                                        to={(menu.path + sub.path)}
                                        className="subMenuItem"
                                        key={subIndex}
                                        onClick={(e) => clickMenu(e, sub.path)}
                                        onContextMenu={handleContextMenu}
                                        >
                                            {sub.title}
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </>
    );
}

export default Menu;
