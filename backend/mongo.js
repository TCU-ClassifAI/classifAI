// Pasted from server.js, feel free to make any changes

const mongoose = require('mongoose'); 


// Connect to MongoDB using mongoose, not setup with an actual DB 
mongoose.connect(process.env.MONGODB_URL)  // connect to MongoDB on localhost
  .catch(error => console.error("Error connecting to MongoDB:", error));


const mongo = mongoose.connection;
mongo.on('error', console.error.bind(console, 'connection error:'));
mongo.once('open', function() {
  console.log('Connected to MongoDB');
});

// Define a schema and a model for storing audio files in MongoDB
const reportSchema = new mongoose.Schema({                           
   
    audioFile: String,

    files: [{   //added 1/23
      fileName: String,
      filePath: String,
      fileType: String, // csv, json, pdf, audio, etc
        
    }],

    reportName: String,
    reportId: String,
    userId: String,
    isPremium: Boolean,
    summary: String,
    gradeLevel: String,
    subject: String,
    topics: String,
    path: String,
    transcription: String,  // if we want to store transcription in DB 
    status: String,

    transferData: {
      _id: false,
      fileName: String,
      duration: Number,
      end_time: String,
      job_id: String,
      job_type: String,
      model_type: String,
      start_time: String,
      status: String,
      progress: String,
      message: String,
      result: [{
        speaker: String,
        start_time: Number,
        end_time: Number,
        text: String,
        confidence: Number,
      }]
      // Include any other fields as necessary
  }
});

// Define a schema and a model for storing users in MongoDB
const userSchema = new mongoose.Schema({                           
    userId: String,
    school: String,
    email: String,
    reportCount: String,
    audioLength: String,
    isPremium: Boolean,
    name: String,
    state: String,
    disabledAccount: Boolean
});

// Define a schema and a model for storing admin accounts in MongoDB
const adminSchema = new mongoose.Schema({                           
  userId: String,
  email: String,
  name: String
});

const User = mongoose.model('User', userSchema);
const Admin = mongoose.model('Admin', adminSchema);
const Report = mongoose.model('Report', reportSchema);

// CRUD operations
// userSchema ------------------------------------------

// Create User
async function createUser(data) {
  const user = new User(data);
  return await user.save();
}

// Read User
async function getUser(id) {
  return await User.findOne({ userId: id });
}

// Get User Where - search by query
// expected input: getUserWhere({ state: someState })
async function getUserWhere(query) {
  return await User.findOne(query);
}

// Update User
async function updateUser(id, data) {
  return await User.findOneAndUpdate({ userId: id }, data, { new: true });
}

// Delete User
async function deleteUser(id) {
  return await User.findOneAndDelete({ userId: id });
}

// reportSchema ------------------------------------------

// Create Report - this function assumes that an userID will always be passed when creating a new report
async function createReport(data) {
  
  // Check if reportId is already provided in the data
  if (!data.reportId) {
    // generate a reportID for this entry, assign it to the report
    const newRID = await generateUniqueReportID(data.userId);
    data.reportId = newRID; // Set the reportID in the data
  }
  
  const report = new Report(data);
  await report.save();

  // return the report to the caller
  return report;
}

// Read Report
async function getReport(id) {
  return await Report.findOne({ reportId: id });
}

// Get Report  - search by query
// expected input: getReportWhere({ userID: someUserID })
async function getReportWhere(query) {
  return await Report.findOne(query);
}

// Get All Reports by UserID
async function getAllReportsWhere(query) {
  return await Report.find(query);
}

// Update to ensure operations are based on both userId and reportId
async function updateReport(query, data) {
  return await Report.findOneAndUpdate(query, data, { new: true });
}

// // Update Report
// async function updateReport(id, data) {
//   return await Report.findOneAndUpdate({ reportId: id }, data, { new: true });
// }

// Delete Report
async function deleteReport(id) {
  return await Report.findOneAndDelete({ reportId: id });
}

// adminSchema ---------------------------------------------

// Create Admin
async function createAdmin(data) {
  const admin = new Admin(data);
  return await admin.save();
}

// Read Admin
async function getAdmin(id) {
  return await Admin.findOne({ userId: id });
}

// Update Admin
async function updateAdmin(id, data) {
  return await Admin.findOneAndUpdate({ userId: id }, data, { new: true });
}

// Delete Admin
async function deleteAdmin(id) {
  return await Admin.findOneAndDelete({ userId: id });
}

// Util Functions

// Generate new reportID
async function generateUniqueReportID(userId) {
  let isUnique = false;
  let reportId;

  while (!isUnique) {
    // Generate a random 4-digit number
    reportId = Math.floor(1000 + Math.random() * 9000);

    // Check if this reportID already exists for the given userID
    const existingReport = await Report.findOne({ reportId: reportId, userId: userId });
    if (!existingReport) {
      isUnique = true;
    }
  }

  return reportId;
}


module.exports.Report = Report;
module.exports.User = User;
module.exports.Admin = Admin;

module.exports = {
  createUser,
  getUser,
  getUserWhere,
  updateUser,
  deleteUser,

  createReport,
  getReport,
  getReportWhere,
  getAllReportsWhere,
  updateReport,
  deleteReport,

  createAdmin,
  getAdmin,
  updateAdmin,
  deleteAdmin,
};