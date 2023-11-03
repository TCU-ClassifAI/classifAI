db = db.getSiblingDB('ClassifAI');
db.auth('user', 'secret');

// Inserting example user with specific fields
db.user.insertMany([
  {
    Email: "j.l.hill@tcu.com",
    FirstName: "Jaxon",
    UserID: 12345678, // Assuming UserID is unique and an integer
    HashedPassword: "e3b0c44298fc1c149afbf4c8996fb924" // Example of a 32 char hash
  }
]);

// Inserting example transcript with specific fields and a foreign key relationship to the user
db.transcript.insertMany([
  {
    TranscriptID: 87654321, // Assuming TranscriptID is unique and an integer
    UserID: 12345678, // This should match a UserID from the user collection
    GradeLevel: 12, // Assuming this is a grade level and a 2 digit integer
    Subject: "Biology",
    TextFile: "/var/database-files/UserID/12345678/87654321/TextFile", // Replace with the actual file path
    ClassifiedText: "/var/database-files/UserID/12345678/87654321/ClassifiedText", // Replace with the actual file path
    Edits: "/var/database-files/UserID/12345678/87654321/Edits", // Replace with the actual file path
    PreEditTranscript: "/var/database-files/UserID/12345678/87654321/PreEditTranscript" // Replace with the actual file path
  }
]);
