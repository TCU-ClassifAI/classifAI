require('dotenv').config();
const faker = require('faker');
const dbconnect = require('../../mongo.js');

async function generateData() {
    for (let i = 0; i < 10; i++) {
        // Sample data
        const userId = faker.datatype.uuid();
        const status = faker.random.arrayElement(['in progress', 'error', 'completed']);
        const gradeLevel = faker.datatype.number({ min: 1, max: 12 });
        let transcriptions = [];

        if (status === 'completed') {
            for (let j = 0; j < 5; j++) { // Generate 5 transcript segments
                const startTime = faker.datatype.number({min: 0, max: 300, precision: 1}); // e.g., 0 to 300 seconds
                const endTime = startTime + faker.datatype.number({min: 1, max: 30, precision: 1}); // e.g., 1 to 30 seconds more
                transcriptions.push({
                    start_time: startTime,
                    end_time: endTime,
                    speaker_label: `spk_${faker.datatype.number({min: 1, max: 3})}`,
                    transcript: faker.lorem.sentence()
                });
            }
        }

        // Create a report with random data
        const reportData = {
            csvPath: faker.system.filePath(),
            jsonPath: faker.system.filePath(),
            pdfPath: faker.system.filePath(),
            audioPath: faker.system.filePath(),
            reportID: faker.datatype.uuid(),
            userID: userId,
            isPremium: faker.datatype.boolean(),
            summary: faker.lorem.sentence(),
            gradeLevel: gradeLevel,
            subject: faker.random.word(),
            topics: faker.random.words(),
            path: faker.system.filePath(),
            transcription: JSON.stringify(transcriptions), // Store transcription as a JSON string
            status: status
        };

        // Create report
        await dbconnect.createReport(reportData);
    }
}

generateData().then(() => console.log('Sample data generated'));
