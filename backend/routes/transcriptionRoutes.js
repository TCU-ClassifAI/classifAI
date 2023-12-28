const express = require("express");

const dbconnect = require('../mongo.js');
const router = express.Router();



//////////// Get transcript/analysis endpoint:  grab the transcript if available from the given audio file
router.get('/:reportID', async (req, res) => {
    try{
      // Find audio document in MongoDB given ID
      const report = await dbconnect.getReport(req.params.reportID);
  
      if (!report) {
        // Send no report found error
        return res.status(404).json({ success: false, message: 'Report file not found.'});
      }
  
      if (report.status === 'error') {
        // Send a response indicating an error occurred during transcription
        return res.json({ success: false, message: "An error occurred during transcription" });
      }
  
      if (report.status != 'Completed'){
        // Send response indicating pending status
        return res.json({success: false, message:'Transcription in progress.'});
      }
  
      // Send a response with the transcription of the audio file
      res.json({ success: true, transcription: report.transcription });
  
    }
    catch(error) {
      res.status(500).json({ success: false, message: "An error occurred" });
    }
  });
////////////



//////////// Update Transcription with changes, this will probably need more work
router.put('/:reportID', async (req, res) => {
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
//////////// 

module.exports = router;
