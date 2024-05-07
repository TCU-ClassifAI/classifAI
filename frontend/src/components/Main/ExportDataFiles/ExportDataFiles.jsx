import React, { useState, useEffect } from "react";
import axios from "axios";
import { Auth } from "aws-amplify";
import ErrorModal from "../../Common/ErrorModal";
import { DataGrid } from "@mui/x-data-grid";
import { Button, Alert, TextField, Tooltip } from "@mui/material";

export default function ExportDataFiles() {
  const [files, setFiles] = useState([]);
  const [userId, setUserId] = useState(null);
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
            id: `${obj.reportId}_${index}`,
            userId: obj.userId,
            reportId: obj.reportId,
            subject: obj.subject,
            grade: obj.gradeLevel,
            audioDate: audioDate,
            reportName: obj.reportName,
            fileName: obj.fileName[index],
            fileType: fileExtension,
            isEditing: false,
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

  const handleFileNameChange = (event, id) => {
    const updatedFiles = files.map((file) =>
      file.id === id ? { ...file, fileName: event.target.value } : file
    );
    setFiles(updatedFiles);
  };

  const handleEditClick = (id) => {
    const updatedFiles = files.map((file) =>
      file.id === id ? { ...file, isEditing: true } : file
    );
    setOldFileNameEditing(files.find((file) => file.id === id).fileName);
    setFiles(updatedFiles);
  };

  const handleSaveClick = async (id) => {
    const updatedFiles = files.map((file) =>
      file.id === id ? { ...file, isEditing: false } : file
    );
    const fileToUpdate = files.find((file) => file.id === id);
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

  const handleDeleteClick = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this file?"
    );
    if (confirmDelete) {
      const fileToDelete = files.find((file) => file.id === id);
      const { fileName: fileNameToDelete, reportId } = fileToDelete;

      try {
        await axios.delete(
          `${import.meta.env.VITE_BACKEND_SERVER}/files/${fileNameToDelete}/reports/${reportId}/users/${userId}`
        );

        setEditSaveSuccess(true);
        setAlertMsg("File successfully deleted!");
        const updatedFiles = files.filter((file) => file.id !== id);
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
          responseType: "blob",
        }
      );

      const blob = new Blob([response.data], {
        type: response.headers["content-type"],
      });

      const url = window.URL.createObjectURL(blob);
      const fileExtension = fileType === "csv" ? ".csv" : ".pdf";
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


  const columns = [
    { 
      field: "reportName", 
      headerName: "Report Name", 
      sortable: true , 
      width: 175, 
      renderCell: (params) => (
        <Tooltip title={params.value}>
          <span>{params.value}</span>
        </Tooltip>
      )
    },
    { 
      field: "audioDate", 
      headerName: "Audio Date", 
      sortable: true, 
      width: 175,
      renderCell: (params) => (
        <Tooltip title={params.value}>
          <span>{params.value}</span>
        </Tooltip>
      )
    },
    { 
      field: "subject", 
      headerName: "Subject", 
      sortable: true, 
      width: 175,
      renderCell: (params) => (
        <Tooltip title={params.value}>
          <span>{params.value}</span>
        </Tooltip>
      )
    },
    { 
      field: "grade", 
      headerName: "Grade", 
      sortable: true, 
      width: 100,
      renderCell: (params) => (
        <Tooltip title={params.value}>
          <span>{params.value}</span>
        </Tooltip>
      )
    },
    {
        field: "fileName",
        headerName: "File Name",
        sortable: true,
        width: 200,
        renderCell: (params) => (
            params.row.isEditing ? (
                <TextField
                    value={params.row.fileName}
                    onChange={(event) => handleFileNameChange(event, params.row.id)}
                    onKeyDown={(e) => e.stopPropagation()}
                />
            ) : (
              <Tooltip title={params.value}>
              <span>{params.value}</span>
            </Tooltip>
            )
        ),
    },
    { field: "fileType", headerName: "File Type" },
    {
        field: "edit",
        headerName: "Edit",
        width: 100,
        renderCell: (params) => (
            <Button
                variant="contained"
                color={params.row.isEditing ? "success" : "primary"}
                onClick={() => params.row.isEditing ? handleSaveClick(params.row.id) : handleEditClick(params.row.id)}
            >
                {params.row.isEditing ? "Save" : "Edit"}
            </Button>
        ),
    },
    {
        field: "delete",
        headerName: "Delete",
        width: 100,
        renderCell: (params) => (
            <Button
                variant="contained"
                color="error"
                onClick={() => handleDeleteClick(params.row.id)}
            >
                Delete
            </Button>
        ),
    },
    {
        field: "download",
        headerName: "Download",
        width: 130,
        renderCell: (params) => (
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
                Download
            </Button>
        ),
    },
];


  return (
    <>
      <ErrorModal
        message={errorModalMsg}
        showErrorModal={showErrorModal}
        handleCloseErrorModal={() => setShowErrorModal(false)}
      />
      {editSaveSuccess && (
        <div>
          <Alert severity="success">{alertMsg}</Alert>
        </div>
      )}
      <p>You may click on the column headers to sort, filter, search, or manage columns.</p>
      <p>Hidden text can be viewed by hovering your mouse over them or by resizing the column.</p>
      <div style={{ height: 527}}>
        <DataGrid
          rows={files}
          columns={columns}
          autoWidth
          autoPageSize={true}
          disableRowSelectionOnClick
        />
      </div>
    </>
  );
}