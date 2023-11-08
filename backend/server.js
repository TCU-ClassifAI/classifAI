require('dotenv').config();
const express = require("express");
const multer = require('multer'); // For handling file uploads
const cors = require("cors");
const axios = require("axios");
const fs = require('fs');
const path = require('path');
const FormData = require('form-data');

// Look into PQueue; improve the performance by processing multiple files concurrently (specified by the concurrency option)

const PORT = 5000;
const app = express();
app.use(cors());





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

/////////////  What if in another js file we auto compress audio files when they've been uploaded?




///////////// MongoDB setup

const Report = require('./mongo');

/////////////


app.get("/", (req, res) => {
  return res.status(200).send("It's working");
});

app.listen(PORT, () => {
  console.log("Server Running sucessfully.");
});


////////////// Upload endpoint: Stores file in the web server, uploads info to MongoDB, sends to Workstation
// supports other optional attributes like subject, grade level, and is_premium

app.post("/upload", upload.single('file'), async (req, res) => {
     
    // Check if userID is provided
    const userId = req.body.userId;
    if (!userId) {
      return res.status(400).json({ success: false, message: "No userId provided" });
    }

    if (!req.file) {
      res.status(400).json({ success: false, message: "No file uploaded" });
    }

    

    try {
      // Create a new Report in MongoDB with the file info we have
      const audioFile = new Report({  //Audio({
        // want a userID passed in
        userId: userId,
        gradeLevel: req.body.gradeLevel,
        subject: req.body.subject,
        isPremium: req.body.is_premium,
        status: 'in progress'
      });

      // Save the audio document in MongoDB
      await audioFile.save();   //send to mongoDB Connector

      // Move the file to a new directory with the _id
      const newDir = path.join(__dirname, 'uploads', req.body.userId, String(audioFile._id));
      fs.mkdirSync(newDir, { recursive: true });
      fs.renameSync(req.file.path, path.join(newDir, req.file.filename));

      const newPath = path.join(newDir, req.file.filename);

      // Update the audioPath in MongoDB
      audioFile.audioPath = newPath;
      await audioFile.save();

      res.status(200).json({ success: true, id: audioFile._id, message: 'File uploaded and Database entry created successfully' });


      const flaskBackendUrl = 'http://localhost:5555/start_transcription';    //'http://WORKSTATION:XXXX/start_transcription';
      

      //// streaming the audio file and sending reportID: Workstation intends on transcribing then updating DB (needs the reportID)
      // Create a new instance of FormData
      const formData = new FormData();

      // Create a stream from the file
      const fileStream = fs.createReadStream(newPath);

      // Append the stream to the form data under the 'file' field
      formData.append('file', fileStream);

      // Append other fields
      formData.append('reportID', String(audioFile._id));

      // Send the form data with Axios
      const response = await axios.post(flaskBackendUrl, formData, {
        headers: formData.getHeaders(),
      });
      // flask would look something like:
          // def start_transcription():
              // audio_file = request.files.get('file')
              // audio_id = request.form.get('audioId')
              // to get audio file and audio id

    } 
    catch(error) {
      console.error(error);

      // Send a response indicating an error occurred
      res.status(500).json({ success: false, message: "An error occurred" });  
    } 
});

//////////////



////////////// Get transcript/analysis endpoint:  grab the transcript if available from the given audio file

app.get('/transcript/:id', async (req, res) => {
  try{
    // Find audio document in MongoDB given ID
    const audioFile = await Report.findById(req.params.id);

    if (!audioFile) {
      // Send no audio file found error
      return res.status(404).json({ success: false, message: 'Audio file not found.'});
    }

    if (audioFile.status === 'in progress'){
      // Send response indicating pending status
      return res.json({success: false, message:'Transcription still in progress.'});
    }

    if (audioFile.status === 'error') {
      // Send a response indicating an error occurred during transcription
      return res.json({ success: false, message: "An error occurred during transcription" });
    }

    // Send a response with the transcription of the audio file
    res.json({ success: true, transcription: audioFile.transcription });

  }
  catch(error) {
    res.status(500).json({ success: false, message: "An error occurred" });
  }
});

//////////////




////////////// Update Transcription with changes, this will probably need more work

app.put('/transcript/:id', async(req, res) => {
  try {
    // Find audio document in MongoDB given ID
    const audioFile = await Report.findById(req.params.id);

    if (!audioFile) {
      // Send a response indicating that the audio file was not found
      return res.status(404).json({ success: false, message: 'Audio file not found.' });
    }

    if (audioFile.status !== 'complete') {
      // Restrict updates to completed transcriptions only
      return res.status(400).json({ success: false, message: 'Transcription can only be updated for completed files.' });
    }

    // Get the new transcription text from the request body
    const newTranscription = req.body.transcription;

    // Update the transcription in the audio document
    audioFile.transcription = newTranscription;

    // Save the updated audio document in MongoDB
    await audioFile.save();

    // Send a response indicating a successful update
    res.json({ success: true, message: 'Transcription updated successfully' });
  }

  catch(error) {
    console.error(error);

    // Send a response indicating an error occurred
    res.status(500).json({ success: false, message: 'An error occurred' });
  }

});

//////////////

// PUT or POST CSV path, PDF path to DB, front end will generate it and save it in the uploads/UID/RID/pdf blah blah blah 








////////////////////////////////
// old codebase jail for reference:


      // Send the file to the Flask backend  11-22
      // const response = await axios.post(flaskBackendUrl, {
      //   file: fileStream,// 11-22 fileBuffer,
      //   audioId: audioFile._id
      // }, {
      //   headers: {
      //       'Content-Type': 'multipart/form-data',
      //   },
      // });
          



      // if (response.statusCode === 200) {
      //   // Send a response with the id of the saved audio file
      //   res.json({ success: true, id: audioFile._id, message: 'File transfered and transcription initiated'});
      // }
      // else {
      //   res.json({ success: false, message: 'Failed to initiate transcription from Flask backend' });
      // }



// const fileUpload = require("express-fileupload"); // ideally switch this to multer
// const fs = require("fs");

// const assembly = axios.create({
//   baseURL: "https://api.assemblyai.com/v2",
//   headers: {
//     authorization: "c4c56ac5832249c1af9589d097463339",
//     "content-type": "application/json",
//     "transfer-encoding": "chunked",
//   },
// });

// app.use(
//   fileUpload({
//     useTempFiles: true,
//     safeFileNames: true,
//     preserveExtension: true,
//     tempFileDir: `${__dirname}/public/files/temp`,
//   })
// );

//       console.log("RESPONSE: ", response);
//       assembly
//         .post("/transcript", {
//           audio_url: response.data.upload_url,
//           speaker_labels: true,
//         })
//         .then((response) => {
//           // Interval for checking transcript completion
//           const checkCompletionInterval = setInterval(async () => {
//             const transcript = await assembly.get(`/transcript/${response.data.id}`);
//             const transcriptStatus = transcript.data.status;

//             if (transcriptStatus !== "completed") {
//               console.log(`Transcript Status: ${transcriptStatus}`);
//             } else if (transcriptStatus === "completed") {
//               console.log(`Transcript Status: ${transcriptStatus}`);
//               clearInterval(checkCompletionInterval);
//               const sentences = await assembly.get(`/transcript/${response.data.id}/sentences`);
//               return res.status(200).send(sentences.data);
//             }
//           }, refreshInterval);
//         });
//     });
//   });
// });