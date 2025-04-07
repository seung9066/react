import { Link } from 'react-router-dom';
import '@css/Menu.css';

function Menu({ getMenuNm }) {
    const clickMenu = (e) => {
        let newMenuNm = e.target.innerText;
        getMenuNm(newMenuNm);
    };

    const menuItems = [
        {
            title: "React",
            path: "/",
        },
        {
            title: "Study",
            path: "/study",
        },
        {
            title: "Play",
            subMenu: [
                { title: "TicTacToe", path: "/ticTacToe" },
            ],
        },
        {
            title: "Program",
            subMenu: [
                { title: "UrlDataNotice", path: "/urlDataNotice" },
                { title: "ProgramDesign", path: "/programDesign" },
                { title: "Lotto", path: "/lotto" },
            ],
        },
    ];

    return (
        <div className="navbar">
            <div className="navbarMenuForm">
                {menuItems.map((menu, index) => (
                    <div className="navbarMenuWrapper" key={index}>
                        {menu.path ? (
                            <Link to={menu.path} className="navbarMenu" onClick={clickMenu}>
                                {menu.title}
                            </Link>
                        ) : (
                            <div className="navbarMenu">
                                {menu.title}
                            </div>
                        )}
                        {menu.subMenu && (
                            <div className="subMenu">
                                {menu.subMenu.map((sub, subIndex) => (
                                    <Link
                                        to={sub.path}
                                        className="subMenuItem"
                                        key={subIndex}
                                        onClick={clickMenu}
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
