import axios from "axios";
import ErrorModal from "../../Common/ErrorModal";
import Alert from '@mui/material/Alert';
import { useState } from "react";
export default function SaveChanges({
    reportName,
    subject,
    gradeLevel,
    reportId,
    userId,
    transcription,
    setChangeAlert
}) {

  const [showErrorModal, setShowErrorModal] = useState(false);
  const [successAlert, setSuccessAlert] = useState(false);

  const handleCloseErrorModal = () => {
    setShowErrorModal(false);
  };

  const handleSave = async () => {
    try {
      await axios.put(
        `${window.backendServer}/reports/${reportId}/users/${userId}`,
        {
          reportName: reportName,
          gradeLevel: gradeLevel,
          subject: subject
        }
      );
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
      <button onClick={handleSave} className="btn btn-primary">Save Changes</button>
      {successAlert && (
        <div>
            <Alert severity="success" onClose={() => {setSuccessAlert(false)}}>Changes Saved!</Alert>
        </div>
      )}
    </>
  );
}
