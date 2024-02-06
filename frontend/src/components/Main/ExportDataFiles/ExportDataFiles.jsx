import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Auth } from "aws-amplify";
import styles from './ExportDataFiles.module.css'; // Import CSS module for styling

export default function ExportDataFiles() {
  const [files, setFiles] = useState([]);
  const [userId, setUserId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10); // Number of items to display per page
  const [oldFileNameEditing, setOldFileNameEditing] = useState("");

  useEffect(() => {
    async function retrieveUserInfo() {
      try {
        const user = await Auth.currentAuthenticatedUser();
        const { attributes } = user;
        setUserId(attributes.email);
        console.log(attributes.email); // Ensure userId is set correctly
      } catch (error) {
        console.error('Error fetching user data:', error);
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
      const response = await axios.get(`http://localhost:443/files/users/${userId}?fileType=csv&fileType=pdf`);
      // Flatten the data structure to ensure each row contains one file
      const flattenedData = response.data.reduce((acc, obj) => {
        obj.file.forEach((file, index) => {
          acc.push({
            userId: obj.userId,
            reportId: obj.reportId,
            file: file,
            fileName: obj.fileName[index]
          });
        });
        return acc;
      }, []);
      setFiles(flattenedData);
    } catch (error) {
      console.error('Error fetching user files:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileNameChange = (event, index) => {
    const updatedFiles = [...files];
    updatedFiles[index].fileName = event.target.value;
    setFiles(updatedFiles);
  };

  const handleEditClick = (index) => {
    const updatedFiles = [...files];
    updatedFiles[index].isEditing = true;
    setOldFileNameEditing(updatedFiles[index].fileName); // Save the current value to oldFileNameEditing
    setFiles(updatedFiles);
  };

  const handleSaveClick = async (index) => {
    const updatedFiles = [...files];
    const fileToUpdate = updatedFiles[index];
    const { fileName: newFileName, reportId } = fileToUpdate;
    const oldFileName = oldFileNameEditing || newFileName; // Use oldFileNameEditing if available, otherwise use the current file name

    try {
      // Make a PUT request to update the file name
      await axios.put(`http://localhost:443/files/${oldFileName}/reports/${reportId}/users/${userId}`, {
        fileName:newFileName, // Put the new file name in the request body
      });

      // Update the file name in the state
      fileToUpdate.fileName = newFileName;
      fileToUpdate.isEditing = false;
      setFiles(updatedFiles);
      console.log('Update Success');
      
      // Refetch user files after save
      fetchUserFiles(); // Now fetchUserFiles is accessible here
    } catch (error) {
      console.error('Error updating file name:', error);
      // Optionally handle error here
    }
  };

  // Logic for pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = files.slice(indexOfFirstItem, indexOfLastItem);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  if (isLoading) {
    return (
      <div className={styles.tableContainer}>
        <h2>Exported Data Files</h2>
        <table className={styles.loadingTable}>
          <thead>
            <tr>
              <th>Report ID</th>
              <th>Filename</th>
              <th>File</th>
            </tr>
          </thead>
        </table>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className={styles.tableContainer}>
      <h2>Exported Data Files</h2>
      <table className={styles.prettyTable}>
        <thead>
          <tr>
            <th>Report ID</th>
            <th>Filename</th>
            <th>File</th>
            <th>Edit</th>
          </tr>
        </thead>
        <tbody>
          {currentItems.map((file, index) => (
            <tr key={index}>
              <td>{file.reportId}</td>
              <td>
                {file.isEditing ? (
                  <input
                    type="text"
                    value={file.fileName}
                    onChange={(event) => handleFileNameChange(event, index)}
                  />
                ) : (
                  file.fileName
                )}
              </td>
              <td>{file.file}</td>
              <td>
                {file.isEditing ? (
                  <>
                    <button className={styles.saveButton} onClick={() => handleSaveClick(index)}>Save</button>
                    <button className={styles.cancelButton} onClick={() => {
                      const updatedFiles = [...files];
                      updatedFiles[index].isEditing = false;
                      updatedFiles[index].fileName = oldFileNameEditing; // Revert back to old value
                      setFiles(updatedFiles);
                    }}>Cancel</button>
                  </>
                ) : (
                  <button className={styles.editButton} onClick={() => handleEditClick(index)}>Edit</button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {/* Pagination */}
      <ul className="pagination">
        {Array.from({ length: Math.ceil(files.length / itemsPerPage) }, (_, i) => (
          <li key={i} className="page-item">
            <button onClick={() => paginate(i + 1)} className="page-link">
              {i + 1}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
