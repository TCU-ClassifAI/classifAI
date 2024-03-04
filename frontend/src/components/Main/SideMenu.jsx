// SideMenu.js
import React from 'react';
import { NavLink } from 'react-router-dom';

export default function SideMenu() {
    return (
        <div className="side-menu">
        <ul>
            
            <li><NavLink to="./analyze" className={({ isActive }) => isActive ? "active-link" : ""}>Analyze</NavLink></li>
            <li><NavLink to="./myreports" className={({ isActive }) => isActive ? "active-link" : ""}>My Reports</NavLink></li>
            <li><NavLink to="./files" className={({ isActive }) => isActive ? "active-link" : ""}>Export Data Files</NavLink></li>
            <li><NavLink to="./account" className={({ isActive }) => isActive ? "active-link" : ""}>Account</NavLink></li>
            <li>
                <NavLink to="./transcribe" className={({ isActive }) => isActive ? "active-link" : ""}>
                    Legacy Analyze
                </NavLink>
            </li>
        </ul>
    </div>
    );
};


