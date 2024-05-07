import React, { useState, useEffect } from "react";
import { Outlet, Link } from "react-router-dom";
import { Link as ScrollLink } from "react-scroll";
import "./NavbarLanding.css";
import C2Image from "../../images/frogv2.png";
import { Auth } from "aws-amplify";
import { useNavigate } from "react-router-dom";

export default function NavbarLanding() {
  let navigate = useNavigate();
  // const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isNavCollapsed, setIsNavCollapsed] = useState(true);

  useEffect(() => {
    checkUser();
  }, []);

  async function checkUser() {
    try {
      await Auth.currentAuthenticatedUser();
      // setIsAuthenticated(true);
    } catch (error) {
      // setIsAuthenticated(false);
    }
  }

  const scrollToSection = (sectionId) => {
    navigate("/#" + sectionId);
    closeNav(); 
  };

  const closeNav = () => {
    setIsNavCollapsed(true);
  };

  return (
    <>
      <nav className="navbar navbar-expand-lg" id="main-nav">
        <a className="navbar-brand" href="/">
          <img src={C2Image} className="tcu-image" alt="" />
          <span
            style={{
              color: "white",
              justifyContent: "center",
              fontWeight: "bold",
            }}
          >
            ClassifAI
          </span>
        </a>
        <button className="navbar-toggler" type="button" onClick={() => setIsNavCollapsed(!isNavCollapsed)} aria-expanded={!isNavCollapsed} aria-label="Toggle navigation">
          <span className={isNavCollapsed ? "navbar-toggler-icon" : "navbar-toggler-icon toggler-close"}></span>
        </button>
        <div className={"collapse navbar-collapse justify-content-end" + (isNavCollapsed ? "" : " show")} id="navbarResponsive">
          <ul className="navbar-nav">
            {/* Each ScrollLink and Link should now also call closeNav when clicked */}
            <li className="nav-item">
              <ScrollLink
                to="home"
                spy={true}
                smooth={true}
                duration={200}
                onClick={() => scrollToSection("home")}
                className="nav-link text-light"
              >
                Home
              </ScrollLink>
            </li>
            <li className="nav-item">
              <ScrollLink
                to="features"
                spy={true}
                smooth={true}
                duration={200}
                onClick={() => scrollToSection("features")}
                className="nav-link text-light"
              >
                Features
              </ScrollLink>
            </li>
            <li className="nav-item">
              <ScrollLink
                to="about"
                spy={true}
                smooth={true}
                duration={200}
                onClick={() => scrollToSection("about")}
                className="nav-link text-light"
              >
                About Us
              </ScrollLink>
            </li>
            <li className="nav-item">
              <Link to="/signup" onClick={closeNav} className="nav-link text-light">
                Sign Up
              </Link>
            </li>
            <li className="nav-item">
              <Link to="/login" onClick={closeNav} className="nav-link text-light">
                Login
              </Link>
            </li>
          </ul>
        </div>
      </nav>
      <Outlet />
    </>
  );
};