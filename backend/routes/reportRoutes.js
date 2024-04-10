const express = require("express");
const dbconnect = require("../mongo.js");
const router = express.Router();
const fsPromises = require("fs").promises;
const path = require("path");
const axios = require("axios"); // Import axios for HTTP requests

//////////////// GET

// GET all reports
// TODO: fileType query
router.get("/", async (req, res) => {
  // (/files)
  try {
    let fileTypes = req.query.fileType;
    if (fileTypes && !Array.isArray(fileTypes)) {
      fileTypes = [fileTypes];
    }

    let filesResponse = [];

    const reports = await dbconnect.getAllReportsWhere({});

    if (!reports || reports.length === 0) {
      const blankReport = {
        userId: '',
        reportId: '',
        reportName: '',
        subject: '',
        gradeLevel: '',
        status: '',
        fileName: '',
        fileType: '',
      };
      filesResponse.push(blankReport)
     
      return res.status(200).json(filesResponse);
    }
    else {
      reports.forEach((report) => {
        const filteredFiles = report.files.filter((file) =>
          fileTypes
            ? fileTypes.some((fileType) => file.fileType.includes(fileType))
            : true
        );
  
        
        if (filteredFiles.length > 0) {
          filesResponse.push({
            userId: report.userId,
            reportName: report.reportName,
            reportId: report.reportId,
            file: filteredFiles.map((file) => file.filePath),
            gradeLevel: report.gradeLevel,
            subject: report.subject,
            fileName: filteredFiles.map((file) => file.fileName),
            transferData: report.transferData, //added 2/5
          });
        }
      });
  
      if (filesResponse.length === 0) {
        return res
          .status(404)
          .send("No files found matching the specified types.");
      }
    }

    
    

    res.status(200).json(filesResponse);
  } catch (error) {
    res.status(500).send(`Error fetching files: ${error.message}`);
  }
});

// GET all reports from a specific user
router.get("/users/:userId", async (req, res) => {
  try {
    let fileTypes = req.query.fileType;
    if (fileTypes && !Array.isArray(fileTypes)) {
      fileTypes = [fileTypes];
    }

    const query = { userId: req.params.userId };
    const reports = await findAllReports(query, res); // Pass the userId directly
    if (!reports) return;

    let filesResponse = [];
    reports.forEach((report) => {
      const filteredFiles = report.files.filter((file) =>
        fileTypes
          ? fileTypes.some((fileType) => file.fileType.includes(fileType))
          : true
      );

      if (filteredFiles.length > 0) {
        filesResponse.push({
          userId: report.userId,
          reportName: report.reportName,
          reportId: report.reportId,
          file: filteredFiles.map((file) => file.filePath),
          gradeLevel: report.gradeLevel,
          subject: report.subject,
          fileName: filteredFiles.map((file) => file.fileName),
          transferData: report.transferData,
          audioFile: report.audioFile,
        });
      }
    });

    // if (filesResponse.length === 0) {
    //   return res
    //     .status(404)
    //     .send("No files found matching the specified types.");
    // }

    res.status(200).json(filesResponse);
  } catch (error) {
    if (!res.headersSent) {
      res
        .status(500)
        .json({ success: false, message: "An unexpected error occurred" });
    }
  }
});

// GET a specific report from a specific user
router.get("/:reportId/users/:userId", async (req, res) => { //?categorize=true
  try {
    const query = { reportId: req.params.reportId, userId: req.params.userId };
    let reports = await findAllReports(query, res);

    if (!reports) return;

    // Query workstation for "in progress" transfers and update
    // Returns llm info
    reports = await updateTransferDataStatus(reports);

    res.json({ success: true, reports: reports });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "An error occurred" });
  }
});

