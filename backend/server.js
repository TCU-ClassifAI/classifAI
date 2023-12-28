require('dotenv').config();
const express = require("express");
const multer = require('multer'); // For handling file uploads
const cors = require("cors");
const axios = require("axios");
const fs = require('fs');
const path = require('path');
const FormData = require('form-data');


const dbconnect = require('./mongo');
const uploadRoute = require('./routes/uploadRoute.js');


// Look into PQueue; improve the performance by processing multiple files concurrently (specified by the concurrency option)

const PORT = 5000;
const app = express();
app.use(cors());

// SHOULD EXIST IN .env
// FlaskBackendURL
// 



//  What if in another js file we auto compress audio files when they've been uploaded?




/////////////


app.get("/", (req, res) => {
  return res.status(200).send("It's working");
});



app.listen(PORT, () => {
  console.log("Server Running sucessfully.");
});


app.use('/upload', uploadRoute); //test






////////////// Get transcript/analysis endpoint:  grab the transcript if available from the given audio file

app.get('/transcript/:reportID', async (req, res) => {
  try{
    // Find audio document in MongoDB given ID
    const report = await dbconnect.getReport(req.params.reportID);

    if (!report) {
      // Send no report found error
      return res.status(404).json({ success: false, message: 'Report file not found.'});
    }

    if (report.status === 'in progress'){
      // Send response indicating pending status
      return res.json({success: false, message:'Transcription still in progress.'});
    }

    if (audioFile.status === 'error') {
      // Send a response indicating an error occurred during transcription
      return res.json({ success: false, message: "An error occurred during transcription" });
    }

    // Send a response with the transcription of the audio file
    res.json({ success: true, transcription: report.transcription });

  }
  catch(error) {
    res.status(500).json({ success: false, message: "An error occurred" });
  }
});

//////////////




////////////// Update Transcription with changes, this will probably need more work

app.put('/transcript/:reportID', async(req, res) => {
  try {
    // Find audio document in MongoDB given ID
    const report = await dbconnect.getReport(req.params.reportID);

    if (!report) {
      // Send a response indicating that the audio file was not found
      return res.status(404).json({ success: false, message: 'Report file not found.' });
    }

    if (report.status !== 'complete') {
      // Restrict updates to completed transcriptions only
      return res.status(400).json({ success: false, message: 'Transcription can only be updated for completed files.' });
    }

    // Get the new transcription text from the request body
    const newTranscription = req.body.transcription;

    // Update the transcription in the audio document
    await dbconnect.updateReport(report.reportID, {transcription: newTranscription} );

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