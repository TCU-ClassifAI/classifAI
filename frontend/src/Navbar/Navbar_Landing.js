import React from "react"
import {Outlet, Link} from "react-router-dom";
import signOut from "../SignOut/signOut";
import "./Navbar_Landing.css"
import C2Image from '../images/logo.jpg'
import { Auth } from "aws-amplify";
import { useNavigate } from "react-router-dom";

const Navbar_Landing = () => {
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
                <a className="navbar-brand" href="#">
                        <img
                            src={C2Image}
                            className="tcu-image"
                            width="500"
                            height="500"
                            alt="" />
                </a>

                <div className="collapse navbar-collapse justify-content-end" id="navbarCollapse">
                    <ul className="navbar-nav">
                        {/* It is ingonering if the user logged in or not for now */}
                        <>
                            {/* menu when user is not signed in */}
                            <li className="nav-item">
                                <Link to="/" className="nav-link text-light"> Home</Link>
                            </li>
                            <li className="nav-item">
                                <Link to="/company" className="nav-link text-light"> Company </Link>
                            </li>
                            <li className="nav-item">
                                <Link to="/pricing" className="nav-link text-light"> Pricing </Link>
                            </li>
                        </>
                    </ul>
                </div>
            </nav>
            <Outlet />
        </>
    );
}

export default Navbar_Landing;
