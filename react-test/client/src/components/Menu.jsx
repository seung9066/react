import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react'
import '@css/Menu.css';

function Menu({ getMenuNm, menuData, setMenuData }) {
    const [title, setTitle] = useState();

    const clickMenu = (e, title) => {
        setTitle(title);
    };

    useEffect(() => {
        if (title) {
            getMenuNm(title)
        } else {
            let url = new URL(window.parent.location.href);
            let path = url.pathname.replace("/", "");
            path = path.charAt(0).toUpperCase() + path.slice(1);
            path ? getMenuNm(path) : null;
        }
    }, [title])

    useEffect(() => {
        getMenu();
    }, []);

    // server에서 메뉴 정보 가져오기
    const getMenu = () => {
        fetch('/api/menu/getMenu')
        .then((res) => {
            if (!res.ok) {
                throw new Error('서버 응답 오류');
            }
            return res.json();
        })
        .then((data) => {
            const transformDataToTree = (data) => {
                const map = new Map();
                const roots = [];
            
                // 평면 데이터를 Map에 넣고, children 배열을 초기화
                data.forEach((item) => {
                    map.set(item.id, { ...item, children: [] });
                });
            
                // 각 노드에 대해 upId를 기준으로 부모-자식 관계 설정
                data.forEach((item) => {
                    const currentNode = map.get(item.id);
                    if (item.upId === null) {
                        roots.push(currentNode); // upId가 null인 노드는 루트로 추가
                    } else {
                        const parent = map.get(item.upId);
                        if (parent) {
                            parent.children.push(currentNode); // 부모 노드에 자식 추가
                        }
                    }
                });
            
                return roots;
            };
            let newData = transformDataToTree(data);
            setMenuData(newData);
        })
        .catch((err) => {
            console.error('메뉴 데이터 로드 실패:', err);
        });
    }

    return (
        <div className="navbar">
            <div className="navbarMenuForm">
                {menuData && menuData.map((menu, index) => (
                    <div className="navbarMenuWrapper" key={index}>
                        {menu.path ? (
                            <Link to={menu.path} className="navbarMenu" onClick={(e) => clickMenu(e, menu.title)} key={menu.id}>
                                {menu.title}
                            </Link>
                        ) : (
                            menu.children.length > 0 ? (
                            <Link to={menu.children[0].path} className="navbarMenu" onClick={(e) => clickMenu(e, menu.children[0].title)} key={menu.id}>
                                {menu.title}
                            </Link> ) : (
                            <Link to={menu.title.charAt(0).toLowerCase() + menu.title.slice(1)} className="navbarMenu" onClick={(e) => clickMenu(e, menu.title)} key={menu.id}>
                                {menu.title}
                            </Link> 
                            )
                        )}
                        {menu.children.length > 0 && (
                            <div className="subMenu" key={menu.children.id}>
                                {menu.children.map((sub, subIndex) => (
                                    <Link
                                        to={sub.path}
                                        className="subMenuItem"
                                        key={subIndex}
                                        onClick={(e) => clickMenu(e, sub.title)}
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
