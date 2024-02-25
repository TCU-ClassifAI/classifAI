const express = require("express");
const dbconnect = require("../mongo.js");
const router = express.Router();
const fsPromises = require("fs").promises;
const path = require("path");
const mime = require("mime-types");

// /files/ prepended

//////////////// GET
// Get all export data files from all users
router.get("/", async (req, res) => {
  // (/files)
  try {
    let fileTypes = req.query.fileType;

    // Optional file type query (e.g., 'csv', 'pdf', etc.)
    if (fileTypes && !Array.isArray(fileTypes)) {
      fileTypes = [fileTypes];
    }

    // Fetch reports from all users
    const reports = await dbconnect.getAllReportsWhere({}); // Empty query to get all

    if (!reports || reports.length === 0) {
      return res.status(404).send("No reports found.");
    }

    // Filter each report's files based on the specified file types
    let filesResponse = reports.reduce((acc, report) => {
      const filteredFiles = report.files.filter((file) =>
        fileTypes
          ? fileTypes.some((fileType) => file.fileType.includes(fileType))
          : true
      );

      // Only include reports that have at least one file matching the filter
      if (filteredFiles.length > 0) {
        acc.push({
          userId: report.userId,
          reportId: report.reportId,
          file: filteredFiles.map((file) => file.filePath),
          gradeLevel: report.gradeLevel,
          subject: report.subject,
          fileName: filteredFiles.map((file) => file.fileName),
        });
      }

      return acc;
    }, []);

    if (filesResponse.length === 0) {
      return res
        .status(404)
        .send("No files found matching the specified types.");
    }

    // Send the response
    res.status(200).json(filesResponse);
  } catch (error) {
    res.status(500).send(`Error fetching files: ${error.message}`);
  }
});

// Get all export data files created by a specific user
router.get("/users/:userId", async (req, res) => {
  //   (/files/users/:userId)
  try {
    // Extract userId from the request parameters
    const { userId } = req.params;

    // For fileType querying
    let fileTypes = req.query.fileType;
    if (fileTypes && !Array.isArray(fileTypes)) {
      fileTypes = [fileTypes];
    }

    // Fetch reports for the specified user
    const reports = await dbconnect.getAllReportsWhere({ userId: userId });

    if (!reports || reports.length === 0) {
      return res.status(404).send("No reports found for this user.");
    }

    let filesResponse = reports.reduce((acc, report) => {
      const filteredFiles = report.files.filter((file) =>
        fileTypes
          ? fileTypes.some((fileType) => file.fileType.includes(fileType))
          : true
      );

      if (filteredFiles.length > 0) {
        acc.push({
          userId: report.userId,
          reportId: report.reportId,
          file: filteredFiles.map((file) => file.filePath),
          gradeLevel: report.gradeLevel,
          subject: report.subject,
          fileName: filteredFiles.map((file) => file.fileName),
        });
      }

      return acc;
    }, []);

    if (filesResponse.length === 0) {
      return res
        .status(404)
        .send("No files found matching the specified types for this user.");
    }

    res.status(200).json(filesResponse);
  } catch (error) {
    res.status(500).send(`Error fetching files: ${error.message}`);
  }
});

// Get all export data files created by a specific user in a specific report
router.get("/reports/:reportId/users/:userId", async (req, res) => {
  //   (/files/users/:userId)
  try {
    // Extract userId from the request parameters
    const { reportId, userId } = req.params;

    // For fileType querying
    let fileTypes = req.query.fileType;
    if (fileTypes && !Array.isArray(fileTypes)) {
      fileTypes = [fileTypes];
    }

    // Fetch reports for the specified user
    const reports = await dbconnect.getAllReportsWhere({
      reportId: reportId,
      userId: userId,
    });

    if (!reports || reports.length === 0) {
      return res.status(404).send("No reports found for this user.");
    }

    let filesResponse = reports.reduce((acc, report) => {
      const filteredFiles = report.files.filter((file) =>
        fileTypes
          ? fileTypes.some((fileType) => file.fileType.includes(fileType))
          : true
      );

      if (filteredFiles.length > 0) {
        acc.push({
          userId: report.userId,
          reportId: report.reportId,
          file: filteredFiles.map((file) => file.filePath),
          gradeLevel: report.gradeLevel,
          subject: report.subject,
          fileName: filteredFiles.map((file) => file.fileName),
        });
      }

      return acc;
    }, []);

    if (filesResponse.length === 0) {
      return res
        .status(404)
        .send("No files found matching the specified types for this user.");
    }

    res.status(200).json(filesResponse);
  } catch (error) {
    res.status(500).send(`Error fetching files: ${error.message}`);
  }
});

