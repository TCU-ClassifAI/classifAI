import React from "react";

import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import Account from "./Account/accountPage";

import Navbar from "./Layout/Layout";
import { Main } from "./Main/mainUserPage";
import Login from "./Login/login";
import SignUp from "./SignUp/signUp";
import ConfirmRegister from "./SignUp/ConfirmRegister";
// import PrivateRoute from "./PrivateRoute";
import { withAuthenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import awsconfig from './aws-exports'
import { Amplify } from "aws-amplify";
import Layout from "./Layout/Layout";

Amplify.configure(awsconfig);


function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/confirmSignUp" element={<ConfirmRegister />} />
          
          <Route path="/home/*" element={<Main />} />
          {/* <Route path="/home/Files" element={<Files />} /> */}
          {/* ... other routes that might include SideMenu */}
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
export default App;
