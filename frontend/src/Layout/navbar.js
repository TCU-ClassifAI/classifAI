import React from "react"
import {Outlet, Link} from "react-router-dom";
import signOut from "../SignOut/signOut";
import "../Layout/navbar.css"
import C2Image from '../images/logo.jpg'
import { Auth } from "aws-amplify";
import { useNavigate } from "react-router-dom";

const Layout = () => {
    let navigate = useNavigate();
    const [isAuthenticated, setIsAuthenticated] = React.useState(false);

    React.useEffect(() => {
        checkUser();
    }, []);

    async function checkUser() {
        try {
            await Auth.currentAuthenticatedUser();
            setIsAuthenticated(true);
        } catch (error) {
            setIsAuthenticated(false);
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
    
    return (
        <>
            <nav className="navbar navbar-expand-lg" id="main-nav">
                <div className="collapse navbar-collapse justify-content-end" id="navbarCollapse">
                    <ul className="navbar-nav">
                        <li className="nav-item">
                            <Link to="/home" className="nav-link text-light"> Home</Link>
                        </li>
                        {isAuthenticated ? (
                            <>
                                {/* menu when user is signed in */}
                                <li className="nav-item">
                                    <Link to="/account" className="nav-link text-light"> Account</Link>
                                </li>
                                <li className="nav-item">
                                    <a className="nav-link text-light" onClick={(e) => signOut(e)} id='sign-out'>Sign Out</a>
                                </li>
                            </>
                        ) : (
                            <>
                                {/* menu when user is not signed in */}
                                <li className="nav-item">
                                   <Link to="/signIn" className="nav-link text-light"> Company </Link>
                                </li>
                                <li className="nav-item">
                                   <Link to="/signIn" className="nav-link text-light"> Pricing </Link>
                                </li>
                           </>

                        )}
                    </ul>
                </div>
            </nav>
            <Outlet />
        </>
    );
}

export default Layout;
