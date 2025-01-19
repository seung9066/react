import { useState } from "react";
import { Link } from 'react-router-dom'

import '../css/Menu.css'

function Menu() {
    return (
        <>
            <div className="navbar">
                <Link to={'/'} className="navbarMenu">Home</Link>
                <Link to={'/props'} className="navbarMenu">Props</Link>
                <Link to={'/referenceDataType'} className="navbarMenu">ReferenceDataType</Link>
                <Link to={'/lifeCycleHook'} className="navbarMenu">LifeCycleHook</Link>
            </div>
        </>
    )
}

export default Menu;