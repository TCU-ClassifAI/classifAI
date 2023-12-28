const express = require("express");
const multer = require('multer'); // For handling file uploads
const axios = require("axios");
const fs = require('fs');
const path = require('path');
const FormData = require('form-data');
const dbconnect = require('../mongo.js')
const router = express.Router();


///////////// multer setup


// req: request object that contains info about incoming request
// file: infomration about uploaded file
// cb: callback function that we need to call to tell multer where and how to store the file.
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
     // Check if userId is present
     const userId = req.body.userId;
     if (!userId) {
       cb(null, false);
     } else {
       // Create a directory for the user
       const dir = path.join(__dirname, 'uploads', userId);
       fs.mkdirSync(dir, { recursive: true });
 
       // Pass the directory to multer
       cb(null, dir);
     }
   }, //function (req, file, cb) {
   //   cb(null, path.join(__dirname, 'uploads')) // 11-22 '/uploads')  // first argument is null because we don’t have any error to report, second is our uploads folder  located in /uploads
   // },
   filename: function (req, file, cb) {
     cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname))  // filename = filename + date + file extension
   }
 });
 
 var upload = multer({
   storage: storage,
   limits: {fileSize: 5 * 1024 * 1024 * 1024}, // Arbitrary max limit of 5gb at the moment
   fileFilter: function (req, file, cb) { //added 11-7
     // Check if userId is present
     if (!req.body.userId) {
       cb(null, false);
     } else {
       cb(null, true);
     }
   }
 });
 
/////////////


////////////// Upload endpoint: Stores file in the web server, uploads info to MongoDB, sends to Workstation
// supports other optional attributes like subject, grade level, and is_premium

// Upload endpoint, to accept audio, video, json, CSV, or PDF files, requires an userID, and optionally a reportID
router.post("/", upload.single('file'), async (req, res) => {
    
    // Check if userID is provided
    const userId = req.body.userId;
    if (!userId) {
      return res.status(400).json({ success: false, message: "No userId provided" });
    }

    if (!req.file) {
      res.status(400).json({ success: false, message: "No file uploaded" });
    }



    // Check if reportID is provided
    let reportID = req.body.reportID;
    if (!reportID) {
      try {
        // if not, create a new report in MongoDB with the file info provided, and save the reportID
        const reportData = req.body;

        const newReport = await dbconnect.createReport(reportData);
        reportID = newReport.reportID;

        if (!reportID) {
            throw new Error('Failed to create a new report');
        }

        //res.status(201).json({ error: error.message });
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    }

    

    // if the uploaded file is a JSON, CSV, PDF, or audio file it should be saved in /uploads

  

    // create the directory within /uploads for the new report
    try {
      const newDir = path.join('./uploads', userId, String(reportID));
      fs.mkdirSync(newDir, { recursive: true });

      // here, list our allowed audio types
      const allowedAudioTypes = [
        'audio/mpeg',       // MP3 files
        'audio/wav',        // WAV files
        'audio/aac',        // AAC files
        'audio/ogg',        // OGG files
        'audio/webm'        // WebM files
      ];

      let newPath; // Define outside if else

      // from here, we'll need to name the file according to its filetype, and save it accordingly
      const fileType = req.file.mimetype;
      if (fileType == 'application/json') {
        fs.renameSync(req.file.path, path.join(newDir, String('json_' + req.file.filename)));
        // store this information as jsonPath
        const jsonPath = path.join(newDir, String('json_' + req.file.filename));
        await dbconnect.updateReport(reportID, {jsonPath:jsonPath});

        // additionally, save this as newPath for generic reference
        newPath = jsonPath;
      }

      else if (fileType == 'text/csv') {
        fs.renameSync(req.file.path, path.join(newDir, String('csv_' + req.file.filename)));
        // store this information as newPath
        const csvPath = path.join(newDir, String('csv_' + req.file.filename));
        await dbconnect.updateReport(reportID, {csvPath:csvPath});

        // additionally, save this as newPath for generic reference
        newPath = csvPath;
      }

      else if (fileType == 'application/pdf') {
        fs.renameSync(req.file.path, path.join(newDir, String('pdf_' + req.file.filename)));
        // store this information as newPath
        const pdfPath = path.join(newDir, String('pdf_' + req.file.filename));
        await dbconnect.updateReport(reportID, {pdfPath:pdfPath});

        // additionally, save this as newPath for generic reference
        newPath = pdfPath;
      }

      // check if the file is an audio file
      else if (allowedAudioTypes.includes(fileType)) {
        fs.renameSync(req.file.path, path.join(newDir, String('audio_' + req.file.filename)));
        // store this information as newPath
        const audioPath = path.join(newDir, String('audio_' + req.file.filename));
        await dbconnect.updateReport(reportID, { audioPath: audioPath, status: 'Uploaded' });
        console.log(audioPath);

        // additionally, save this as newPath for generic reference
        newPath = audioPath;
      }

      // if no valid filetype has been provided, return success: false
      else {
        res.status(200).json({ success: false, id: reportID, message: 'Invalid file type provided' });
      }


      // valid file type provided, return success: true
      res.status(200).json({ success: true, id: reportID, message: 'File uploaded and Database entry created successfully' });



      const flaskBackendUrl = 'http://localhost:5555/start_transcription';    //'http://WORKSTATION:XXXX/start_transcription';
      

      //// streaming the audio file and sending reportID: Workstation intends on transcribing then updating DB (needs the reportID)
      // Create a new instance of FormData
      const formData = new FormData();

      // Create a stream from the file
      const fileStream = fs.createReadStream(newPath);

      // Append the stream to the form data under the 'file' field
      formData.append('file', fileStream);

      // Append other fields
      formData.append('reportID', String(reportID));

      // Send the form data with Axios
      const response = await axios.post(flaskBackendUrl, formData, { //make this a try catch so it doesnt crash
        headers: formData.getHeaders(),
      });
      // flask would look something like:
          // def start_transcription():
              // audio_file = request.files.get('file')
              // audio_id = request.form.get('reportID')
              // to get audio file and audio id

    } 
    catch(error) {
      console.error(error);

      // Send a response indicating an error occurred
      res.status(500).json({ success: false, message: "An error occurred" });  
    } 
});

//////////////

module.exports = router;
