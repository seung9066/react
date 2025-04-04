import { Link } from 'react-router-dom'

import '@css/Menu.css'

function Menu({ getMenuNm }) {
    const clickMenu = (e) => {
        let newMenuNm = e.target.innerText;
        getMenuNm(newMenuNm);
    };
    
    return (
        <>
            <div className="navbar">
                <div className="navbarMenuForm">
                    <Link to={'/'} className="navbarMenu" onClick={clickMenu}>React</Link>
                    <Link to={'/study'} className="navbarMenu" onClick={clickMenu}>Study</Link>
                    <Link to={'/ticTacToe'} className="navbarMenu" onClick={clickMenu}>TicTacToe</Link>
                    <Link to={'/urlDataNotice'} className="navbarMenu" onClick={clickMenu}>UrlDataNotice</Link>
                    <Link to={'/programDesign'} className="navbarMenu" onClick={clickMenu}>ProgramDesign</Link>
                    <Link to={'/lotto'} className="navbarMenu" onClick={clickMenu}>Lotto</Link>
                </div>
            </div>
        </>
    )
}

export default Menu;