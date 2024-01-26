const express = require("express");
const dbconnect = require('../mongo.js');
const router = express.Router();


//////////// Get Report endpoint
router.get('/:reportID', async (req, res) => {
  try {
    const report = await findReport(req.params.reportID, res);
    if (!report) return;
    res.json({ success: true, report: report });


  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "An error occurred" });
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
