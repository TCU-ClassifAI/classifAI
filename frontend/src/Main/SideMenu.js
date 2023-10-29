// SideMenu.js
import React from 'react';
import { Link } from 'react-router-dom';
import { NavLink } from 'react-router-dom';

const SideMenu = () => {
    return (
        <div className="side-menu">
        <ul>
            <li>
                <NavLink to="." className={({ isActive }) => isActive ? "active-link" : ""}>
                    Submission
                </NavLink>
            </li>
            <li><NavLink to="./files" className={({ isActive }) => isActive ? "active-link" : ""}>All Files</NavLink></li>
            <li><NavLink to="./pdf-data" className={({ isActive }) => isActive ? "active-link" : ""}>PDF Data</NavLink></li>
            <li><NavLink to="./account" className={({ isActive }) => isActive ? "active-link" : ""}>Account</NavLink></li>
        </ul>
    </div>
    );
};

export default SideMenu;
