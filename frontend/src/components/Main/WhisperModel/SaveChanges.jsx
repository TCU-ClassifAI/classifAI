import axios from "axios";
import ErrorModal from "../../Common/ErrorModal";
import Alert from "@mui/material/Alert";
import styles from "./SaveChanges.module.css";
import { useState } from "react";
export default function SaveChanges({
  reportName,
  subject,
  gradeLevel,
  dateTime,
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
    console.log(dateTime);
    try {
      await axios.put(
        `${
          import.meta.env.VITE_BACKEND_SERVER
        }/reports/${reportId}/users/${userId}`,
        {
          reportName: reportName,
          gradeLevel: gradeLevel,
          subject: subject,
          audioDate: dateTime.format('MM-DD-YYYY HH:mm:ss')
        }
      );
    } catch (error) {
      console.error("Error updating report name, grade, subject or datetime", error);
      setErrorMsg("Error updating report name, grade, subject or datetime");
      setShowErrorModal(true);
    }
  };

  const saveTranscript = async () => {
    try {
      const formData = new FormData(); // Create a FormData object
      formData.append("result", JSON.stringify(transcription)); // Append the transcription data
      console.log(formData);
      const response = await axios.put(
        `${
          import.meta.env.VITE_BACKEND_SERVER
        }/reports/${reportId}/users/${userId}`,
        formData, // Use formData instead of JSON.stringify({ result: transcription })
        {
          headers: {
            "Content-Type": "multipart/form-data", // Set content type to multipart/form-data
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
      const formData = new FormData();
      formData.append('categorized', JSON.stringify(categorizedQuestions));
  
      await axios.put(
        `${import.meta.env.VITE_BACKEND_SERVER}/reports/${reportId}/users/${userId}`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data', // Set content type to multipart/form-data
          },
        }
      );
  
      console.log('Categorization saved successfully');
    } catch (error) {
      console.error('Error updating categorization', error);
      setErrorMsg('Error updating categorization');
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
