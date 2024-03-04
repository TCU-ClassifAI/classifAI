import React from "react";
import { Routes, Route, Outlet } from "react-router-dom";
import SideMenu from "./SideMenu";
import Transcribe from "./Transcribe/Transcribe";
import Analyze from "./WhisperModel/Analyze";
import ExportDataFiles from "./ExportDataFiles/ExportDataFiles" ; // hypothetical component
import Account from "../Account/AccountPage";
import MyReports from "./MyReports/MyReports";
import "./MainPage.css";

export default function Main() {
    return (
        <div className="main-layout">
            <SideMenu />
            <div className="main-content">
                <Routes>
                    <Route path="analyze" element={<Analyze />} /> 
                    <Route path="myreports" element={<MyReports />} /> 
                    <Route path="files" element={<ExportDataFiles />} /> 
                    <Route path="account" element={<Account />} />
                    <Route path="transcribe" element={<Transcribe />} /> 
                    {/* other nested routes if needed */}
                </Routes>
                <Outlet />
            </div>
        </div>
    );
};
