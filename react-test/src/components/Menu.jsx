import { useState } from "react";
import { Link } from 'react-router-dom'

import '../css/Menu.css'

function Menu({ getMenuNm }) {
    const clickMenu = (e) => {
        let newMenuNm = e.target.innerText;
        getMenuNm(newMenuNm);
    };
    
    return (
        <>
            <div className="navbar">
                <Link to={'/'} className="navbarMenu" onClick={clickMenu}>React</Link>
                <Link to={'/props'} className="navbarMenu" onClick={clickMenu}>Props</Link>
                <Link to={'/referenceDataType'} className="navbarMenu" onClick={clickMenu}>ReferenceDataType</Link>
                <Link to={'/lifeCycleHook'} className="navbarMenu" onClick={clickMenu}>LifeCycleHook</Link>
                <Link to={'/urlDataNotice'} className="navbarMenu" onClick={clickMenu}>UrlDataNotice</Link>
                <Link to={'/programDesign'} className="navbarMenu" onClick={clickMenu}>ProgramDesign</Link>
            </div>
        </>
    )
}

export default Menu;