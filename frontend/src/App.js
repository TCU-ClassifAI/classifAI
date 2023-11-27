import React from "react";

import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import Account from "./Account/accountPage";

import Navbar from "./Navbar/Navbar_Landing";
import { Main } from "./Main/mainUserPage";
import Login from "./Login/login";
import SignUp from "./SignUp/signUp";
import ConfirmRegister from "./SignUp/ConfirmRegister";
// import PrivateRoute from "./PrivateRoute";
import { withAuthenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import awsconfig from './aws-exports'
import { Amplify } from "aws-amplify";
import Navbar_Landing from "./Navbar/Navbar_Landing";
import Navbar_Home from "./Navbar/Navbar_Home";
import About from "./About/about";

Amplify.configure(awsconfig);


function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route element={<Navbar_Landing />}>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/about" element={<About />} />
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