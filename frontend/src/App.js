import React from "react";

import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import Account from "./Account/accountPage";

import Layout from "./Layout/navbar";
import { Main } from "./Main/mainUserPage";
import Login from "./Login/login";
import SignUp from "./SignUp/signUp";
import ConfirmRegister from "./SignUp/ConfirmRegister";
// import PrivateRoute from "./PrivateRoute";
import { withAuthenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import awsconfig from './aws-exports'
import { Amplify } from "aws-amplify";
Amplify.configure(awsconfig);

function App() {
  return (
    <BrowserRouter>
      <Routes>
          <Route element={<Layout />}>
            <Route path="/home" element={<Main />} />
            <Route path="/account" element={<Account />} />
          </Route>
          <Route path="/" element={<Login />}></Route>
          <Route path="/signup" element={<SignUp />}></Route>
          <Route path="/confirmSignUp" element={<ConfirmRegister />}></Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
