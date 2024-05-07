import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { Auth } from "aws-amplify";
import styles from "./MyReports.module.css";
import ErrorModal from "../../Common/ErrorModal";
import Alert from "@mui/material/Alert";
import { DataGrid } from "@mui/x-data-grid";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import { Tooltip } from "@mui/material";

export default function MyReports() {
  const [files, setFiles] = useState([]);
  const [userId, setUserId] = useState(null);
  const [itemsPerPage] = useState(7);
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

  const fetchUserFiles = useCallback(async () => {
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
          id: report.reportId,
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
  }, [userId]);

  useEffect(() => {
    fetchUserFiles();
  }, [fetchUserFiles]);

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

  const handleGradeChange = (event, key) => {
    if (event.key === "Tab" || event.key === " ") {
      event.stopPropagation();
    }
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
      <p>
        You may click on the column headers to sort, filter, search, or manage
        columns.
      </p>
      <p>
        Hidden text can be viewed by hovering your mouse over them or by
        resizing the column.
      </p>
      <div style={{ height: 527, width: "100%" }}>
        <DataGrid
          rows={files}
          columns={[
            {
              field: "reportName",
              headerName: "Report Name",
              sortable: true,
              width: 200,
              renderCell: (params) =>
                params.row.isEditing ? (
                  <TextField
                    value={params.row.reportName}
                    onChange={(event) =>
                      handleReportNameChange(event, params.row.id)
                    }
                    onKeyDown={(e) => e.stopPropagation()}
                  />
                ) : (
                  <Tooltip title={params.value}>
                    <span>{params.value}</span>
                  </Tooltip>
                ),
            },
            {
              field: "audioDate",
              headerName: "Audio Date/Time",
              width: 175,
              renderCell: (params) => (
                <Tooltip title={params.value}>
                  <span>{params.value}</span>
                </Tooltip>
              ),
            },
            {
              field: "subject",
              headerName: "Subject",
              sortable: true,
              width: 150,
              renderCell: (params) =>
                params.row.isEditing ? (
                  <TextField
                    value={params.row.subject}
                    onChange={(event) =>
                      handleSubjectChange(event, params.row.id)
                    }
                    onKeyDown={(e) => e.stopPropagation()}
                  />
                ) : (
                  <Tooltip title={params.value}>
                    <span>{params.value}</span>
                  </Tooltip>
                ),
            },
            {
              field: "gradeLevel",
              headerName: "Grade",
              sortable: true,
              width: 125,
              renderCell: (params) =>
                params.row.isEditing ? (
                  <TextField
                    value={params.row.gradeLevel}
                    onChange={(event) =>
                      handleGradeChange(event, params.row.id)
                    }
                    onKeyDown={(e) => e.stopPropagation()}
                  />
                ) : (
                  <Tooltip title={params.value}>
                    <span>{params.value}</span>
                  </Tooltip>
                ),
            },
            {
              field: "fileName",
              headerName: "Audio File",
              width: 200,
              renderCell: (params) => (
                <Tooltip title={params.value}>
                  <span>{params.value}</span>
                </Tooltip>
              ),
            },
            {
              field: "status",
              headerName: "Status",
              width: 150,
              renderCell: (params) => (
                <Tooltip title={params.value}>
                  <span>{params.value}</span>
                </Tooltip>
              ),
            },
            {
              field: "actions",
              headerName: "Actions",
              width: 500,
              renderCell: (params) => (
                <>
                  {params.row.isEditing ? (
                    <>
                      <Button
                        variant="contained"
                        color="success"
                        onClick={() =>
                          handleSaveClick(
                            params.row.reportId,
                            params.row.fileType
                          )
                        }
                      >
                        Save
                      </Button>
                      <Button
                        variant="contained"
                        color="secondary"
                        onClick={() => {
                          const updatedFiles = files.map((f) =>
                            f.reportId === params.row.reportId
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
                      onClick={() => handleEditClick(params.row.reportId)}
                    >
                      Edit
                    </Button>
                  )}
                  <Button
                    variant="contained"
                    color="error"
                    onClick={() => handleDeleteClick(params.row.reportId)}
                  >
                    Delete
                  </Button>
                  <Button variant="contained" color="warning">
                    <Link
                      to="../analyze"
                      state={{
                        reportId: params.row.reportId,
                      }}
                      className={styles.loadLink}
                    >
                      Load
                    </Link>
                  </Button>
                  {params.row.fileType === "youtube" ? (
                    <a
                      href={params.row.link}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Button variant="contained" color="secondary">
                        Youtube Link
                      </Button>
                    </a>
                  ) : (
                    <Button
                      variant="contained"
                      color="secondary"
                      onClick={() =>
                        handleDownloadClick(
                          params.row.reportId,
                          params.row.fileName,
                          params.row.fileType
                        )
                      }
                    >
                      Download Audio
                    </Button>
                  )}
                </>
              ),
            },
          ]}
          pagination
          pageSize={itemsPerPage}
          autoPageSize={true}
          disableRowSelectionOnClick
        />
      </div>
    </>
  );
}
