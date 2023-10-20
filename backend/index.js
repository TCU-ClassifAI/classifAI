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
    filename: String,
    path: String,
    transcription: String,  //transcription itself is written into db, we could change this to a path leading to a sepearte file if needed
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



///////////// Transcription endpoint

//  Uploads the files an /upload folder, returns location to send to Workstation
app.post("/transcribe", upload.single('file'), async function (req, res) {
  if (req.file) {
        let audioFile;
        try {
            // If we get a file, we want to create a new audio document in MongoDB with the file info
            const audioFile = new Audio({
                filename: req.file.originalname,
                path: req.file.path,
                transcription: '',
                status: 'pending'
            });
            await audioFile.save();

            // Sending audioFile path to workstation for transcription approach:
            // const workstationResponse = await axios.post(
            //     "http://workstation-machine/transcribe",
            //     { path: audioFile.path }
            // );


            // Streaming the audioFile itself to the workstation for transcription approach:
            // Create a read stream for the file
            const fileStream = fs.createReadStream(audioFile.path); 
            // Send audioFile to workstation for transcription
            const workstationResponse = await axios.post(
              "http://workstation-machine/transcribe",
              fileStream,
              { headers: { 'Content-Type': 'application/octet-stream' } }
            );
            // The file is read and sent in chunks; more memory-efficient than reading the entire file into memory at once


            // Update the audioFile document with transcription and status from the workstation
            audioFile.transcription = workstationResponse.data.transcription;
            audioFile.status = workstationResponse.data.status;
            await audioFile.save();
            res.json({ success: true, id: audioFile._id });
        }

        catch(error){
            console.error(error);
            // Update status and save to indicate an error
            if (audioFile) {
              audioFile.status = "error";
              await audioFile.save();
            }
            res.json({ success: false, message: "An error occurred" });
        }
    } 
  else {
    res.status(400).json({ success: false, message: "No file uploaded" });
  }
});

/////////////



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