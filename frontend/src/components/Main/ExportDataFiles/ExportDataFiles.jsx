import React, { useState, useEffect } from "react";
import axios from "axios";
import { Auth } from "aws-amplify";
import styles from "./ExportDataFiles.module.css";
import ErrorModal from "../../Common/ErrorModal";
import {
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Button,
  Pagination,
  TableSortLabel,
  Alert
} from "@mui/material";

export default function ExportDataFiles() {
  const [files, setFiles] = useState([]);
  const [userId, setUserId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1); // Changed initial page to 1
  const [itemsPerPage] = useState(7);
  const [oldFileNameEditing, setOldFileNameEditing] = useState("");
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorModalMsg, setErrorModalMsg] = useState("");
  const [sortBy, setSortBy] = useState("");
  const [sortOrder, setSortOrder] = useState("asc");
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
        setErrorModalMsg("Error fetching user data from database! Try again later.");
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
        `${import.meta.env.VITE_BACKEND_SERVER}/files/users/${userId}?fileType=csv&fileType=pdf`
      );
      const flattenedData = response.data.reduce((acc, obj) => {
        obj.file.forEach((file, index) => {
          const lastDotIndex = file.lastIndexOf(".");
          const fileExtension = file.substring(lastDotIndex + 1);
          let audioDate = obj.audioDate ? obj.audioDate : null;
          acc.push({
            key: `${obj.reportId}_${index}`, // Use reportId and index as a key
            userId: obj.userId,
            reportId: obj.reportId,
            subject: obj.subject,
            grade: obj.gradeLevel,
            audioDate: audioDate,
            reportName: obj.reportName,
            fileName: obj.fileName[index],
            fileType: fileExtension,
            isEditing: false, // Initialize isEditing to false
          });
        });
        return acc;
      }, []);
      setFiles(flattenedData.reverse());
    } catch (error) {
      console.error("Error fetching user files:", error);
      setErrorModalMsg("Error fetching user files from database! Try again later.");
      setShowErrorModal(true);
    } 
  };

  const handleFileNameChange = (event, key) => {
    const updatedFiles = files.map((file) =>
      file.key === key ? { ...file, fileName: event.target.value } : file
    );
    setFiles(updatedFiles);
  };

  const handleEditClick = (key) => {
    const updatedFiles = files.map((file) =>
      file.key === key ? { ...file, isEditing: true } : file
    );
    setOldFileNameEditing(files.find((file) => file.key === key).fileName);
    setFiles(updatedFiles);
  };

  const handleSaveClick = async (key) => {
    const updatedFiles = files.map((file) =>
      file.key === key ? { ...file, isEditing: false } : file
    );
    const fileToUpdate = files.find((file) => file.key === key);
    const { fileName: newFileName, reportId } = fileToUpdate;
    const oldFileName = oldFileNameEditing || newFileName;

    try {
      await axios.put(
        `${import.meta.env.VITE_BACKEND_SERVER}/files/${oldFileName}/reports/${reportId}/users/${userId}`,
        {
          fileName: newFileName,
        }
      );

      setEditSaveSuccess(true);
      setAlertMsg("Successful update to file name!");
      setFiles(updatedFiles);
      
      fetchUserFiles();
    } catch (error) {
      console.error("Error updating file name:", error);
      setErrorModalMsg("Error updating file name");
      setShowErrorModal(true);
    }
  };

  const handleDeleteClick = async (key) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this file?"
    );
    if (confirmDelete) {
      const fileToDelete = files.find((file) => file.key === key);
      const { fileName: fileNameToDelete, reportId } = fileToDelete;

      try {
        await axios.delete(
          `${import.meta.env.VITE_BACKEND_SERVER}/files/${fileNameToDelete}/reports/${reportId}/users/${userId}`
        );

        setEditSaveSuccess(true);
        setAlertMsg("File successfully deleted!");
        const updatedFiles = files.filter((file) => file.key !== key);
        setFiles(updatedFiles);
        
      } catch (error) {
        console.error("Error deleting file:", error);
        setErrorModalMsg("Error fetching user files");
        setShowErrorModal(true);
      }
    }
  };

  const handleDownloadClick = async (reportId, fileName, fileType) => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_SERVER}/files/${fileName}/reports/${reportId}/users/${userId}?download=true`,
        {
          responseType: "blob", // Set response type to blob
        }
      );

      // Create a blob object from the response data
      const blob = new Blob([response.data], {
        type: response.headers["content-type"],
      });

      // Create a temporary URL to the blob
      const url = window.URL.createObjectURL(blob);
      const fileExtension = fileType === "csv" ? ".csv" : ".pdf";
      const downloadableFileName = `${fileName}${fileExtension}`;

      // Create a temporary anchor element to trigger the download
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", downloadableFileName); // Set the file name for download
      document.body.appendChild(link);

      // Trigger the download
      link.click();

      // Clean up
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

  const handlePageChange = (event, value) => {
    setCurrentPage(value);
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

      <div className={styles.tableContainer}>
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
                  <b>Audio Date</b>
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
                  active={sortBy === "grade"}
                  direction={sortBy === "grade" ? sortOrder : "asc"}
                  onClick={() => handleSort("grade")}
                >
                  <b>Grade</b>
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={sortBy === "fileName"}
                  direction={sortBy === "fileName" ? sortOrder : "asc"}
                  onClick={() => handleSort("fileName")}
                >
                  <b>File Name</b>
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={sortBy === "fileType"}
                  direction={sortBy === "fileType" ? sortOrder : "asc"}
                  onClick={() => handleSort("fileType")}
                >
                  <b>File Type</b>
                </TableSortLabel>
              </TableCell>
              <TableCell><b>Edit</b></TableCell>
              <TableCell><b>Delete</b></TableCell>
              <TableCell><b>Download</b></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {currentItems.map((file, index) => (
              <TableRow key={file.key}>
                <TableCell>{file.reportName}</TableCell>
                <TableCell>{file.audioDate}</TableCell>
                <TableCell>{file.subject}</TableCell>
                <TableCell>{file.grade}</TableCell>
                <TableCell>
                  {file.isEditing ? (
                    <input
                      type="text"
                      value={file.fileName}
                      onChange={(event) =>
                        handleFileNameChange(event, file.key)
                      }
                    />
                  ) : (
                    file.fileName
                  )}
                </TableCell>
                <TableCell>{file.fileType}</TableCell>
                <TableCell>
                  {file.isEditing ? (
                    <>
                      <Button
                        variant="contained"
                        color="success"
                        onClick={() => handleSaveClick(file.key)}
                      >
                        Save
                      </Button>
                      <Button
                        variant="contained"
                        color="warning"
                        onClick={() => {
                          const updatedFiles = files.map((f) =>
                            f.key === file.key
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
                      onClick={() => handleEditClick(file.key)}
                    >
                      Edit
                    </Button>
                  )}
                </TableCell>
                <TableCell>
                  <Button
                    variant="contained"
                    color="error"
                    onClick={() => handleDeleteClick(file.key)}
                  >
                    Delete
                  </Button>
                </TableCell>
                <TableCell>
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
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <Pagination
          count={Math.ceil(files.length / itemsPerPage)}
          page={currentPage}
          onChange={handlePageChange}
        />
      </div>
    </>
  );
}
