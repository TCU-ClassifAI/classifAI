import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Submission from "./submission";
import { Auth } from "aws-amplify";

export const Main = () => {
    let navigate = useNavigate();

    return(
        <div className="container" id="fileInputGroup">
            <Submission></Submission>
        </div>
    );
}
