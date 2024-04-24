import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { Auth } from "aws-amplify";
import styles from "./MyReports.module.css";
import ErrorModal from "../../Common/ErrorModal";
import Alert from "@mui/material/Alert";
import TableContainer from "@mui/material/TableContainer";
import Table from "@mui/material/Table";
import TableHead from "@mui/material/TableHead";
import TableBody from "@mui/material/TableBody";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import Paper from "@mui/material/Paper";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Pagination from "@mui/material/Pagination";
import TableSortLabel from "@mui/material/TableSortLabel";

export default function MyReports() {
  const [files, setFiles] = useState([]);
  const [userId, setUserId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [oldFileNameEditing, setOldFileNameEditing] = useState("");
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorModalMsg, setErrorModalMsg] = useState("");
  const [editSaveSuccess, setEditSaveSuccess] = useState(false);
  const [alertMsg, setAlertMsg] = useState("");
  const [sortBy, setSortBy] = useState("");
  const [sortOrder, setSortOrder] = useState("asc");

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
        let link = "";
        let audioDate = report.audioDate ? report.audioDate : null;

        if (fileName && fileName.toLowerCase().includes("youtube")) {
          fileExtension = "youtube";
          link = report.transferData.fileName;
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
          status: report.transferData.status
            ? report.transferData.status
            : report.transferData.progress,
          fileName: fileName,
          fileType: fileExtension,
          isEditing: false,
          link: link,
          audioDate: audioDate,
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
          `${
            import.meta.env.VITE_BACKEND_SERVER
          }/files/${oldFileName}/reports/${reportId}/users/${userId}`,
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
    } else {
      audioFileUpdate = newFileName;
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
      console.error(
        "Error updating report name, subject, grade, or audio file:",
        error
      );
      setErrorModalMsg(
        "Error updating report name, subject, grade, or audio file:"
      );
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

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = files.slice(indexOfFirstItem, indexOfLastItem);

  const handlePageChange = (_, page) => {
    setCurrentPage(page);
  };

  const handleCloseErrorModal = () => {
    setShowErrorModal(false);
  };

  const handleSort = (property) => {
    const isAsc = sortBy === property && sortOrder === "asc";
    setSortOrder(isAsc ? "desc" : "asc");
    setSortBy(property);
    const sortedFiles = [...files].sort((a, b) => {
      if (isAsc) {
        return a[property] > b[property] ? 1 : -1;
      } else {
        return a[property] < b[property] ? 1 : -1;
      }
    });
    setFiles(sortedFiles);
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
      <p>You may click on the column headers to sort in descending or ascending order.</p>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>
                <TableSortLabel
                  active={sortBy === "reportName"}
                  direction={sortBy === "reportName" ? sortOrder : "asc"}
                  onClick={() => handleSort("reportName")}
                >
                  <b>Report Name</b>
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={sortBy === "audioDate"}
                  direction={sortBy === "audioDate" ? sortOrder : "asc"}
                  onClick={() => handleSort("audioDate")}
                >
                  <b>Audio Date/Time</b>
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={sortBy === "subject"}
                  direction={sortBy === "subject" ? sortOrder : "asc"}
                  onClick={() => handleSort("subject")}
                >
                  <b>Subject</b>
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={sortBy === "gradeLevel"}
                  direction={sortBy === "gradeLevel" ? sortOrder : "asc"}
                  onClick={() => handleSort("gradeLevel")}
                >
                  <b>Grade</b>
                </TableSortLabel>
              </TableCell>
              <TableCell>
              <TableSortLabel
                  active={sortBy === "audioFile"}
                  direction={sortBy === "audioFile" ? sortOrder : "asc"}
                  onClick={() => handleSort("audioFile")}
                >
                  <b>Audio File</b>
                </TableSortLabel>
              </TableCell>
              <TableCell><TableSortLabel
                active={sortBy === "status"}
                direction={sortBy === "status" ? sortOrder : "asc"}
                onClick={() => handleSort("status")}
              >
                <b>Status</b>
              </TableSortLabel></TableCell>
              
              <TableCell>
                <b>Edit</b>
              </TableCell>
              <TableCell>
                <b>Delete</b>
              </TableCell>
              <TableCell>
                <b>Load Report</b>
              </TableCell>
              <TableCell>
                <b>Download Audio/Link</b>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {currentItems.map((file, index) => (
              <TableRow key={file.reportId}>
                <TableCell>
                  {file.isEditing ? (
                    <TextField
                      type="text"
                      value={file.reportName}
                      onChange={(event) =>
                        handleReportNameChange(event, file.reportId)
                      }
                    />
                  ) : (
                    file.reportName
                  )}
                </TableCell>
                <TableCell>{file.audioDate}</TableCell>
                <TableCell>
                  {file.isEditing ? (
                    <TextField
                      type="text"
                      value={file.subject}
                      onChange={(event) =>
                        handleSubjectChange(event, file.reportId)
                      }
                    />
                  ) : (
                    file.subject
                  )}
                </TableCell>
                <TableCell>
                  {file.isEditing ? (
                    <TextField
                      type="text"
                      value={file.gradeLevel}
                      onChange={(event) =>
                        handleGradeChange(event, file.reportId)
                      }
                    />
                  ) : (
                    file.gradeLevel
                  )}
                </TableCell>
                <TableCell>
                  {file.isEditing && file.fileType !== "youtube" ? (
                    <TextField
                      type="text"
                      value={file.fileName}
                      onChange={(event) =>
                        handleFileNameChange(event, file.reportId)
                      }
                    />
                  ) : (
                    file.fileName
                  )}
                </TableCell>
                <TableCell>{file.status}</TableCell>
                <TableCell>
                  {file.isEditing ? (
                    <>
                      <Button
                        variant="contained"
                        color="success"
                        onClick={() =>
                          handleSaveClick(file.reportId, file.fileType)
                        }
                      >
                        Save
                      </Button>
                      <Button
                        variant="contained"
                        color="secondary"
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
                      </Button>
                    </>
                  ) : (
                    <Button
                      variant="contained"
                      onClick={() => handleEditClick(file.reportId)}
                    >
                      Edit
                    </Button>
                  )}
                </TableCell>
                <TableCell>
                  <Button
                    variant="contained"
                    color="error"
                    onClick={() => handleDeleteClick(file.reportId)}
                  >
                    Delete
                  </Button>
                </TableCell>

                <TableCell>
                  <Button variant="contained" color="warning">
                    <Link
                      to="../analyze"
                      state={{
                        reportId: file.reportId,
                      }}
                      className={styles.loadLink}
                    >
                      Load
                    </Link>
                  </Button>
                </TableCell>
                <TableCell>
                  {file.fileType === "youtube" ? (
                    <a
                      href={file.link}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Button variant="contained" color="secondary">
                        Youtube
                      </Button>
                    </a>
                  ) : (
                    <Button
                      variant="contained"
                      color="secondary"
                      onClick={() =>
                        handleDownloadClick(
                          file.reportId,
                          file.fileName,
                          file.fileType
                        )
                      }
                    >
                      Download
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Pagination
        count={Math.ceil(files.length / itemsPerPage)}
        onChange={handlePageChange}
        page={currentPage}
      />
    </>
  );
}
