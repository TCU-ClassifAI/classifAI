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
    jsonPath: String,
    csvPath: String,
    audioPath: String,
    userId: String,
    isPremium: Boolean,
    summary: String,
    gradeLevel: String,
    subject: String,
    topics: String,
    path: String,
    transcription: String,  // if we want to store transcription in DB 
    status: String
});
const Report = mongoose.model('Report', reportSchema);

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
const User = mongoose.model('User', userSchema);

// Define a schema and a model for storing admin accounts in MongoDB
const adminSchema = new mongoose.Schema({                           
  userID: String,
  email: String,
  name: String
});
const Admin = mongoose.model('Admin', adminSchema);

// other schemas



module.exports = Report;