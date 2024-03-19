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

    const reports = await dbconnect.getAllReportsWhere({});
    if (!reports || reports.length === 0) {
      return res.status(404).send("No reports found.");
    }

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
          transferData: report.transferData, //added 2/5
        });
      }
    });

    if (filesResponse.length === 0) {
      return res
        .status(404)
        .send("No files found matching the specified types.");
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
        });
      }
    });

    if (filesResponse.length === 0) {
      return res
        .status(404)
        .send("No files found matching the specified types.");
    }

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
router.get("/:reportId/users/:userId", async (req, res) => {
  try {
    const query = { reportId: req.params.reportId, userId: req.params.userId };
    let reports = await findAllReports(query, res);

    if (!reports) return;
    // New functionality: Query workstation for "in progress" transfers and update
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

//TODO: check if transcript update
// Update a specific report for a specific user
// working 3/12
router.put("/:reportId/users/:userId", async (req, res) => {
  //works on server
  const { reportId, userId } = req.params; // Extract reportId and userId from URL parameters
  const { result, ...reportData } = req.body; // Extract the new transferData.result array and any other report data

  try {
    let updatedReport;

    if (result) {
      // If a new transferData.result array is provided, update it directly
      updatedReport = await dbconnect.updateReport(
        { reportId, userId },
        { $set: { "transferData.result": result } } // Update the entire transferData.result array
      );
    } else {
      // Otherwise, update the report with provided reportData
      updatedReport = await dbconnect.updateReport(
        { reportId, userId },
        { $set: reportData } // Ensure to use $set to update fields without replacing the entire document
      );
    }

    // If no report was found or updated, return a 404 not found
    if (!updatedReport) {
      return res
        .status(404)
        .json({ success: false, message: "Report not found." });
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
    if (reports.length === 0) {
      // Check if the reports array is empty
      res
        .status(404)
        .json({ success: false, message: "No reports found for this user." });
      return null;
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
    //for (let transfer of report.transferData) {
    if (report.transferData.status != "finished") {
      try {
        const response = await axios.get(
          `${process.env.WORKSTATION_URL}/transcription/get_transcription_status`,
          {
            params: {
              job_id: report.transferData.job_id,
            },
          }
        );

        if (response.data.meta) {
          // Dynamically update transfer object based on response fields
          for (const [key, value] of Object.entries(response.data.meta)) {
            report.transferData[key] = value;
            //(report.transferData[key]);
          }

        }
        // Handling for status which is outside meta
        if (response.data.status) {
          report.transferData["status"] = response.data.status;
        }

        if (response.data.result) {
          report.transferData["result"] = response.data.result;
        }

        if (response.data.meta.title){
          report.transferData["fileName"] = response.data.meta.title;
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
