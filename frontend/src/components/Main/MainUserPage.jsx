import React from "react";
import { Routes, Route, Outlet } from "react-router-dom";
import SideMenu from "./SideMenu";
import Transcribe from "./Transcribe/Transcribe";
import Whisper from "./WhisperModel/Whisper";
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
                    <Route path="transcribe" element={<Transcribe />} /> 
                    <Route path="whisper" element={<Whisper />} /> 
                    <Route path="myreports" element={<MyReports />} /> 
                    <Route path="files" element={<ExportDataFiles />} /> 
                    <Route path="account" element={<Account />} />
                    {/* other nested routes if needed */}
                </Routes>
                <Outlet />
            </div>
        </div>
    );
};