// Get a specific export data file created by a specific user in a specific report
router.get("/:fileName/reports/:reportId/users/:userId", async (req, res) => {
  try {
    const { fileName, reportId, userId } = req.params;
    const { download } = req.query; // Extract the download query parameter

    // Fetch the report for the specified user and reportId
    const report = await dbconnect.getReportWhere({
      reportId: reportId,
      userId: userId,
    });

    if (!report) {
      return res
        .status(404)
        .send("No report found for this user with the given report ID.");
    }

    const fileToInclude = report.files.find(
      (file) => file.fileName === fileName
    );

    if (!fileToInclude) {
      return res
        .status(404)
        .send("No files found matching the specified name for this user.");
    }

    // Decide action based on the download query parameter
    if (download === "true") {
      // Code block to initiate file download
      const fileData = await fsPromises.readFile(fileToInclude.filePath);
      const contentType =
        mime.lookup(fileToInclude.fileName) || "application/octet-stream";
      res.setHeader("Content-Type", contentType);

      // Override for MP3 files to ensure .mp3 extension is used
      let fileExtension = mime.extension(fileToInclude.fileType);
      if (fileToInclude.fileType === "audio/mpeg") {
        fileExtension = "mp3";
      }

      const downloadFileName = `${fileToInclude.fileName}.${fileExtension}`;
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${downloadFileName}"`
      );

      res.send(fileData);
    } else {
      // Original JSON response
      const filesResponse = {
        userId: report.userId,
        reportId: report.reportId,
        files: [
          {
            filePath: fileToInclude.filePath,
            fileName: fileToInclude.fileName,
            fileType: fileToInclude.fileType,
          },
        ],
        gradeLevel: report.gradeLevel,
        subject: report.subject,
      };
      res.status(200).json(filesResponse);
    }
  } catch (error) {
    if (error.code === "ENOENT") {
      // File not found on the filesystem
      return res.status(404).send("File not found on the server.");
    }
    res.status(500).send(`Error fetching file: ${error.message}`);
  }
});

////////////////////////////////

//////////////// POST

// Located in fileUploadRoute.js

////////////////////////////////

//////////////// PUT
// Modifying an Existing File in a Report /files/{fileName}/reports/{reportId}/users/{userId}
router.put(
  "/:fileName/reports/:reportId/users/:userId",
  checkReportExists,
  async (req, res) => {
    const { fileName, reportId: reportId, userId } = req.params;
    const newData = req.body;

    // Ensure newFileName is provided and is not empty
    if (
      !newData.fileName ||
      typeof newData.fileName !== "string" ||
      newData.fileName.trim() === ""
    ) {
      return res
        .status(400)
        .json({
          success: false,
          message: "New file name not provided or is invalid.",
        });
    }

    const file = req.report.files.find((f) => f.fileName === fileName);
    if (!file) {
      return res
        .status(404)
        .json({ success: false, message: "File not found." });
    }

    try {
      // Rename file on the server
      const oldPath = file.filePath;
      const newFileName = newData.fileName; // + path.extname(oldPath);
      const newPath = path.join(
        path.dirname(oldPath),
        newFileName + path.extname(oldPath)
      );
      await fsPromises.rename(oldPath, newPath);

      // Update file details in the database
      Object.assign(file, { fileName: newFileName, filePath: newPath });
      await req.report.save();

      res.json({
        success: true,
        message: "File updated and renamed successfully.",
        file: file,
      });
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .json({
          success: false,
          message: "An error occurred during the update",
        });
    }
  }
);

//////////////// DELETE
router.delete(
  "/:fileName/reports/:reportId/users/:userId",
  async (req, res) => {
    const { fileName, reportId, userId } = req.params;

    try {
      // Fetch the report to ensure it exists and belongs to the user
      const report = await dbconnect.getReportWhere({ reportId, userId });
      if (!report) {
        return res
          .status(404)
          .json({ success: false, message: "Report not found." });
      }

      // Find the file within the report's files array
      const fileIndex = report.files.findIndex(
        (file) => file.fileName === fileName
      );
      if (fileIndex === -1) {
        return res
          .status(404)
          .json({ success: false, message: "File not found." });
      }

      // Get the file path for deletion from the server
      const filePath = report.files[fileIndex].filePath;

      // Remove the file from the report's files array
      report.files.splice(fileIndex, 1);
      await report.save();

      // Delete the file from the server
      await fsPromises.unlink(filePath);

      res.json({
        success: true,
        message: "File deleted successfully.",
        report: report,
      });
    } catch (error) {
      console.error("Error deleting file:", error);
      if (error.code === "ENOENT") {
        // File not found on the server, might have already been deleted
        return res
          .status(404)
          .json({ success: false, message: "File not found on the server." });
      }
      res
        .status(500)
        .json({
          success: false,
          message: "An error occurred while deleting the file.",
        });
    }
  }
);

///////// Helper Functions
// Check report existence
async function checkReportExists(req, res, next) {
  const query = { reportId: req.params.reportId, userId: req.params.userId };
  const report = await dbconnect.getReportWhere(query);
  if (!report) {
    return res
      .status(404)
      .json({ success: false, message: "Report not found." });
  }
  req.report = report; // Passing the report to the next handler
  next();
}

module.exports = router;
