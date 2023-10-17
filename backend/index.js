// taken from legacy codebase

const express = require("express");
const multer = require('multer'); // For handling file uploads
const cors = require("cors");
const axios = require("axios");
const mongoose = require('mongoose'); // For connecting to MongoDB


// Configure multer to store uploaded files in a folder named 'uploads'
// Look into file streaming: Streaming is more memory-efficient, especially for large files, because it doesn't require holding the entire file in memory.
const upload = multer({ 
    dest: 'uploads/',
    limits: { fileSize: 500 * 1024 * 1024 }, // 500 MB limit
    }); 
const PORT = 5000;
const app = express();
app.use(cors());



///////////// MongoDB setup

// Connect to MongoDB using mongoose, not setup with an actual DB rn
mongoose.connect('mongodb://localhost:#####/transcription', { 
    useNewUrlParser: true, 
    useUnifiedTopology: true 
});

const mongo = mongoose.connection;
mongo.on('error', console.error.bind(console, 'connection error:'));
mongo.once('open', function() {
  console.log('Connected to MongoDB');
});

// Define a schema and a model for storing audio files in MongoDB
const audioSchema = new mongoose.Schema({
  filename: String,
  path: String,
  transcription: String,
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
        try {
            // I we get a file, we want to create a new audio document in MongoDB with the file info
            const audioFile = new Audio({
                filename: req.file.originalname,
                path: req.file.path,
                transcription: '',
                status: 'pending'
            });
            await audioFile.save;

            // Send audioFile path to workstation for transcription
            const workstationResponse = await axios.post(
                "http://workstation-machine/transcribe",
                { path: audioFile.path }
            );

            // Update the audioFile document with transcription and status from the workstation
            audioFile.transcription = workstationResponse.data.transcription;
            audioFile.status = workstationResponse.data.status;
            await audioFile.save();
            res.json({ success: true, id: audioFile._id });
        }

        catch(error){
            console.error(error);
            // Update status and save to indicate an error
            audioFile.status = "error";
            await audioFile.save();
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