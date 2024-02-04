require('dotenv').config();
const express = require("express");
const multer = require('multer');
const axios = require("axios");
const fsPromises = require('fs').promises;
const fs = require('fs');  // For createReadStream, createWriteStream, etc.
const path = require('path');
const FormData = require('form-data');
const dbconnect = require('../mongo.js');
const router = express.Router();

//////////// Multer setup
const upload = multer({
  storage: multer.diskStorage({
    destination: async (req, file, cb) => {
      const userId = req.params.userId;
      if (!userId) {
        return cb(new Error("No userId provided"), false);
      }
      const dir = path.join(__dirname, '..','uploads','.temporary_uploads', userId); //specify actual upload directory later
      try {
        if (!fs.existsSync(dir)) {
          await fsPromises.mkdir(dir, { recursive: true });
        }
        cb(null, dir);
      } 
      catch (error) {
        console.error("Error creating directory:", error);
        cb(new Error("Failed to create upload directory."), false);
      }
    },
    filename: (req, file, cb) => {
      cb(null, file.originalname);//file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
  }),
  limits: { fileSize: 5 * 1024 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    cb(null, !!req.params.userId);
  }
});
//////////// 



//////////// POST Report endpoint: (optional file upload) Stores file in the web server, uploads info to MongoDB, sends to Workstation
///////// served on /reports/......
////// supports other optional attributes like subject, gradeLevel, and is_premium
router.post("/:reportId/users/:userId", upload.single('file'), async (req, res) => { 
    
    // Initialize the response structure
    let response = {
        flag: false,
        code: 500,
        message: '',
        data: {}
    };

    
    try {
        const { reportId, userId } = req.params;
        const providedFileName = req.body.fileName;

        if (!reportId){
            response.message = "reportId is required";
            response.code = 400;
            return res.status(400).json(response);
        }
        if (!userId){
            response.message = "userId is required";
            response.code = 400;
            return res.status(400).json(response);
        }

        // Check if a report with the given reportId for the userId already exists
        let existingReport = await dbconnect.getReportWhere({ userId: userId, reportId: reportId });
        if (existingReport) {
            // Report already exists, return an error
            response.message = "A report with the given report ID already exists for this user";
            response.code = 400; 
            return res.status(400).json(response); 
        }

        const reportData = {
            reportId: reportId,
            userId: userId,
            ...req.body, // includes other body data
        };    
        let report = await dbconnect.createReport(reportData);

        let newPath;
        if (req.file){
            const allowedTypes = ['application/json', 'text/csv', 'application/pdf', 'audio/mpeg', 'audio/wav', 'audio/aac', 'audio/ogg', 'audio/webm'];
            if (!allowedTypes.includes(req.file.mimetype)) {
                await fsPromises.unlink(req.file.path);
                response.message = 'Invalid file type provided';
                return res.status(400).json(response);
            }

            const newDir = path.join('./uploads', userId, String(reportId));
            await fsPromises.mkdir(newDir, { recursive: true });
            newPath = await handleFileUpload(req, req.file.mimetype, userId, reportId, providedFileName, newDir);

            if (['audio/mpeg', 'audio/wav', 'audio/aac', 'audio/ogg', 'audio/webm'].includes(req.file.mimetype)) {
                await handleFileTransfer(process.env.WORKSTATION_URL, newPath, reportId);
                response.transferStatus = 'successful';
            }
        }
        
    // Update response for successful report processing
    response.flag = true;
    response.code = 200;
    response.message = req.file ? "File uploaded and database entry successfully created" : "Database entry successfully created without file upload";
    response.data = {
      userId: userId,
      reportId: reportId,
      file: req.file ? req.file.originalname : "No file uploaded",
      fileName: providedFileName || (newPath ? path.basename(newPath) : "No file uploaded"),
      gradeLevel: req.body.gradeLevel,
      subject: req.body.subject
    };

    res.status(200).json(response);

    }
    catch (error) {
        console.error(error);
        response.message = "An error occurred";
        response.uploadStatus = response.uploadStatus === 'pending' ? 'failed' : response.uploadStatus;  // if pending, change to failed, if not, leave as is
        response.transferStatus = (response.uploadStatus === 'successful' && response.transferStatus === 'pending') ? 'failed' : response.transferStatus;
        if (!res.headersSent) {
            res.status(500).json(response);
        }
    }
});





// Function to handle file upload and update report
const handleFileUpload = async (req, fileType, userId, reportId, providedFileName, newDir) => {
    const originalExtension = path.extname(req.file.originalname);
    let fileName = providedFileName ? providedFileName : path.basename(req.file.filename, originalExtension);
    let newPath = path.join(newDir, fileName + originalExtension);
    const oldPath = req.file.path;

    try {
        await fsPromises.rename(oldPath, newPath);
        const report = await dbconnect.getReportWhere({userId:userId, reportId: reportId});
         // Check if the report is not null
         if (!report) {
            throw new Error(`No report found with ID ${reportId}`);
        }
        let files = report.files || [];
        let existingFileIndex = files.findIndex(f => f.fileName === fileName);        

        if (existingFileIndex !== -1) {
            files[existingFileIndex] = {
                fileName: fileName,
                filePath: newPath,
                fileType: req.file.mimetype
            };

        } else {
            files.push({
                fileName: fileName,
                filePath: newPath,
                fileType: req.file.mimetype
            }); 
        }

        await dbconnect.updateReport({userId: userId, reportId: reportId}, { files: files });
        return newPath;
    } catch (error) {
        console.error("Error in moving file:", error);
        throw new Error("Failed to process file upload.");
    }
};


// Function to handle file transfer to flask backend
const handleFileTransfer = async (workstation, newPath, reportId) => {
    const formData = new FormData();
    formData.append('file', fs.createReadStream(newPath));
    formData.append('reportId', String(reportId));

    try {
        await axios.post(workstation, formData, { headers: formData.getHeaders() });
    } catch (error) {
        console.error("Error in file transfer:", error);
        throw new Error("Failed to transfer file. Possible Workstation connection error.");
    }
};
//////////// 

module.exports = router;
