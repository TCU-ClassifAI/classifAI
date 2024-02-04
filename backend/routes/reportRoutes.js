const express = require("express");
const dbconnect = require('../mongo.js');
const router = express.Router();
const fsPromises = require('fs').promises; 
const path = require('path'); 



//////////////// GET

// GET all reports
router.get('/', async (req, res) => { // (/files)
  try {
    let fileTypes = req.query.fileType;

    // Optional file type query (e.g., 'csv', 'pdf', etc.)
    if (fileTypes && !Array.isArray(fileTypes)) {
      fileTypes = [fileTypes];
    }
    
    // Fetch reports from all users
    const reports = await dbconnect.getAllReportsWhere({}); // Empty query to get all

    if (!reports || reports.length === 0) {
      return res.status(404).send('No reports found.');
    }

  // Send the response
  res.json({ success: true, reports: reports });
} catch (error) {
  res.status(500).send(`Error fetching files: ${error.message}`);
}
});


// GET all reports from a specific user
router.get('/users/:userId', async (req, res) => {
  try {
    const query = {userId: req.params.userId};
    const reports = await findAllReports(query, res); // Pass the userId directly
    if (!reports) return; 
    res.json({ success: true, reports: reports });
  } catch (error) {
    if (!res.headersSent) {
      res.status(500).json({ success: false, message: "An unexpected error occurred" });
    }
  }
});


// GET a specific report from a specific user
router.get('/:reportId/users/:userId', async (req, res) => {
  try {
    const query = {reportId: req.params.reportId, userId: req.params.userId};
    const reports = await findAllReports(query, res);
    if (!reports) return;
    res.json({ success: true, reports: reports });
  } 
  catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "An error occurred" });
  }
});


// GET all reports with a reportId
router.get('/:reportId', async (req, res) => {
  try {
    const query = {reportId: req.params.reportId};
    const reports = await findAllReports(query, res);
    if (!reports) return;
    res.json({ success: true, reports: reports });
  } 
  catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "An error occurred" });
  }
});
////////////////////////////////



//////////////// POST

// Located in reportUploadRoute.js

////////////////////////////////



//////////////// PUT

// Update a specific report for a specific user
router.put('/:reportId/users/:userId', async (req, res) => {
  const { reportId, userId } = req.params; // Extract reportId and userId from URL parameters
  const reportData = req.body; // Extract the report data from the request body

  try {
    // Update the report using both userId and reportId to ensure the right report is updated
    const updatedReport = await dbconnect.updateReport({ reportId, userId }, reportData);

    // If no report was found or updated, return a 404 not found
    if (!updatedReport) {
      return res.status(404).json({ success: false, message: 'Report not found.' });
    }

    // Otherwise, return the updated report
    res.json({ success: true, message: 'Report updated successfully.', report: updatedReport });
  } catch (error) {
    console.error('Error updating report:', error);
    res.status(500).json({ success: false, message: 'An error occurred while updating the report.' });
  }
});
////////////////////////////////



//////////////// DELETE

// DELETE a specific report created by a specific user
router.delete('/:reportId/users/:userId', async (req, res) => {
  const { reportId, userId } = req.params;

  try {
    // First, ensure the report exists and belongs to the user making the request
    const report = await dbconnect.getReportWhere({ reportId: reportId, userId: userId });
    if (!report) {
      return res.status(404).json({ success: false, message: 'Report not found or does not belong to the user.' });
    }

    // If the report exists and matches the user, proceed to delete
    const deletionResult = await dbconnect.deleteReport(reportId);
    if (!deletionResult) {
      // If for some reason the deletion did not succeed, send an error response
      return res.status(500).json({ success: false, message: 'Failed to delete the report.' });
    }

    // Respond to the client that the report was successfully deleted
    res.json({ success: true, message: 'Report deleted successfully.' });
  } catch (error) {
    console.error('Error deleting report:', error);
    res.status(500).json({ success: false, message: 'An error occurred while deleting the report.' });
  }
});

////////////////////////////////



//////////////// Helper Functions

// Helper function to find and handle report retrieval
async function findAllReports(query, res) {
  try {
    const reports = await dbconnect.getAllReportsWhere(query); // Corrected usage
    if (reports.length === 0) { // Check if the reports array is empty
      res.status(404).json({ success: false, message: 'No reports found for this user.' });
      return null;
    }
    return reports;
  } 
  catch (error) {
    console.error("Error finding reports:", error);
    res.status(500).json({ success: false, message: 'An error occurred while retrieving reports.' });
    return null;
  }
}


















// // OLD
// //////////// Get Report endpoint
// router.get('/:reportID', async (req, res) => {
//   try {
//     const report = await findReport(req.params.reportID, res);
//     if (!report) return;
//     res.json({ success: true, report: report });


//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ success: false, message: "An error occurred" });
//   }
// });
// ////////////

// // Helper function to find and handle report retrieval
// async function findReport(reportID, res) {
//     const report = await dbconnect.getReport(reportID);
//     if (!report) {
//       res.status(404).json({ success: false, message: 'Report file not found.' });
//       return null;
//     }
//     return report;
// }




module.exports = router;
