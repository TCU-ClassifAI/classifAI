import axios from "axios";

const assembly = axios.create({
  baseURL: "https://api.assemblyai.com/v2",
  headers: {
    authorization: "c4c56ac5832249c1af9589d097463339",
    "content-type": "application/json",
  },
});

export const uploadFile = async (fileContent) => {
  const response = await assembly.post("/upload", fileContent);
  return response.data.upload_url;
};

export const transcribeFile = async (audioUrl) => {
  try {
    const response = await assembly.post("/transcript", {
      audio_url: audioUrl,
      speaker_labels: true,
    });

    return new Promise((resolve, reject) => {
      const checkCompletionInterval = setInterval(async () => {
        const transcript = await assembly.get(`/transcript/${response.data.id}`);
        const transcriptStatus = transcript.data.status;

        if (transcriptStatus !== "completed") {
          console.log(`Transcript Status: ${transcriptStatus}`);
        } else if (transcriptStatus === "completed") {
          clearInterval(checkCompletionInterval);
          const result = await assembly.get(`/transcript/${response.data.id}/sentences`);
          console.log("result: ", result);
          resolve(result.data.sentences);
        }
      }, 5000); // refresh interval
    });
  } catch (error) {
    console.error(error);
    return null; // return null if there's an error
  }
};

