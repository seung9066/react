import { useState, useEffect } from 'react'

import SggTreeNode from '@components/SggTreeNode'

function Menu( props ) {
    const [menuData, setMenuData] = useState();
    const [selectedData, setSelectedData] = useState();

    useEffect(() => {
        getMenu();
    }, []);

    const selectedTree = (node) => {
        setSelectedData(node);
        console.log(node)
    }

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
            setMenuData(data);
        })
        .catch((err) => {
            props.props.toastRef.current.showToast("메뉴 데이터 로드 실패 ", err);
        });
    }

    return (
        <>
            <div>
                    { menuData && <SggTreeNode data={menuData} onSelect={selectedTree} /> }
            </div>
        </>
    );
}

export default Menu;
