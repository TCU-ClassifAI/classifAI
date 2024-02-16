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



//////////// Upload endpoint: Stores file in the web server, uploads info to MongoDB, sends to Workstation
///////// served on /files/......
////// supports other optional attributes like subject, gradeLevel, and is_premium
router.post("/reports/:reportId/users/:userId", upload.single('file'), async (req, res) => { 
    
    // 1/24 TODO: grab date of file upload, send to database

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



        if (!req.file) {
            response.message = "File is required";
            response.code = 400;
            return res.status(400).json(response);
        }
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


        const allowedTypes = ['application/json', 'text/csv', 'application/pdf', 'audio/mpeg', 'audio/wav', 'audio/aac', 'audio/ogg', 'audio/webm'];
        const audioTypes =['audio/mpeg', 'audio/wav', 'audio/aac', 'audio/ogg', 'audio/webm']
        const fileType = req.file.mimetype;
        if (!allowedTypes.includes(fileType)) {
            await fsPromises.unlink(req.file.path); 
            response.message = 'Invalid file type provided';
            return res.status(400).json(response);    
        }


        //let report = await dbconnect.getReport(reportId); 
        let report = await dbconnect.getReportWhere({userId:userId, reportId: reportId}); //get userId's report from reportId
        if (!report) {
            const reportData = {
                reportId:reportId,
                userId:userId,
                ...req.body, // includes other body data
            };    
            report = await dbconnect.createReport(reportData);

        }

        //let reportID = providedReportID || (await dbconnect.createReport(req.body)).reportID;
        const newDir = path.join('./uploads', userId, String(reportId)); // Place in uploads/userId/reportID/....... folder
        await fsPromises.mkdir(newDir, { recursive: true });
        let newPath = await handleFileUpload(req, fileType, userId, reportId, providedFileName, newDir);

        
        // Set response for successful upload
        response.flag = true;
        response.code = 200;
        response.message = "File uploaded and database entry successfully created";
        response.data = {
            userId: userId,
            reportId: reportId,
            file: req.file.originalname,
            fileName: providedFileName || path.basename(newPath),
            gradeLevel: req.body.gradeLevel,
            subject: req.body.subject
        };

        if (audioTypes.includes(fileType)) {
            const transferResponse = await handleFileTransfer(`${process.env.WORKSTATION_URL}/start_transcription`, newPath, reportId);
            // Implement polling mechanism for job completion
            //const transferData = transferResponse.data;
            const job_id = transferResponse.data.job_id; // Return job_id to the client for polling

            let jobStatus = await pollForJobCompletion(process.env.WORKSTATION_URL, job_id);
            response.flag = true;
            response.code = 200;
            response.message = "File uploaded, database entry successfully, and transcription started";
            // 2/15 only needed if GET endpoint idea: response.job_id = job_id;
                       
            if (jobStatus.completed) {
                const {result, ...transferData} = jobStatus.transcriptionData; // Destructure to exclude 'result'
                try {
                    await dbconnect.updateReport(
                        { userId: userId, reportId: reportId }, 
                        { 
                            transcription: jobStatus.transcription,
                            transferData: transferData, // if we want to add in DB
                            status: "completed"
                        }
                    );
            
                    // Prepare the successful response
                    response.transcription = jobStatus.transcription;
                    response.transferData = transferData;
                    response.message = 'File uploaded, database entry created, file transferred, and transcription completed';
                } catch (error) {
                    console.error("Error updating report in the database:", error);
                    // Prepare an error response if updating the database fails
                    response.flag = false;
                    response.code = 500;
                    response.message = "Failed to update the report with transcription data";
                }
            } 
            else {
                // Handle incomplete job status
                response.message = 'File processing incomplete';
            }
            response.transferStatus = 'successful';
        }
        res.status(200).json(response);


        // if (!audioTypes.includes(fileType)) {
        //     //response.transferStatus = null;
        //     res.status(200).json(response);
        // }
        // else {
        //     await handleFileTransfer(process.env.WORKSTATION_URL, newPath, reportId);
        //     // 1/22 job_id = await handleFileTransfer(process.env.WORKSTATION_URL, newPath, reportID);
            
        //     response.transferStatus = 'successful';
        //     response.message = 'File uploaded, database entry sucessfully created, and file transferred successfully';
        //         // 1/22 response.job_id = job_id; 
        //     res.status(200).json(response);
        // }

    }
    catch (error) {
        console.error(error);
        response.message = error.message || "An error occurred";

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
        const response = await axios.post(workstation, formData, { headers: formData.getHeaders() });
        return response;
    } catch (error) {
        console.error("Error in file transfer:", error);
        throw new Error("Failed to transfer file. Possible Workstation connection error.");
    }
};

// Unfinished idea? : GET endpoint so that we can continously get the status instead of just waiting for completion in POST
// GET endpoint for polling transcription status
// route probably needs to change below
// router.get("/transcription/:job_id", async (req, res) => {
//     try {
//         const { job_id } = req.params;
//         const workstationUrl = `${process.env.WORKSTATION_URL}/get_transcription_status?job_id=${job_id}`;

//         const statusResponse = await axios.get(workstationUrl);
//         res.status(200).json(statusResponse.data);
//     } catch (error) {
//         console.error("Error polling transcription status:", error);
//         res.status(500).json({ message: "Failed to poll transcription status" });
//     }
// });

// Function to poll the workstation for job completion
async function pollForJobCompletion(workstationUrl, job_id) {
    let completed = false;
    let transcription = null;
    let transcriptionData = null;

    while (!completed) {
        // Implement a delay between polls
        await new Promise(resolve => setTimeout(resolve, 2000)); // 5 seconds delay
        const response = await axios.get(`${workstationUrl}/get_transcription_status`, {
            params: {
                job_id: job_id
            }
        });        
        const status = response.data.status; // Adjust according to actual response structure
        if (status === 'completed') {
            completed = true;
            transcription = response.data.result; // Assuming the transcription is directly accessible
            transcriptionData = response.data;
        }
    }
    return { completed, transcriptionData, transcription };
}

//////////// 

module.exports = router;
