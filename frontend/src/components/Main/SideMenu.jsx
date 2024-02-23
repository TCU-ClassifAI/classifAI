// SideMenu.js
import React from 'react';
import { NavLink } from 'react-router-dom';

export default function SideMenu() {
    return (
        <div className="side-menu">
        <ul>
            <li>
                <NavLink to="./transcribe" className={({ isActive }) => isActive ? "active-link" : ""}>
                    Transcribe
                </NavLink>
            </li>
            <li><NavLink to="./files" className={({ isActive }) => isActive ? "active-link" : ""}>Export Data Files</NavLink></li>
            <li><NavLink to="./account" className={({ isActive }) => isActive ? "active-link" : ""}>Account</NavLink></li>
        </ul>
    </div>
    );
};