// GET all reports with a reportId
router.get("/:reportId", async (req, res) => {
  try {
    const query = { reportId: req.params.reportId };
    const reports = await findAllReports(query, res);
    if (!reports) return;
    res.json({ success: true, reports: reports });
  } catch (error) {
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
router.put("/:reportId/users/:userId", async (req, res) => {
  const { reportId, userId } = req.params; // Extract reportId and userId from URL parameters
  // working 4/8 const { result, categorized, summary, ...reportData } = req.body; // Extract the new transferData.result array and any other report data

  const updates = req.body;

  // Initialize an object to construct the $set operation
  let updateOperations = {};

  // Iterate through the keys of the updates object to handle nested updates
  for (const [key, value] of Object.entries(updates)) {
    // If the key indicates a nested field (e.g., "transferData.status"), 
    // we directly use it in the $set operation
    if (key.includes('.')) {
      updateOperations[key] = value;
    } else {
      // For top-level fields, prepend the key with the parent object 
      // if it's meant to update a nested field within transferData
      if (key.startsWith("transferData")) {
        updateOperations[`transferData.${key}`] = value;
      } else {
        // For other top-level updates, just set them as they are
        updateOperations[key] = value;
      }
    }
  }

  try {    
    const updatedReport = await dbconnect.updateReport(
      { reportId, userId },
      { $set: updateOperations }
    );


    if (!updatedReport) {
      return res.status(404).json({ success: false, message: "Report not found." });
    }

    // Return the updated report
    res.json({
      success: true,
      message: "Report updated successfully.",
      report: updatedReport,
    });
  } catch (error) {
    console.error("Error updating report:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred while updating the report.",
    });
  }
});
////////////////////////////////

//////////////// DELETE

// DELETE a specific report created by a specific user
router.delete("/:reportId/users/:userId", async (req, res) => {
  const { reportId, userId } = req.params;

  try {
    // First, ensure the report exists and belongs to the user making the request
    const report = await dbconnect.getReportWhere({
      reportId: reportId,
      userId: userId,
    });
    if (!report) {
      return res.status(404).json({
        success: false,
        message: "Report not found or does not belong to the user.",
      });
    }

    // If the report exists and matches the user, proceed to delete
    const deletionResult = await dbconnect.deleteReport(reportId);
    if (!deletionResult) {
      // If for some reason the deletion did not succeed, send an error response
      return res
        .status(500)
        .json({ success: false, message: "Failed to delete the report." });
    }

    // Respond to the client that the report was successfully deleted
    res.json({ success: true, message: "Report deleted successfully." });
  } catch (error) {
    console.error("Error deleting report:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred while deleting the report.",
    });
  }
});

////////////////////////////////

//////////////// Helper Functions

// Helper function to find and handle report retrieval
async function findAllReports(query, res) {
  try {
    const reports = await dbconnect.getAllReportsWhere(query); // Corrected usage
    if (!reports) {
      // Check if the reports array is empty
      const blankReport = {
        userId: '',
        reportId: '',
        reportName: '',
        subject: '',
        gradeLevel: '',
        status: '',
        fileName: '',
        fileType: '',
      };
      filesResponse.push(blankReport)
     
      return res.status(200).json(filesResponse);
    }
    return reports;
  } catch (error) {
    console.error("Error finding reports:", error);
    res.status(500).json({
      success: false,
      message: "An error occurred while retrieving reports.",
    });
    return null;
  }
}

// Helper function to update the status of transferData objects
async function updateTransferDataStatus(reports) {
  for (let report of reports) {
    if (report.transferData.status != "finished") {
      try {
        const response = await axios.get(
          `${process.env.WORKSTATION_URL}/analyze`,//transcription/get_transcription_status`,
          {
            params: {
              job_id: report.transferData.job_id,
            },
          }
        );

        // Update report.transferData with the new response structure
        if (response.data.meta) {
          console.log(response.data.meta);
          report.transferData = { ...report.transferData, ...response.data.meta };
        }

        // Store these in report.transferData.categorized   or .summary  or .transcript
        if (response.data.result) {
          report.transferData["categorized"] = response.data.result.questions;
          report.transferData["result"] = response.data.result.transcript;
          report.transferData["summary"] = response.data.result.summary;          
        }


        if (response.data.meta.title){
          report.audioFile = response.data.meta.title +' YouTube';

          // if not already existing, then push to mongo db report.files[]

          report.files[0]={
            fileName: response.data.meta.title,
            filePath: 'testLink',
            fileType: 'YouTube',
          };
        }


      } catch (error) {
        console.error(
          "Error querying workstation for job_id:",
          report.transferData.job_id,
          error
        );
      }

      // Save updated report to the database
      await dbconnect.updateReport(
        { reportId: report.reportId, userId: report.userId },
        report
      );
    }
  }
  return reports; // Return updated reports
}



module.exports = router;

