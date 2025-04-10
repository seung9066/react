import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react'
import '@css/Menu.css';

function Menu({ getMenuNm, menuData }) {
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
    

    return (
        <div className="navbar">
            <div className="navbarMenuForm">
                {menuData && menuData.map((menu, index) => (
                    <div className="navbarMenuWrapper" key={index}>
                        {(
                            menu.children.length > 0 ? (
                            <Link to={menu.path + menu.children[0].path} className="navbarMenu" onClick={(e) => clickMenu(e, menu.children[0].path)} key={menu.id}>
                                {menu.title}
                            </Link> ) : (
                            <Link to={menu.path} className="navbarMenu" onClick={(e) => clickMenu(e, menu.path)} key={menu.id}>
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
    );
}

export default Menu;
