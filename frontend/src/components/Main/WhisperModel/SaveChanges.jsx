import axios from "axios";
import ErrorModal from "../../Common/ErrorModal";
import Alert from "@mui/material/Alert";
import styles from "./SaveChanges.module.css";
import { useState } from "react";
export default function SaveChanges({
  reportName,
  subject,
  gradeLevel,
  reportId,
  userId,
  transcription,
  setChangeAlert,
  categorizedQuestions,
}) {
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [successAlert, setSuccessAlert] = useState(!setChangeAlert);
  const [errorMsg, setErrorMsg] = useState("");

  const handleCloseErrorModal = () => {
    setShowErrorModal(false);
  };

  const saveMetaInfo = async () => {
    try {
      await axios.put(
        `${
          import.meta.env.VITE_BACKEND_SERVER
        }/reports/${reportId}/users/${userId}`,
        {
          reportName: reportName,
          gradeLevel: gradeLevel,
          subject: subject,
        }
      );
    } catch (error) {
      console.error("Error updating report name, grade or subject", error);
      setErrorMsg("Error updating report name, grade or subject");
      setShowErrorModal(true);
    }
  };

  const saveTranscript = async () => {
    try {
      const response = await axios.put(
        `${
          import.meta.env.VITE_BACKEND_SERVER
        }/reports/${reportId}/users/${userId}`,
        JSON.stringify({ result: transcription }), // Convert to JSON string
        {
          headers: {
            "Content-Type": "application/json", // Set content type to application/json
          },
        }
      );
      console.log(response);
      console.log("Transcript saved successfully");
    } catch (error) {
      console.error("Error updating transcript", error);
      setErrorMsg("Error updating transcript");
      setShowErrorModal(true);
    }
  };

  const saveCategorization = async () => {
    try {
      await axios.put(
        `${
          import.meta.env.VITE_BACKEND_SERVER
        }/reports/${reportId}/users/${userId}`,
        JSON.stringify({ categorized: categorizedQuestions }), // Convert to JSON string
        {
          headers: {
            "Content-Type": "application/json", // Set content type to application/json
          },
        }
      );

      console.log("Categorization saved successfully");
    } catch (error) {
      console.error("Error updating categorization", error);
      setErrorMsg("Error updating categorization");
      setShowErrorModal(true);
    }
  };

  const handleSave = async () => {
    // investigate why these only work when separated, might be due to different content types
    try {
      saveMetaInfo();
      saveCategorization();
      saveTranscript();
      setChangeAlert(false);
      setSuccessAlert(true);
    } catch (error) {
      console.error("Error updating report information", error);
      setShowErrorModal(true);
    }
  };
  return (
    <>
      <ErrorModal
        message={errorMsg}
        showErrorModal={showErrorModal}
        handleCloseErrorModal={handleCloseErrorModal}
      />
      <button
        onClick={handleSave}
        className={`btn btn-primary ${styles.container}`}
      >
        Save Changes
      </button>
      {successAlert && (
        <div>
          <Alert
            severity="success"
            onClose={() => {
              setSuccessAlert(false);
            }}
            className={styles.alertWrapper}
          >
            Changes Saved!
          </Alert>
        </div>
      )}
    </>
  );
}
