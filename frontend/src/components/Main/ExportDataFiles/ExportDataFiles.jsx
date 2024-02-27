import React, { useState, useEffect } from "react";
import axios from "axios";
import { Auth } from "aws-amplify";
import styles from "./ExportDataFiles.module.css";
import ReactPaginate from "react-paginate";
import ErrorModal from "../../Common/ErrorModal";

export default function ExportDataFiles() {
  const [files, setFiles] = useState([]);
  const [userId, setUserId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0); // Changed initial page to 0
  const [itemsPerPage] = useState(10);
  const [oldFileNameEditing, setOldFileNameEditing] = useState("");
  const [showErrorModal, setShowErrorModal] = useState(false);


  useEffect(() => {
    async function retrieveUserInfo() {
      try {
        const user = await Auth.currentAuthenticatedUser();
        const { attributes } = user;
        setUserId(attributes.email);
      } catch (error) {
        console.error("Error fetching user data:", error);
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
        `http://localhost:5001/files/users/${userId}?fileType=csv&fileType=pdf`
      );
      const flattenedData = response.data.reduce((acc, obj) => {
        obj.file.forEach((file, index) => {
          const lastDotIndex = file.lastIndexOf('.');
          const fileExtension = file.substring(lastDotIndex + 1);
          acc.push({
            key: `${obj.reportId}_${index}`, // Use reportId and index as a key
            userId: obj.userId,
            reportId: obj.reportId,
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
    } finally {
      setIsLoading(false);
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
        `http://localhost:5001/files/${oldFileName}/reports/${reportId}/users/${userId}`,
        {
          fileName: newFileName,
        }
      );

      setFiles(updatedFiles);
      console.log("Update Success");
      fetchUserFiles();
    } catch (error) {
      console.error("Error updating file name:", error);
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
          `http://localhost:5001/files/${fileNameToDelete}/reports/${reportId}/users/${userId}`
        );

        const updatedFiles = files.filter((file) => file.key !== key);
        setFiles(updatedFiles);
        console.log("Delete Success");
      } catch (error) {
        console.error("Error deleting file:", error);
      }
    }
  };

  const handleDownloadClick = async (reportId, fileName, fileType) => {
    try {
      const response = await axios.get(
        `http://localhost:5001/files/${fileName}/reports/${reportId}/users/${userId}?download=true`,
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
    }
  };

  const indexOfLastItem = (currentPage + 1) * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = files.slice(indexOfFirstItem, indexOfLastItem);

  const handlePageClick = ({ selected }) => {
    setCurrentPage(selected);
  };

  if (isLoading) {
    return (
      <div className={styles.tableContainer}>
        <h2>Exported Data Files</h2>
        <table className={styles.loadingTable}>
          <thead>
            <tr>
              <th>Report ID</th>
              <th>File Name</th>
              <th>File</th>
              <th>Edit</th>
              <th>Delete</th>
              <th>Download</th> {/* Added new tab for Download */}
            </tr>
          </thead>
        </table>
        <p>Loading...</p>
      </div>
    );
  }

  const handleCloseErrorModal = () => {
    setShowErrorModal(false);
  };

  return (
    <>
      <ErrorModal 
        message={"There was an error fetching user files from the database!"}
        showErrorModal={showErrorModal}
        handleCloseErrorModal={handleCloseErrorModal}
      />
      <div className={styles.tableContainer}>
        <h2>Exported Data Files</h2>
        <table className={styles.prettyTable}>
          <thead>
            <tr>
              <th>Report ID</th>
              <th>Report Name</th>
              <th>File Name</th>
              <th>File Type</th>
              <th>Edit</th>
              <th>Delete</th>
              <th>Download</th> {/* Added new tab for Download */}
            </tr>
          </thead>
          <tbody>
            {currentItems.map((file, index) => (
              <tr key={file.key}>
                <td>{file.reportId}</td>
                <td>{file.reportName}</td>
                <td>
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
                </td>
                <td>{file.fileType}</td>
                <td className={styles.csvButton}>
                  {file.isEditing ? (
                    <>
                      <button
                        className={styles.saveButton}
                        onClick={() => handleSaveClick(file.key)}
                      >
                        Save
                      </button>
                      <button
                        className={styles.cancelButton}
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
                      </button>
                    </>
                  ) : (
                    <button
                      className={styles.editButton}
                      onClick={() => handleEditClick(file.key)}
                    >
                      Edit
                    </button>
                  )}
                </td>
                <td>
                  <button
                    className={styles.deleteButton}
                    onClick={() => handleDeleteClick(file.key)}
                  >
                    Delete
                  </button>
                </td>
                <td>
                  <button
                    className={styles.downloadButton}
                    onClick={() =>
                      handleDownloadClick(
                        file.reportId,
                        file.fileName,
                        file.fileType
                      )
                    }
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
