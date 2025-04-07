import { Link } from 'react-router-dom';
import '@css/Menu.css';
import MenuData from '@data/menu.json';

function Menu({ getMenuNm }) {
    const clickMenu = (e, title) => {
        let newMenuNm = title;
        getMenuNm(newMenuNm);
    };

    return (
        <div className="navbar">
            <div className="navbarMenuForm">
                {MenuData.map((menu, index) => (
                    <div className="navbarMenuWrapper" key={index}>
                        {menu.path ? (
                            <Link to={menu.path} className="navbarMenu" onClick={(e) => clickMenu(e, menu.title)}>
                                {menu.showTitle}
                            </Link>
                        ) : (
                            <div className="navbarMenu">
                                {menu.showTitle}
                            </div>
                        )}
                        {menu.subMenu && (
                            <div className="subMenu">
                                {menu.subMenu.map((sub, subIndex) => (
                                    <Link
                                        to={sub.path}
                                        className="subMenuItem"
                                        key={subIndex}
                                        onClick={(e) => clickMenu(e, sub.title)}
                                    >
                                        {sub.showTitle}
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
