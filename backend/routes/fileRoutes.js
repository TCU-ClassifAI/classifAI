const express = require("express");
const dbconnect = require('../mongo.js');
const router = express.Router();
const fsPromises = require('fs').promises;
const path = require('path');

////////// Create operations (uses /upload in uploadRoute.js)

      // /users/{userId}/files/ and it should get all csv and  pdf also return the reportID where files come from.
      // /users/{userId}/files/{fileName} for single file and
      // /users/{userId}/reports/ doesn’t contain csv nor pdf, just srt and audio

///////// Read operations

// (Read) Get All Files from all Reports, allows for optional querying of one or mulitple file types.
router.get('/:userID/files', async (req, res) => {   
  
  try {
    // Extract userID from the request parameters
    const { userID } = req.params;
    let fileTypes = req.query.fileType;

    // Optional file type query (e.g., 'csv', 'pdf', etc.)
    if (fileTypes && !Array.isArray(fileTypes)) {
      fileTypes = [fileTypes];
    }

    // Find reports associated with the userID
    const reports = await dbconnect.getAllReportsWhere({ userID });

    if (!reports) {
      return res.status(404).send('No reports found for this user.');
    }

    const reportsArray = Array.isArray(reports) ? reports : [reports];
    if (!reportsArray || reportsArray.length === 0) {
      return res.status(404).send('No reports found for this user.');
    }

    // Create an array to hold the file information from each report
    let filesResponse = [];

    reports.forEach(report => {
      if (report && report.files && report.files.length > 0) {
        let filteredFiles = report.files;

        // If fileTypes are specified, filter files by those types
        if (fileTypes && fileTypes.length > 0) {
          filteredFiles = filteredFiles.filter(file => fileTypes.includes(file.fileType));
        }

        // For each report, create an object with reportID and its filtered files
        if (filteredFiles.length > 0) {
          filesResponse.push({
            reportID: report.reportID,
            files: filteredFiles
          });
        }
      }
    });

    // Send the collected files as a response
    res.json({ success: true, files: filesResponse });
  } 
  catch (error) {
    res.status(500).send(`Error fetching files: ${error.message}`);
  }
  
});


// /users/{userId}/files/{fileName} for single file and
// (Read) Get matching File/s if reportID not provided
router.get('/:userID/files/:fileName', async (req, res) => { 
  // find file with fileName from userID's reports
  try {
    const { userID, fileName } = req.params;

    // Fetch all reports for the user
    const reports = await dbconnect.getAllReportsWhere({ userID });

    if (!reports || reports.length === 0) {
      return res.status(404).send('No reports found for this user.');
    }

    // Array to store all matching files
    let matchingFiles = [];

    // Iterate through reports to find all files matching the fileName
    reports.forEach(report => {
      if (report.files && report.files.length > 0) {
        report.files.forEach(file => {
          if (file.fileName === fileName) {
            matchingFiles.push({ reportID: report.reportID, file: file });
          }
        });
      }
    });

    if (matchingFiles.length === 0) {
      return res.status(404).send('No matching files found.');
    }

    // Return the file information and the reportID it belongs to
    res.json({matchingFiles: matchingFiles});
  } 
  catch (error) {
    res.status(500).send(`Error fetching file: ${error.message}`);
  }

});


// (Read) Get Specific File if reportID provided
router.get('/:userID/reports/:reportId/files/:fileName', async (req, res) => {  
  // find file with fileName from userID's reports
  
  try {
    const { userID, reportId, fileName } = req.params;
    

    // Fetch the specific report for the user
    const report = await dbconnect.getReport(reportId);

    if (!report || report.userID !== userID) {
      return res.status(404).send('Report not found for this user.');
    }

    // Find the file with the specified fileName in the report
    const file = report.files.find(f => f.fileName === fileName);

    if (!file) {
      return res.status(404).send('File not found in the report.');
    }

    // Return the file information and the reportID it belongs to
    res.json({ reportID: reportId, file: file });
  } catch (error) {
    res.status(500).send(`Error fetching file: ${error.message}`);
  }

});



