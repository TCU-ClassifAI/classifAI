import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Auth } from "aws-amplify";
import styles from './AllFiles.module.css'; // Import CSS module for styling

export default function AllFiles() {
  const [files, setFiles] = useState([]);
  const [userId, setUserId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userObj, setUserObj] = useState({
    name: '',
    username: '',
    school: '',
    grade_level: '',
    state: '',
    zip: '',
  });

  useEffect(() => {
    async function retrieveUserInfo(){
        try {
            const user = await Auth.currentAuthenticatedUser();
            const { attributes } = user;
            setUserObj({
                name: attributes.name,
                username: attributes.email,
                school: attributes['custom:school'],
                grade_level: attributes['custom:grade_level'],
                state: attributes['custom:state'],
                zip: attributes['custom:zip'],
            });
            setUserId(attributes.email);
            console.log(attributes.email); // Ensure userId is set correctly
        } catch (error) {
            console.error('Error fetching user data:', error);
        }
    }

    retrieveUserInfo();
  }, []);

  useEffect(() => {
    const fetchUserFiles = async () => {
      try {
        if (userId) {
          const response = await axios.get(`http://localhost:5000/files/users/${userId}`);
          setFiles(response.data);
        }
      } catch (error) {
        console.error('Error fetching user files:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserFiles();
  }, [userId]);

  if (isLoading) {
    return (
      <div className={styles.tableContainer}> {/* Use className with the CSS module */}
        <h2>User Files</h2>
        <table className={styles.loadingTable}> {/* Use className with the CSS module */}
          <thead>
            <tr>
              <th>Filename</th>
              <th>Report ID</th>
              <th>File</th>
            </tr>
          </thead>
        </table>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className={styles.tableContainer}> {/* Use className with the CSS module */}
      <h2>User Files</h2>
      <table className={styles.prettyTable}> {/* Use className with the CSS module */}
        <thead>
          <tr>
            <th>Filename</th>
            <th>Report ID</th>
            <th>File</th>
          </tr>
        </thead>
        <tbody>
          {files.map((file, index) => (
            <tr key={index}>
              <td>{file.fileName}</td>
              <td>{file.reportId}</td>
              <td>{file.file}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
