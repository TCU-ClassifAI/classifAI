const express = require("express");
const multer = require('multer'); // For handling file uploads
const cors = require("cors");
const axios = require("axios");
const mongoose = require('mongoose'); // For connecting to MongoDB
const fs = require('fs');
const path = require('path');
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
    cb(null, 'uploads')  // first argument is null because we don’t have any error to report, second is our uploads folder
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname))  // filename = filename + date + file extension
  }
});

var upload = multer({
  storage: storage,
  limits: {fileSize: 500 * 1024 * 1024} 
});

/////////////




///////////// MongoDB setup

// Connect to MongoDB using mongoose, not setup with an actual DB rn
mongoose.connect('mongodb://localhost:#####/transcription', { // switch to env variable later
    useNewUrlParser: true, 
    useUnifiedTopology: true 
    // add Connection Pooling for MongoDB? look into later
});

const mongo = mongoose.connection;
mongo.on('error', console.error.bind(console, 'connection error:'));
mongo.once('open', function() {
  console.log('Connected to MongoDB');
});

// Define a schema and a model for storing audio files in MongoDB
const audioSchema = new mongoose.Schema({
    //implement user_id when we figure out authentication
    // File ID: MongoDB automatically generates a unique id assigns it to the _id field
    filename: String,
    path: String,
    transcription: String,  //transcription itself is written into db
    status: String
});
const Audio = mongoose.model('Audio', audioSchema);

/////////////




app.get("/", (req, res) => {
  return res.status(200).send("It's working");
});

app.listen(PORT, () => {
  console.log("Server Running sucessfully.");
});


////////////// Upload endpoint: Stores file in the web server, uploads info to MongoDB, sends path to Workstation

app.post("/upload", upload.single('file'), async (req, res) => {
    if (!req.file) {
      res.status(400).json({ success: false, message: "No file uploaded" });
    }

    try {
      // Create a new audio document in MongoDB with the file info
      const audioFile = new Audio({
        filename: req.file.originalname,
        path: req.file.path,
        transcription: '',
        status: 'pending'
      });

      // Save the audio document in MongoDB
      await audioFile.save();

      const flaskBackendUrl = 'http://WORKSTATION:XXXX/transcribe';
      const response = await axios.post(flaskBackendUrl, {
        params:{
          // may need to supply audioFile id if Workstation is going to add transcript directly to DB
          path: audioFile.path, //if we need to supply the file instead, we can modify this
        },
      });

      // in the future, if workstation just wants to respond with transcript, web server will add the transcript to database here

      if (response.statusCode === 200) {
        // Send a response with the id of the saved audio file
        res.json({ success: true, id: audioFile._id, message: 'File uploaded and transcription initiated'});
      }
      else {
        res.json({ success: false, message: 'Failed to initiate transcription from Flask backend' });
      }


    } 
    catch(error) {
      console.error(error);

      // Send a response indicating an error occurred
      res.status(500).json({ success: false, message: "An error occurred" });
    } 
});

//////////////



////////////// Get transcript/analysis endpoint:  grab the transcript from the given audio file, assumes that it has been transcribed

app.get('/transcript/:id', async (req, res) => {
  try{
    // Find audio document in MongoDB given ID
    const audioFile = await Audio.findById(req.params.id);

    if (!audioFile) {
      // Send no audio file found error
      return res.status(404).json({ success: false, message: 'Audio file not found.'});
    }

    if (audioFile.status === 'pending'){
      // Send response indicating pending status
      return res.json({success: false, message:'Transcription still pending.'});
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
    const audioFile = await Audio.findById(req.params.id);

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







////////////////////////////////
// old codebase jail for reference:

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