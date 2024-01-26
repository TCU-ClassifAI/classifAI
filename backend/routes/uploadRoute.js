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
      const userId = req.body.userId;
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
      cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
  }),
  limits: { fileSize: 5 * 1024 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    cb(null, !!req.body.userId);
  }
});
//////////// 



//////////// Upload endpoint: Stores file in the web server, uploads info to MongoDB, sends to Workstation
////// supports other optional attributes like subject, grade level, and is_premium
router.post("/", upload.single('file'), async (req, res) => {  // Ignore route, our server.js will serve this on /upload
    
    
    // 1/24 TODO: grab date of file upload, send to database
    let response = {
        uploadStatus: 'pending',
        transferStatus: 'pending',
        message: '',
        id: null,
    };
    
    try {
        const { userId, reportID: providedReportID, fileName: providedFileName } = req.body; //file name added 1/22
            //let job_id = null; // Variable for workstation Job_id

        if (!userId || !req.file) {
            response.message = "No userId or file uploaded";
            return res.status(400).json(response);    
        }

        const allowedTypes = ['application/json', 'text/csv', 'application/pdf', 'audio/mpeg', 'audio/wav', 'audio/aac', 'audio/ogg', 'audio/webm'];
        const audioTypes =['audio/mpeg', 'audio/wav', 'audio/aac', 'audio/ogg', 'audio/webm']
        const fileType = req.file.mimetype;
        if (!allowedTypes.includes(fileType)) {
            await fsPromises.unlink(req.file.path); 
            response.message = 'Invalid file type provided';
            return res.status(400).json(response);    
        }

        let reportID = providedReportID || (await dbconnect.createReport(req.body)).reportID;
        const newDir = path.join('./uploads', userId, String(reportID)); // Place in uploads/userId/reportID/....... folder
        await fsPromises.mkdir(newDir, { recursive: true });
        let newPath = await handleFileUpload(req, fileType, reportID, providedFileName, newDir);
        response.success = true;
        response.id = reportID;
        response.uploadStatus = 'successful';
        response.message = 'File uploaded and database entry successfully created';

        if (!audioTypes.includes(fileType)) {
            response.transferStatus = null;
            res.status(200).json(response);
        }
        else {
            await handleFileTransfer(process.env.WORKSTATION_URL, newPath, reportID);
                // 1/22 job_id = await handleFileTransfer(process.env.WORKSTATION_URL, newPath, reportID);
            response.transferStatus = 'successful';
            response.message = 'File uploaded, database entry sucessfully created, and file transferred successfully';
                // 1/22 response.job_id = job_id; 
            res.status(200).json(response);
        }

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
const handleFileUpload = async (req, fileType, reportID, providedFileName, newDir) => {
    const originalExtension = path.extname(req.file.originalname);
    let fileName = providedFileName ? providedFileName : path.basename(req.file.filename, originalExtension);
    let newPath = path.join(newDir, fileName + originalExtension);
    const oldPath = req.file.path;

    try {
        await fsPromises.rename(oldPath, newPath);
        const report = await dbconnect.getReport(reportID);
        let files = report.files || [];
        let existingFileIndex = files.findIndex(f => f.fileName === fileName);        

        if (existingFileIndex !== -1) {
            files[existingFileIndex] = {
                fileName: fileName,
                filePath: newPath,
                fileType: req.file.mimetype.split('/').pop()
            };
        } else {
            files.push({
                fileName: fileName,
                filePath: newPath,
                fileType: req.file.mimetype.split('/').pop()
            });        
        }

        await dbconnect.updateReport(reportID, { files: files });
        return newPath;
    } catch (error) {
        console.error("Error in moving file:", error);
        throw new Error("Failed to process file upload.");
    }
};


// Function to handle file transfer to flask backend
const handleFileTransfer = async (workstation, newPath, reportID) => {
    const formData = new FormData();
    formData.append('file', fs.createReadStream(newPath));
    formData.append('reportID', String(reportID));

    try {
        await axios.post(workstation, formData, { headers: formData.getHeaders() });
    } catch (error) {
        console.error("Error in file transfer:", error);
        throw new Error("Failed to transfer file. Possible Workstation connection error.");
    }
};
//////////// 

module.exports = router;
