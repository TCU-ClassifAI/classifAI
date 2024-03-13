import axios from "axios";
import ErrorModal from "../../Common/ErrorModal";
import { useState } from "react";
export default function SaveChanges({
    reportName,
    subject,
    gradeLevel,
    reportId,
    userId
}) {

  const [showErrorModal, setShowErrorModal] = useState(false);
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
      console.log("Update Success");
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
        />
      <button onClick={handleSave} className="btn btn-primary">Save Changes</button>
    </>
  );
}
