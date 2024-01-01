import React from "react";

import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import Account from "./components/Account/accountPage";

import Navbar from "./components/Navbar/Navbar_Landing";
import { Main } from "./components/Main/mainUserPage";
import Login from "./components/Login/login";
import SignUp from "./components/SignUp/signUp";
import ConfirmRegister from "./components/SignUp/ConfirmRegister";
// import PrivateRoute from "./PrivateRoute";
import { withAuthenticator } from "@aws-amplify/ui-react";
import "@aws-amplify/ui-react/styles.css";
import awsconfig from "./aws-exports";
import { Amplify } from "aws-amplify";
import Navbar_Landing from "./components/Navbar/Navbar_Landing";
import Navbar_Home from "./components/Navbar/Navbar_Home";
import Landing from "./components/Landing/Landing";

Amplify.configure(awsconfig);

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Navbar_Landing />}>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/confirmSignUp" element={<ConfirmRegister />} />
        </Route>

        <Route path="/home/" element={<Navbar_Home />}>
          <Route path="*" element={<Main />} />
        </Route>
        {/* <Route path="/home/Files" element={<Files />} /> */}
        {/* ... other routes that might include SideMenu */}
      </Routes>
    </BrowserRouter>
  );
}
export default App;
