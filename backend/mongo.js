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
    // Report ID: MongoDB automatically generates a unique id assigns it to the _id field
    csvPath: String,
    jsonPath: String,
    pdfPath: String,
    audioPath: String,
    reportID: String,
    userID: String,
    isPremium: Boolean,
    summary: String,
    gradeLevel: String,
    subject: String,
    topics: String,
    path: String,
    transcription: String,  // if we want to store transcription in DB 
    status: String
});

// Define a schema and a model for storing users in MongoDB
const userSchema = new mongoose.Schema({                           
    userID: String,
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
  userID: String,
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
  return await User.findOne({ userID: id });
}

// Update User
async function updateUser(id, data) {
  return await User.findOneAndUpdate({ userID: id }, data, { new: true });
}

// Delete User
async function deleteUser(id) {
  return await User.findOneAndDelete({ userID: id });
}

// reportSchema ------------------------------------------

// Create Report - this function assumes that an userID will always be passed when creating a new report
async function createReport(data) {
  // generate a reportID for this entry, assign it to the report
  const newRID = generateUniqueReportID(data.userID);

  const report = new Report(data, newRID);
  await report.save();

  // return the report to the caller
  return report;
}

// Read Report
async function getReport(id) {
  return await Report.findOne({ reportID: id });
}

// Update Report
async function updateReport(id, data) {
  return await Report.findOneAndUpdate({ reportID: id }, data, { new: true });
}

// Delete Report
async function deleteReport(id) {
  return await Report.findOneAndDelete({ reportID: id });
}

// adminSchema ---------------------------------------------

// Create Admin
async function createAdmin(data) {
  const admin = new Admin(data);
  return await admin.save();
}

// Read Admin
async function getAdmin(id) {
  return await Admin.findOne({ userID: id });
}

// Update Admin
async function updateAdmin(id, data) {
  return await Admin.findOneAndUpdate({ userID: id }, data, { new: true });
}

// Delete Admin
async function deleteAdmin(id) {
  return await Admin.findOneAndDelete({ userID: id });
}

// Util Functions

// Generate new reportID
async function generateUniqueReportID(userID) {
  let isUnique = false;
  let reportID;

  while (!isUnique) {
    // Generate a random 4-digit number
    reportID = Math.floor(1000 + Math.random() * 9000);

    // Check if this reportID already exists for the given userID
    const existingReport = await Report.findOne({ reportID, userID });
    if (!existingReport) {
      isUnique = true;
    }
  }

  return reportID;
}


module.exports.Report = Report;
module.exports.User = User;
module.exports.Admin = Admin;