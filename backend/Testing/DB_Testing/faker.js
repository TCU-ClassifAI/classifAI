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
            const directoryPath = faker.system.directoryPath();
            // fileName now generated without extension
            const fileNameWithoutExtension = faker.system.fileName().replace(/\..+$/, '');
            // filePath includes the fileName with the appropriate extension
            const filePath = `${directoryPath}/${fileNameWithoutExtension}.${type}`;
            
            files.push({
                fileName: fileNameWithoutExtension, // Now correctly does not include the extension
                filePath: filePath, // Path includes the file extension
                fileType: type,
            });
        });

        let transcription = '';
        // Generate transcription data if status is 'completed'
        if (status === 'completed') {
            let lastEndTime = 0;
            let transcriptionContent = [];
            for (let j = 0; j < 5; j++) {
                const startTime = lastEndTime;
                const segmentDuration = faker.datatype.number({ min: 1, max: 30 });
                const endTime = startTime + segmentDuration;
                lastEndTime = endTime;

                transcriptionContent.push({
                    start_time: startTime,
                    end_time: endTime,
                    speaker_label: `spk_${faker.datatype.number({ min: 1, max: 3 })}`,
                    transcript: faker.lorem.sentence()
                });
            }
            transcription = JSON.stringify(transcriptionContent);
        }

        const reportData = {
            files: files,
            reportId: reportIdCounter.toString(),
            userId: userId,
            isPremium: faker.datatype.boolean(),
            summary: faker.lorem.sentence(),
            gradeLevel: gradeLevel,
            subject: faker.random.word(),
            topics: faker.random.words(),
            transcription: transcription,
            status: status
        };

        await dbconnect.createReport(reportData);
        reportIdCounter++; // Increment for the next ID
    }

    console.log('Sample data generated');
    process.exit(); // Quit the program after generating data
}

generateData();
