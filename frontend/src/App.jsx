import React from "react";

import { BrowserRouter, Routes, Route } from "react-router-dom";

import Main  from "./components/Main/MainUserPage";
import Login from "./components/Login/Login";
import SignUp from "./components/SignUp/SignUp";
import ConfirmRegister from "./components/SignUp/ConfirmRegister";
import "@aws-amplify/ui-react/styles.css";
import awsconfig from "./aws-exports";
import { Amplify } from "aws-amplify";
import NavbarLanding from "./components/Navbar/NavbarLanding";
import NavbarHome from "./components/Navbar/NavbarHome";
import Landing from "./components/Landing/Landing";
import ResetPassword from "./components/Login/ResetPassword";

Amplify.configure(awsconfig);

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<NavbarLanding />}>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/resetPassword" element={<ResetPassword/>} />
          <Route path="/confirmSignUp" element={<ConfirmRegister />} />
        </Route>

        <Route path="/home" element={<NavbarHome />}>
          <Route path="*" element={<Main />} />
        </Route>
        {/* <Route path="/home/Files" element={<Files />} /> */}
        {/* ... other routes that might include SideMenu */}
      </Routes>
    </BrowserRouter>
  );
}
export default App;
