require('dotenv').config();
const express = require("express");
const cors = require("cors");

const uploadRoute = require('./routes/uploadRoute.js');
const transcriptionRoutes = require('./routes/transcriptionRoutes.js'); // Adjust the path as necessary


//Idea bank:
  // Look into PQueue; improve the performance by processing multiple files concurrently (specified by the concurrency option)
  // What if in another js file we auto compress audio files when they've been uploaded?
//

const PORT = 5000;
const app = express();
app.use(cors());




app.get("/", (req, res) => { // Dev route
  return res.status(200).send("It's working");
});

app.listen(PORT, () => {
  console.log("Server Running sucessfully.");
});

app.use('/upload', uploadRoute); // Testing: audio upload works as expected on newest refactor 12/28, uploaded files given reportID are put into the same folder

app.use('/transcript', transcriptionRoutes);











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