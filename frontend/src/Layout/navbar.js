import React from "react"
import {Outlet, Link} from "react-router-dom";
// import signOut from "../SignOut/signOut";
import "../Layout/navbar.css"
import C2Image from '../images/C2.png'
import { Auth } from "aws-amplify";
import { useNavigate } from "react-router-dom";

const Layout = () => {
    let navigate = useNavigate();
    async function signOut(event){
        event.preventDefault();
        try{
            await Auth.signOut();
            console.log("Sign out succesfully")
            navigate("/")
        }catch (error){
            console.log('error signing out: ', error);
        }
    }
    
        return(
            <><><nav className="navbar navbar-expand-lg" id="main-nav">
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
                        <li className="nav-item">
                            <Link to="/home" className="nav-link text-light"> Home</Link>
                        </li>
                        <li className="nav-item">
                            <Link to="/account" className="nav-link text-light"> Account</Link>
                        </li>
                        <li className="nav-item">
                            <a className="nav-link text-light" onClick={(e) => signOut(e)} id='sign-out'>Sign Out</a>
                        </li>
                    </ul>
                </div>
            </nav>

                <Outlet />
                </>
                
                </>
        )
}

export default Layout;