// (Read) Get All Files in a Report with an optional file filter
router.get('/:userID/reports/:reportID/files', async (req, res) => {   
  try {
    // Extract userID and reportID from the request parameters
    const { userID, reportID } = req.params;

    // Optional file type query (e.g., 'csv', 'pdf', etc.)
    let fileTypes = [].concat(req.query.fileType || []);

    const report = await dbconnect.getReport(reportID);
    if (!report || report.userID !== userID) {
      return res.status(404).send('Report not found for this user.');
    }

    let filesResponse = report.files || [];
    
    // Apply file type filter if specified
    if (fileTypes.length > 0) {
      filesResponse = filesResponse.filter(file => fileTypes.includes(file.fileType));
    }

    res.json({ success: true, files: filesResponse });
  } catch (error) {
    res.status(500).send(`Error fetching files: ${error.message}`);
  }


});



// /users/{userId}/reports/ doesn’t contain csv nor pdf, just srt and audio
router.get('/:userID/reports/:reportId', async (req, res) => {  // redo, 
  // find file with fileName from userID's reports
  // return transcription and file with file type that contains 'audio'
  
  try {
    const { userID, reportId } = req.params;

    // Fetch the specific report for the user
    const report = await dbconnect.getReport(reportId);

    if (!report || report.userID !== userID) {
      return res.status(404).send('Report not found for this user.');
    }

    // Find files that contain audio fileType in the report
    const audioFiles = report.files.filter(file => file.fileType.includes('audio'));

    // Prepare the response with the transcription and audio files
    const response = {
      transcription: report.transcription || "No transcription available",
      audioFiles: audioFiles
    };

    res.json(response);
  } catch (error) {
    res.status(500).send(`Error fetching file: ${error.message}`);
  }

});




///////////////////////////



///////// Update Operations

// (Update) PUT - Modifying an Existing File in a Report
router.put('/:reportID/:fileName', checkReportExists, async (req, res) => {
    const { reportID, fileName } = req.params;
    const newData = req.body;

    // Ensure newFileName is provided and is not empty
    if (!newData.fileName || typeof newData.fileName !== 'string' || newData.fileName.trim() === '') {
      return res.status(400).json({ success: false, message: 'New file name not provided or is invalid.' });
  }
    
    const file = req.report.files.find(f => f.fileName === fileName);
    if (!file) {
        return res.status(404).json({ success: false, message: 'File not found.' });
    }

    try {
      // Rename file on the server
      const oldPath = file.filePath;
      const newFileName = newData.fileName + path.extname(oldPath);
      const newPath = path.join(path.dirname(oldPath), newFileName);
      await fsPromises.rename(oldPath, newPath);

      // Update file details in the database
      Object.assign(file, { fileName: newFileName, filePath: newPath });
      await req.report.save();

      res.json({ success: true, message: 'File updated and renamed successfully.', file: file });
    } 
    catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "An error occurred during the update" });
    };
});

///////////////////////////



///////// Delete Operations

// (Delete) Delete - Remove a File from a Report
router.delete('/:reportID/:fileName', checkReportExists, (req, res) => {
    const { fileName } = req.params;

    req.report.files = req.report.files.filter(file => file.fileName !== fileName);
    
    req.report.save().then(() => {
        res.json({ success: true, message: 'File deleted successfully.', files: req.report.files });
    }).catch(error => {
        console.error(error);
        res.status(500).json({ success: false, message: "An error occurred" });
    });
});

///////////////////////////



///////// Helper Methods

// Check report existence
async function checkReportExists(req, res, next) {
  const report = await dbconnect.getReport(req.params.reportID);
  if (!report) {
      return res.status(404).json({ success: false, message: 'Report not found.' });
  }
  req.report = report; // Passing the report to the next handler
  next();
}




// Find reports
async function findAllReports(req, res, next) {
  const report = await dbconnect.getReportWhere({ userID: req.params.userID });
  if (!report) {
      return res.status(404).json({ success: false, message: 'Report not found.' });
  }
  req.report = report; // Passing the report to the next handler
  next();
}


///////////////////////////



module.exports = router;
