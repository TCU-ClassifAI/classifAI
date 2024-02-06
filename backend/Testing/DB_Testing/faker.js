require('dotenv').config();
const faker = require('faker');
const dbconnect = require('../../mongo.js');

async function generateData() {
    let generatedUserIds = new Set(); // Keep track of generated user IDs to ensure uniqueness
    let reportIdCounter = 1000; // Start counter for reportId from 1000 for simplicity

    for (let i = 0; i < 10; i++) {
        let userId;
        do {
            // Generate a simple, human-readable user ID
            userId = `User${faker.datatype.number({ min: 1, max: 100 })}${faker.random.word().charAt(0).toUpperCase()}`;
        } while (generatedUserIds.has(userId)); // Ensure the userId is not already used
        generatedUserIds.add(userId); // Add the new userId to the set of generated IDs

        const status = faker.random.arrayElement(['in progress', 'error', 'completed']);
        const gradeLevel = faker.datatype.number({ min: 1, max: 12 }).toString(); // Ensure gradeLevel is a string
        let files = [];

        // Generate non-transcription files data
        const fileTypes = ['csv', 'json', 'pdf'];
        fileTypes.forEach(type => {
            // Use directoryPath to get a directory, then append a file name and extension
            const directoryPath = faker.system.directoryPath();
            const fileName = `${faker.system.fileName().split('.')[0]}.${type}`;
            const filePath = `${directoryPath}/${fileName}`;
            
            files.push({
                fileName: fileName,
                filePath: filePath,
                fileType: type,
            });
        });

        let transcription = '';
        // Generate transcription data if status is 'completed'
        if (status === 'completed') {
            let lastEndTime = 0; // Initialize the last end time to 0
            let transcriptionContent = [];
            for (let j = 0; j < 5; j++) {
                const startTime = lastEndTime; // Start time for current segment is the end time of the last segment
                const segmentDuration = faker.datatype.number({ min: 1, max: 30 }); // Duration of this segment
                const endTime = startTime + segmentDuration; // End time for this segment
                lastEndTime = endTime; // Update lastEndTime for the next iteration

                transcriptionContent.push({
                    start_time: startTime,
                    end_time: endTime,
                    speaker_label: `spk_${faker.datatype.number({ min: 1, max: 3 })}`,
                    transcript: faker.lorem.sentence()
                });
            }

            // Serialize the transcription content array to a JSON string
            transcription = JSON.stringify(transcriptionContent);
        }

        const reportData = {
            files: files,
            reportId: reportIdCounter.toString(), // Use a simple, unique number for reportId
            userId: userId,
            isPremium: faker.datatype.boolean(),
            summary: faker.lorem.sentence(),
            gradeLevel: gradeLevel,
            subject: faker.random.word(),
            topics: faker.random.words(),
            transcription: transcription, // Assign generated transcription data here
            status: status
        };

        // Create report in database
        await dbconnect.createReport(reportData);
        reportIdCounter++; // Increment for the next ID
    }

    console.log('Sample data generated');
    process.exit(); // Quit the program after generating data
}

generateData();
