import React, { useState, useEffect } from "react";
import { Outlet, Link } from "react-router-dom";
import C2Image from '../../images/frogv2.png';
import { Auth } from "aws-amplify";
import { useNavigate } from "react-router-dom";

export default function NavbarHome() {
    let navigate = useNavigate();
    // const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isNavCollapsed, setIsNavCollapsed] = useState(true);
    const [windowWidth, setWindowWidth] = useState(window.innerWidth);

    useEffect(() => {
        checkUser();
        function handleResize() {
            setWindowWidth(window.innerWidth);
        }

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    async function checkUser() {
        try {
            await Auth.currentAuthenticatedUser();
            // setIsAuthenticated(true);
        } catch (error) {
            // setIsAuthenticated(false);
        }
    }

    async function signOut(event) {
        event.preventDefault();
        try {
            await Auth.signOut();
            console.log("Sign out successfully");
            navigate("/");
        } catch (error) {
            console.log('error signing out: ', error);
        }
    }

    const closeNav = () => {
        setIsNavCollapsed(true);
    };

    return (
        <>
            <nav className="navbar navbar-expand-lg" id="main-nav">
                <a className="navbar-brand" href="/">
                    <img src={C2Image} className="tcu-image" alt="" />
                    <span style={{ color: 'white', justifyContent: 'center', fontWeight: 'bold' }}>ClassifAI</span>
                </a>
                <button className="navbar-toggler" type="button" onClick={() => setIsNavCollapsed(!isNavCollapsed)} aria-expanded={!isNavCollapsed} aria-label="Toggle navigation">
                    <span className="navbar-toggler-icon"></span>
                </button>
                <div className={"collapse navbar-collapse" + (!isNavCollapsed ? " show" : "")} id="navbarResponsive">
                    <ul className="navbar-nav">
                        {windowWidth <= 768 && (
                            <>
                                <li className="nav-item">
                                    <Link to="/home/analyze" className="nav-link text-light" onClick={closeNav}>Analyze</Link>
                                </li>
                                <li className="nav-item">
                                    <Link to="/home/myreports" className="nav-link text-light" onClick={closeNav}>My Reports</Link>
                                </li>
                                <li className="nav-item">
                                    <Link to="/home/files" className="nav-link text-light" onClick={closeNav}>Export Data Files</Link>
                                </li>
                                <li className="nav-item">
                                    <Link to="/home/transcribe" className="nav-link text-light" onClick={closeNav}>Legacy Analyze</Link>
                                </li>
                            </>
                        )}
                    </ul>
                    <ul className="navbar-nav ms-auto">
                        <li className="nav-item">
                            <Link to="/home/account" className="nav-link text-light" onClick={closeNav}>Account</Link>
                        </li>
                        <li className="nav-item">
                            <a href="#home" className="nav-link text-light" onClick={(e) => { signOut(e); closeNav(); }} id='sign-out'>Sign Out</a>
                        </li>
                    </ul>
                </div>
            </nav>
            <Outlet />
        </>
    );
}
