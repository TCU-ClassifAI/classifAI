const express = require("express");
const dbconnect = require('../mongo.js');
const router = express.Router();
const fsPromises = require('fs').promises;
const path = require('path');

////////// Create operations (uses /upload in uploadRoute.js)



///////// Read operations

// (Read) Get All Files in a Report
router.get('/list/:reportID', checkReportExists, (req, res) => {
    res.json({ success: true, files: req.report.files });
});

// (Read) Get All Files in a Report by fileType
router.get('/list/:reportID/:fileType', checkReportExists, (req, res) => {
  const fileType = req.params.fileType;
  const filteredFiles = req.report.files.filter(file => file.fileType === fileType);

  if (filteredFiles.length === 0) {
      return res.status(404).json({ success: false, message: 'No files found with the specified fileType.' });
  }
  res.json({ success: true, files: filteredFiles });
});

// (Read) Get Specific File
router.get('/:reportID/:fileName', checkReportExists, (req, res) => {
    const file = req.report.files.find(f => f.fileName === req.params.fileName);
    if (!file) {
        return res.status(404).json({ success: false, message: 'File not found.' });
    }
    res.json({ success: true, file: file });
});

///////////////////////////



///////// Update Operations

// (Update) PUT - Modifying an Existing File in a Report
router.put('/update/:reportID/:fileName', checkReportExists, async (req, res) => {
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
router.delete('/delete/:reportID/:fileName', checkReportExists, (req, res) => {
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

///////////////////////////



module.exports = router;
