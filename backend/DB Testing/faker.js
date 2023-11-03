require('dotenv').config();
const mongoose = require('mongoose');
const faker = require('faker');



///////////// MongoDB setup

mongoose.connect(process.env.MONGODB_URL)
  .catch(error => console.error("Error connecting to MongoDB:", error));


const mongo = mongoose.connection;
mongo.on('error', console.error.bind(console, 'connection error:'));
mongo.once('open', function() {
  console.log('Connected to MongoDB');
});

const audioSchema = new mongoose.Schema({
    filename: String,
    path: String,
    transcription: String,
    status: String
});

const Audio = mongoose.model('Audio', audioSchema);

/////////////


async function generateData() {
    for(let i = 0; i < 100; i++) { // Generate 100 sample data
        const status = faker.random.arrayElement(['in progress', 'error', 'completed']);
        let transcription = '';

        if(status === 'completed') { // Only compeleted entries have a transcription
            const transcriptions = [];
            for(let j = 0; j < 5; j++) { // Generate 5 transcription objects
                const startTime = faker.datatype.number({min:0, max:60, precision:0.1});
                const endTime = faker.datatype.number({min:startTime, max:startTime+5, precision:0.1});
                transcriptions.push({
                    start_time: startTime,
                    end_time: endTime,
                    speaker_label: `spk_${faker.datatype.number({min:1, max:3})}`,
                    transcript: faker.lorem.sentence()
                });
            }
            transcription = JSON.stringify(transcriptions);
        }

        const audio = new Audio({
            filename: faker.system.fileName(),
            path: faker.system.filePath(),
            transcription: transcription,
            status: status
        });

        await audio.save();
    }
}

generateData().then(() => console.log('Sample data generated'));

