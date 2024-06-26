require("dotenv").config();
const express = require("express");
const multer = require("multer");
const axios = require("axios");
const fsPromises = require("fs").promises;
const fs = require("fs"); // For createReadStream, createWriteStream, etc.
const path = require("path");
const FormData = require("form-data");
const dbconnect = require("../mongo.js");
const router = express.Router();

//////////// Multer setup
const upload = multer({
  storage: multer.diskStorage({
    destination: async (req, file, cb) => {
      const userId = req.params.userId;
      if (!userId) {
        return cb(new Error("No userId provided"), false);
      }
      const dir = path.join(
        __dirname,
        "..",
        "uploads",
        ".temporary_uploads",
        userId
      ); //specify actual upload directory later
      try {
        if (!fs.existsSync(dir)) {
          await fsPromises.mkdir(dir, { recursive: true });
        }
        cb(null, dir);
      } catch (error) {
        console.error("Error creating directory:", error);
        cb(new Error("Failed to create upload directory."), false);
      }
    },
    filename: (req, file, cb) => {
      cb(null, file.originalname); //file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    },
  }),
  limits: { fileSize: 2 * 1024 * 1024 * 1024 }, //2gb
  fileFilter: (req, file, cb) => {
    cb(null, !!req.params.userId);
  },
});
////////////

//////////// POST Report endpoint: (optional file upload) Stores file in the web server, uploads info to MongoDB, sends to Workstation
///////// served on /reports/......
////// supports other optional attributes like subject, gradeLevel, and is_premium
router.post(
  "/:reportId/users/:userId",
  upload.single("file"),
  async (req, res) => {
    // Initialize the response structure
    let response = {
      flag: false,
      code: 500,
      message: "",
      data: {},
    };

    try {
      const { reportId, userId } = req.params;
      const providedFileName = req.body.fileName;
      const providedReportName = req.body.reportName;
      const url = req.body.url; //added 3/5
      const model_name = req.body.model_name || 'large-v3'; // Default model_name if not provided


      if (!reportId) {
        response.message = "reportId is required";
        response.code = 400;
        return res.status(400).json(response);
      }
      if (!userId) {
        response.message = "userId is required";
        response.code = 400;
        return res.status(400).json(response);
      }

      // Check if a report with the given reportId for the userId already exists
      let existingReport = await dbconnect.getReportWhere({
        userId: userId,
        reportId: reportId,
      });
      if (existingReport) {
        // Report already exists, return an error
        response.message =
          "A report with the given report ID already exists for this user";
        response.code = 400;
        return res.status(400).json(response);
      }

      const reportData = {
        reportId: reportId,
        userId: userId,
        reportName: providedReportName || "",
        ...req.body, // includes other body data
      };
      let report = await dbconnect.createReport(reportData);

      let newPath;

      // Update response for successful report processing
      response.flag = true;
      response.code = 200;
      response.message = req.file
        ? "File uploaded and database entry successfully created"
        : "Database entry successfully created without file upload";
      response.data = {
        userId: userId,
        reportId: reportId,
        file: req.file ? req.file.originalname : "No file uploaded",
        reportName: providedReportName || "",
        gradeLevel: req.body.gradeLevel,
        subject: req.body.subject,
      };

      if (url) {
        // Send youtubeUrl
        try {
          const ytResponse = await axios.post(
            `${process.env.WORKSTATION_URL}/analyze`, // Endpoint
            {
              url: url, // Passing URL to analyze in the request body
              model_name: model_name, // Including model_name
            }
          );
          //axios.get(
          //   `${process.env.WORKSTATION_URL}/transcription/transcribe_yt?url=${url}` // change to post analyze
          // );
          // Handle success response from YouTube transcription start
          response.url = url;

          response.transferStatus = "successful";
          const job_id = ytResponse.data.job_id; // Return job_id to the client for polling
          
          response.data.job_id = job_id; // Return job_id to the client
          //console.log('response data:', response.data);
          response.flag = true;
          response.code = 200;
          response.message =
            "YouTube transcription started and database entry successfully";

          // Update transferData for newest audioFile transfer
          report.transferData = {
            job_id: job_id,
            fileName: url, //providedFileName || path.basename(newPath),
          };

          await dbconnect.updateReport(
            { userId, reportId },
            {
              transferData: report.transferData,
              audioFile: url, //providedFileName || path.basename(newPath),
            }
          );
        } catch (error) {
          console.error("Error starting YouTube transcription:", error);
          response.status = "failed";
          response.message = "Error starting YouTube transcription";
        }
      }

      if (req.file) {
        response.uploadStatus = "pending";
        const allowedTypes = [ //added video types from website
          "application/json",
          "text/csv",
          "application/pdf",
          "audio/mp4",
          "audio/mpeg",
          "audio/wav",
          "audio/aac",
          "audio/ogg",
          "audio/x-m4a", // Added to support m4a files
          "audio/webm",
          "video/webm",
          "video/mp2t",
          "video/quicktime",
          "video/mp4",
          "application/mxf"
        ];
        if (!allowedTypes.includes(req.file.mimetype)) {
          await fsPromises.unlink(req.file.path);
          response.message = "Invalid file type provided";
          response.uploadStatus = "failed";
          return res.status(400).json(response);
        }

        const newDir = path.join("./uploads", userId, String(reportId));
        await fsPromises.mkdir(newDir, { recursive: true });
        newPath = await handleFileUpload(
          req,
          req.file.mimetype,
          userId,
          reportId,
          providedFileName,
          newDir
        );
        response.uploadStatus = "successful";

        response.data.fileName =
          providedFileName ||
          (newPath ? path.basename(newPath) : "No file uploaded");

        if (
          [
            "audio/mpeg",
            "audio/wav",
            "audio/aac",
            "audio/ogg",
            "audio/webm",
            "audio/mp4",
            "audio/x-m4a", // Added to support m4a files
            "video/webm",
            "video/mp2t",
            "video/quicktime",
            "video/mp4",
            "application/mxf"
          ].includes(req.file.mimetype) //add video types from webpage
        ) {
          try {
            const transferResponse = await handleFileTransfer(
              `${process.env.WORKSTATION_URL}/analyze`,//transcription/transcribe`, //changed from start_transcription
              newPath,
              model_name,
              reportId
            );
            response.transferStatus = "successful";
            const job_id = transferResponse.data.job_id; // Return job_id to the client for polling
            
            let job = await getInitialJobReq(
              process.env.WORKSTATION_URL,
              job_id
            );
            response.data.job_id = job_id; // Return job_id to the client
            response.flag = true;
            response.code = 200;
            response.message =
              "File uploaded, database entry successfully, and transcription started";

            let transcriptionData = {
              ...job.transcriptionData.meta,
              status: job.status // Assuming 'status' is directly under 'job'
            };

            response.transferData = {
              ...transcriptionData,
              fileName: providedFileName || path.basename(newPath),
            };

            // Update transferData for newest audioFile transfer
            report.transferData = {
              ...transcriptionData,
              fileName: providedFileName || path.basename(newPath),
            };
            await dbconnect.updateReport(
              { userId, reportId },
              {
                transferData: report.transferData,
                status: transcriptionData.status,
                audioFile: providedFileName || path.basename(newPath),
              }
            );
          } catch (error) {
            console.error(
              "Error transfering file or updating report in the database:",
              error
            );
            response.message = "Failed to transfer file";
            response.transferStatus = "failure";
          }
        }
      }

      res.status(200).json(response);
    } catch (error) {
      console.error(error);
      response.message = error.message || "An error occurred";

      response.uploadStatus =
        response.uploadStatus === "pending" ? "failed" : response.uploadStatus; // if pending, change to failed, if not, leave as is
      response.transferStatus =
        response.uploadStatus === "successful" &&
        response.transferStatus === "pending"
          ? "failed"
          : response.transferStatus;
      if (!res.headersSent) {
        res.status(500).json(response);
      }
    }
  }
);

// Function to handle file upload and update report
const handleFileUpload = async (
  req,
  fileType,
  userId,
  reportId,
  providedFileName,
  newDir
) => {
  const originalExtension = path.extname(req.file.originalname);
  let fileName = providedFileName
    ? providedFileName
    : path.basename(req.file.filename, originalExtension);
  let newPath = path.join(newDir, fileName + originalExtension);
  const oldPath = req.file.path;

  try {
    await fsPromises.rename(oldPath, newPath);
    const report = await dbconnect.getReportWhere({
      userId: userId,
      reportId: reportId,
    });
    // Check if the report is not null
    if (!report) {
      throw new Error(`No report found with ID ${reportId}`);
    }
    let files = report.files || [];
    let existingFileIndex = files.findIndex((f) => f.fileName === fileName);

    if (existingFileIndex !== -1) {
      files[existingFileIndex] = {
        fileName: fileName,
        filePath: newPath,
        fileType: req.file.mimetype,
      };
    } else {
      files.push({
        fileName: fileName,
        filePath: newPath,
        fileType: req.file.mimetype,
      });
    }

    await dbconnect.updateReport(
      { userId: userId, reportId: reportId },
      { files: files }
    );
    return newPath;
  } catch (error) {
    console.error("Error in moving file:", error);
    throw new Error("Failed to process file upload.");
  }
};

// Function to handle file transfer to flask backend
const handleFileTransfer = async (workstation, newPath, reportId, model_name) => {
  const formData = new FormData();
  formData.append("file", fs.createReadStream(newPath));
  formData.append("reportId", String(reportId));
  formData.append("model_name", String(model_name));

  try {
    const response = await axios.post(workstation, formData, {
      headers: formData.getHeaders(),
    });
    return response;
  } catch (error) {
    console.error("Error in file transfer:", error);
    throw new Error(
      "Failed to transfer file. Possible Workstation connection error."
    );
  }
};

async function getInitialJobReq(workstationUrl, job_id) {
  let completed = false;
  let transcriptionData = null;

  const response = await axios.get(
    `${workstationUrl}/analyze`,//transcription/get_transcription_status`,
    {
      params: {
        job_id: job_id,
      },
    }
  );
  transcriptionData = response.data;
  return { completed, transcriptionData };
}
////////////

module.exports = router;
