const express = require("express");
const dbconnect = require('../mongo.js');
const router = express.Router();


//////////// Get transcript endpoint
router.get('/:reportID', async (req, res) => {
  try {
    const report = await findReport(req.params.reportID, res);
    if (!report) return;

    switch (report.status) {
      case 'error':
        res.json({ success: false, message: "An error occurred during transcription" });
        break;

      case 'completed' || 'Completed':
        res.json({ success: true, transcription: report.transcription });
        break;

      default:
        res.json({ success: false, message: 'Transcription in progress.' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "An error occurred" });
  }
});
////////////



//////////// Update Transcription endpoint
router.put('/:reportID', async (req, res) => {
  try {
    const report = await findReport(req.params.reportID, res);
    if (!report) return;

    if (report.status !== 'Completed') {
      return res.status(400).json({ success: false, message: 'Transcription can only be updated for completed files.' });
    }

    await dbconnect.updateReport(report.reportID, { transcription: req.body.transcription });
    res.json({ success: true, message: 'Transcription updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'An error occurred' });
  }
});
////////////

// Helper function to find and handle report retrieval
async function findReport(reportID, res) {
    const report = await dbconnect.getReport(reportID);
    if (!report) {
      res.status(404).json({ success: false, message: 'Report file not found.' });
      return null;
    }
    return report;
}

module.exports = router;
