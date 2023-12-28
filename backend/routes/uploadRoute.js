const express = require("express");
const multer = require('multer');
const axios = require("axios");
const fs = require('fs');
const path = require('path');
const FormData = require('form-data');
const dbconnect = require('../mongo.js');
const router = express.Router();

//////////// Multer setup
const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      const userId = req.body.userId;
      if (!userId) {
        return cb(new Error("No userId provided"), false);
      }
      const dir = path.join(__dirname, 'uploads', userId);
      fs.mkdirSync(dir, { recursive: true });
      cb(null, dir);
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
  try {
    const { userId, reportID: providedReportID } = req.body;

    if (!userId || !req.file) {
      return res.status(400).json({ success: false, message: "No userId or file uploaded" });
    }

    const reportID = providedReportID || (await dbconnect.createReport(req.body)).reportID;
    const newDir = path.join('./uploads', userId, String(reportID));
    fs.mkdirSync(newDir, { recursive: true });

    const allowedAudioTypes = ['audio/mpeg', 'audio/wav', 'audio/aac', 'audio/ogg', 'audio/webm'];
    const fileType = req.file.mimetype;

    let newPath;
    if (['application/json', 'text/csv', 'application/pdf'].includes(fileType) || allowedAudioTypes.includes(fileType)) {
      newPath = await handleFileUpload(req, fileType, reportID, newDir);
    } else {
      return res.status(400).json({ success: false, id: reportID, message: 'Invalid file type provided' });
    }

    res.status(200).json({ success: true, id: reportID, message: 'File uploaded and Database entry created successfully' });

    const flaskBackendUrl = 'http://localhost:5555/start_transcription';
    const formData = new FormData();
    formData.append('file', fs.createReadStream(newPath));
    formData.append('reportID', String(reportID));

    await axios.post(flaskBackendUrl, formData, { headers: formData.getHeaders() });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "An error occurred" });
  }
});


// Function to handle file upload and update report
const handleFileUpload = async (req, fileType, reportID, newDir) => {
    const fileSuffix = fileType.split('/').pop();
    const newPath = path.join(newDir, fileSuffix + '_' + req.file.filename);
    fs.renameSync(req.file.path, newPath);
    await dbconnect.updateReport(reportID, { [`${fileSuffix}Path`]: newPath });
    return newPath;
  };
//////////// 

module.exports = router;
