import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { Auth } from "aws-amplify";
import styles from "./MyReports.module.css";
import ReactPaginate from "react-paginate";
import ErrorModal from "../../Common/ErrorModal";
import Alert from "@mui/material/Alert";

export default function MyReports() {
  const [files, setFiles] = useState([]);
  const [userId, setUserId] = useState(null);
  const [currentPage, setCurrentPage] = useState(0); // Changed initial page to 0
  const [itemsPerPage] = useState(10);
  const [oldFileNameEditing, setOldFileNameEditing] = useState("");
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorModalMsg, setErrorModalMsg] = useState("");
  const [editSaveSuccess, setEditSaveSuccess] = useState(false);
  const [alertMsg, setAlertMsg] = useState("");

  useEffect(() => {
    async function retrieveUserInfo() {
      try {
        const user = await Auth.currentAuthenticatedUser();
        const { attributes } = user;
        setUserId(attributes.email);
      } catch (error) {
        console.error("Error fetching user data:", error);
        setErrorModalMsg(
          "Error fetching authentication data! Try again later."
        );
        setShowErrorModal(true);
      }
    }

    retrieveUserInfo();
  }, []);

  useEffect(() => {
    if (userId) {
      fetchUserFiles();
    }
  }, [userId]);

  const fetchUserFiles = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_SERVER}/reports/users/${userId}`
      );
      console.log(response);
      const reports = response.data;
      const filtered_reports = reports.map((report) => {
        let fileExtension;
        let fileName = report.transferData ? String(report.audioFile) : null;

        if (fileName && fileName.toLowerCase().includes("youtube")) {
          fileExtension = "youtube";
        } else {
          fileExtension = fileName.split(".").pop();
          fileName = fileName.split(".").shift();
        }
        return {
          userId: report.userId,
          reportId: report.reportId,
          reportName: report.reportName,
          subject: report.subject,
          gradeLevel: report.gradeLevel,
          status: report.transferData.status ? report.transferData.status : report.transferData.progress,
          fileName: fileName,
          fileType: fileExtension,
          isEditing: false,
        };
      });

      setFiles(filtered_reports.reverse());
    } catch (error) {
      console.error("Error fetching user reports:", error);
      setErrorModalMsg(
        "Error fetching reports from database! Try again later."
      );
      setShowErrorModal(true);
    }
  };

  const handleFileNameChange = (event, key) => {
    const updatedFiles = files.map((file) =>
      file.reportId === key ? { ...file, fileName: event.target.value } : file
    );
    setFiles(updatedFiles);
  };

  const handleGradeChange = (event, key) => {
    const updatedFiles = files.map((file) =>
      file.reportId === key ? { ...file, gradeLevel: event.target.value } : file
    );
    setFiles(updatedFiles);
  };

  const handleSubjectChange = (event, key) => {
    const updatedFiles = files.map((file) =>
      file.reportId === key ? { ...file, subject: event.target.value } : file
    );
    setFiles(updatedFiles);
  };

  const handleReportNameChange = (event, key) => {
    const updatedFiles = files.map((file) =>
      file.reportId === key ? { ...file, reportName: event.target.value } : file
    );
    setFiles(updatedFiles);
  };

  const handleEditClick = (key) => {
    const updatedFiles = files.map((file) =>
      file.reportId === key ? { ...file, isEditing: true } : file
    );
    setOldFileNameEditing(files.find((file) => file.reportId === key).fileName);
    setFiles(updatedFiles);
  };

  const handleSaveClick = async (key, fileType) => {
    const updatedFiles = files.map((file) =>
      file.reportId === key ? { ...file, isEditing: false } : file
    );
    const fileToUpdate = files.find((file) => file.reportId === key);
    const {
      fileName: newFileName,
      reportId,
      subject,
      gradeLevel,
      reportName: newReportName,
    } = fileToUpdate;
    const oldFileName = oldFileNameEditing || newFileName;
    if (fileType !== "youtube") {
      try {
        await axios.put(
          `${import.meta.env.VITE_BACKEND_SERVER}/files/${oldFileName}/reports/${reportId}/users/${userId}`,
          {
            fileName: newFileName,
          }
        );
  
        setFiles(updatedFiles);
        setEditSaveSuccess(true);
        setAlertMsg("Successful update to file name!");
        fetchUserFiles();
      } catch (error) {
        console.error("Error updating file name:", error);
        setErrorModalMsg("Error updating file name");
        setShowErrorModal(true);
      }
    }
    let audioFileUpdate;
    if (fileType !== "youtube") {
      audioFileUpdate = newFileName + "." + fileType;
    }
    else {
      audioFileUpdate = newFileName
    }
    
    try {
      await axios.put(
        `${
          import.meta.env.VITE_BACKEND_SERVER
        }/reports/${reportId}/users/${userId}`,
        {
          reportName: newReportName,
          gradeLevel: gradeLevel,
          subject: subject,
          audioFile: audioFileUpdate,
        }
      );

      setFiles(updatedFiles);
      setEditSaveSuccess(true);
      setAlertMsg(
        "Report Id: " +
          reportId +
          " report name, subject, grade, or audio file updated successfully!"
      );
      fetchUserFiles();
    } catch (error) {
      console.error("Error updating report name, subject, grade, or audio file:", error);
      setErrorModalMsg("Error updating report name, subject, grade, or audio file:");
      setShowErrorModal(true);
    }
  };

  const handleDeleteClick = async (key) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this file?"
    );
    if (confirmDelete) {
      const fileToDelete = files.find((file) => file.reportId === key);
      const { reportId } = fileToDelete;

      try {
        await axios.delete(
          `${
            import.meta.env.VITE_BACKEND_SERVER
          }/reports/${reportId}/users/${userId}`
        );

        const updatedFiles = files.filter((file) => file.reportId !== key);
        setFiles(updatedFiles);
        setEditSaveSuccess(true);
        setAlertMsg("Report Id: " + reportId + " deleted successfully!");
      } catch (error) {
        console.error("Error deleting file:", error);
        setErrorModalMsg("Error deleting file");
        setShowErrorModal(true);
      }
    }
  };

  const handleDownloadClick = async (reportId, fileName, fileType) => {
    try {
      const response = await axios.get(
        `${
          import.meta.env.VITE_BACKEND_SERVER
        }/files/${fileName}/reports/${reportId}/users/${userId}?download=true`,
        {
          responseType: "blob", // Set response type to blob
        }
      );

      const blob = new Blob([response.data], {
        type: response.headers["content-type"],
      });

      const url = window.URL.createObjectURL(blob);
      const fileExtension = "." + fileType;
      const downloadableFileName = `${fileName}${fileExtension}`;

      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", downloadableFileName);
      document.body.appendChild(link);

      link.click();

      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);

      console.log("Download Success");
    } catch (error) {
      console.error("Error downloading file:", error);
      setErrorModalMsg("Error downloading file");
      setShowErrorModal(true);
    }
  };

  const indexOfLastItem = (currentPage + 1) * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = files.slice(indexOfFirstItem, indexOfLastItem);

  const handlePageClick = ({ selected }) => {
    setCurrentPage(selected);
  };

  const handleCloseErrorModal = () => {
    setShowErrorModal(false);
  };

  return (
    <>
      <ErrorModal
        message={errorModalMsg}
        showErrorModal={showErrorModal}
        handleCloseErrorModal={handleCloseErrorModal}
      />
      {editSaveSuccess && (
        <div>
          <Alert severity="success">{alertMsg}</Alert>
        </div>
      )}
      <div className={styles.tableContainer}>
        <h2>My Reports</h2>
        <table className={styles.prettyTable}>
          <thead>
            <tr>
              <th>Report ID</th>
              <th>Report Name</th>
              <th>Subject</th>
              <th>Grade</th>
              <th>Audio File</th>
              <th>Status</th>
              <th>Edit</th>
              <th>Delete</th>
              <th>Load Report</th>
              <th>Download Audio</th>
            </tr>
          </thead>
          <tbody>
            {currentItems.map((file, index) => (
              <tr key={file.reportId}>
                <td>{file.reportId}</td>
                <td>
                  {file.isEditing ? (
                    <input
                      type="text"
                      value={file.reportName}
                      onChange={(event) =>
                        handleReportNameChange(event, file.reportId)
                      }
                    />
                  ) : (
                    file.reportName
                  )}
                </td>
                <td>
                  {file.isEditing ? (
                    <input
                      type="text"
                      value={file.subject}
                      onChange={(event) =>
                        handleSubjectChange(event, file.reportId)
                      }
                    />
                  ) : (
                    file.subject
                  )}
                </td>
                <td>
                  {file.isEditing ? (
                    <input
                      type="text"
                      value={file.gradeLevel}
                      onChange={(event) =>
                        handleGradeChange(event, file.reportId)
                      }
                    />
                  ) : (
                    file.gradeLevel
                  )}
                </td>
                <td>
                  {file.isEditing && file.fileType !== "youtube" ? ( // Check if fileType is not "youtube"
                    <input
                      type="text"
                      value={file.fileName}
                      onChange={(event) =>
                        handleFileNameChange(event, file.reportId)
                      }
                    />
                  ) : (
                    file.fileName
                  )}
                </td>
                <td>{file.status}</td>
                <td className={styles.csvButton}>
                  {file.isEditing ? (
                    <>
                      <button
                        className={styles.saveButton}
                        onClick={() => handleSaveClick(file.reportId, file.fileType)}
                      >
                        Save
                      </button>
                      <button
                        className={styles.cancelButton}
                        onClick={() => {
                          const updatedFiles = files.map((f) =>
                            f.reportId === file.reportId
                              ? {
                                  ...f,
                                  isEditing: false,
                                  fileName: oldFileNameEditing,
                                }
                              : f
                          );
                          setFiles(updatedFiles);
                        }}
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <button
                      className={styles.editButton}
                      onClick={() => handleEditClick(file.reportId)}
                    >
                      Edit
                    </button>
                  )}
                </td>
                <td>
                  <button
                    className={styles.deleteButton}
                    onClick={() => handleDeleteClick(file.reportId)}
                  >
                    Delete
                  </button>
                </td>

                <td>
                  <button className={styles.loadButton}>
                    <Link
                      to="../analyze"
                      state={{
                        reportId: file.reportId,
                      }}
                      className={styles.loadLink}
                    >
                      Load
                    </Link>
                  </button>
                </td>
                <td>
                  <button
                    className={`${
                      file.fileType === "youtube"
                        ? styles.disabledDownloadButton
                        : styles.downloadButton
                    }`}
                    onClick={() =>
                      handleDownloadClick(
                        file.reportId,
                        file.fileName,
                        file.fileType
                      )
                    }
                    disabled={file.fileType === "youtube"}
                  >
                    Download
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <ReactPaginate
          previousLabel={"Previous"}
          nextLabel={"Next"}
          pageCount={Math.ceil(files.length / itemsPerPage)}
          onPageChange={handlePageClick}
          containerClassName={`${styles.pagination}`}
          activeClassName={`${styles.active}`}
        />
      </div>
    </>
  );
}
