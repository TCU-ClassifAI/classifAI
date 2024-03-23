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
  categorizedQuestions
}) {
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [successAlert, setSuccessAlert] = useState(!setChangeAlert);

  const handleCloseErrorModal = () => {
    setShowErrorModal(false);
  };

  const handleSave = async () => {
    // investigate why these only work when separated, might be due to different content types
    try {
      await axios.put(
        `${import.meta.env.VITE_BACKEND_SERVER}/reports/${reportId}/users/${userId}`,
        {
          reportName: reportName,
          gradeLevel: gradeLevel,
          subject: subject,
        }
      );

      await axios.put(
        `${import.meta.env.VITE_BACKEND_SERVER}/reports/${reportId}/users/${userId}`,
        {
          result: transcription,
        }
      );
      const catResponse = await axios.put(
        `${import.meta.env.VITE_BACKEND_SERVER}/reports/${reportId}/users/${userId}`,
        {
          categorized: categorizedQuestions,
        }
      );
      console.log(catResponse);
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
        message={"Error updating report information"}
        showErrorModal={showErrorModal}
        handleCloseErrorModal={handleCloseErrorModal}
      />
        <button onClick={handleSave} className={`btn btn-primary ${styles.container}`}>
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
