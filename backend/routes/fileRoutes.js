const express = require("express");
const dbconnect = require('../mongo.js');
const router = express.Router();
const fsPromises = require('fs').promises;
const path = require('path');


//////////////// GET
// Get all export data files from all users
router.get('/', async (req, res) => { // (/files)
  try {
    // Fetch reports from all users
    const reports = await dbconnect.getAllReportsWhere({}); // Empty query to get all

    if (!reports || reports.length === 0) {
      return res.status(404).send('No reports found.');
    }

    // Process and structure the response
    let filesResponse = reports.map(report => ({
      userId: report.userID,
      reportId: report.reportID,
      file: report.files.map(file => file.filePath),
      gradeLevel: report.gradeLevel,
      subject: report.subject,
      fileName: report.files.map(file => file.fileName)
    }));

    // Send the response
    res.status(200).json(filesResponse);
  } catch (error) {
    res.status(500).send(`Error fetching files: ${error.message}`);
  }
});


// Get all export data files created by a specific user   //implement 400/404
router.get('/users/:userId', async (req, res) => {   //   (/files/users/:userId)
  try {
    // Extract userId from the request parameters
    const { userId } = req.params;

    // Fetch reports for the specified user
    const reports = await dbconnect.getAllReportsWhere({ userID: userId });

    if (!reports || reports.length === 0) {
      return res.status(404).send('No reports found for this user.');
    }

    // Process and structure the response
    let filesResponse = reports.map(report => ({
      userId: report.userID,
      reportId: report.reportID,
      file: report.files.map(file => file.filePath),
      gradeLevel: report.gradeLevel,
      subject: report.subject,
      fileName: report.files.map(file => file.fileName)
    }));

    // Send the response
    res.status(200).json(filesResponse);
  } catch (error) {
    res.status(500).send(`Error fetching files: ${error.message}`);
  }
});

////////////////////////////////





module.exports = router;