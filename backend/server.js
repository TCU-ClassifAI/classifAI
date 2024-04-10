require('dotenv').config();
const express = require("express");
const cors = require("cors");
const https = require("https");
const fs = require('node:fs');
const bodyParser = require('body-parser');  //added to fix payload





const fileUploadRoute = require('./routes/fileUploadRoute.js');
const reportRoutes = require('./routes/reportRoutes.js');
const fileRoutes = require('./routes/fileRoutes.js');
const reportUploadRoute = require('./routes/reportUploadRoute.js');



//Idea bank:
  // What if in another js file we auto compress audio files when they've been uploaded?
//


const PORT = 5002; // env
const app = express();
app.use(cors());
app.use(express.json());

// fix payload error
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));

const options = {
  key: fs.readFileSync('/etc/letsencrypt/live/classifai.tcu.edu/privkey.pem'),
  cert: fs.readFileSync('/etc/letsencrypt/live/classifai.tcu.edu/fullchain.pem')
};




app.get("/", (req, res) => { // Dev route
  return res.status(200).send("It's working");
});

https.createServer(options, app).listen(PORT, () => {
  console.log(`Server is running on https://localhost:${PORT}`);
});

// app.listen(PORT, () => {
//   console.log("Server Running sucessfully.");
// });


app.use('/backend/reports',reportRoutes);
app.use('/backend/reports',reportUploadRoute); //WIP

app.use('/backend/files',fileRoutes);
app.use('/backend/files',fileUploadRoute);//, uploadRoute); //WIP


