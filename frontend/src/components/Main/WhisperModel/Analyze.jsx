import UploadRecording from "./UploadRecording";
import FullTranscript from "./FullTranscript";
import CsvOptions from "./CsvOptions";
import WordCloud from "./WordCloud";
import TalkingDistribution from "./TalkingDistribution";
import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Auth } from "aws-amplify";
import { Tab, Tabs } from "react-bootstrap";
import ParentSize from "@visx/responsive/lib/components/ParentSize";

export default function Analyze() {
  const [userId, setUserId] = useState("");
  const [reportId, setReportId] = useState("");
  const [transcription, setTranscription] = useState([]);
  const [analysisStatus, setAnalysisStatus] = useState("");
  const [reportName, setReportName] = useState("");
  const [teacher, setTeacher] = useState();
  const [show, setShow] = useState(false);
  const [speakers, setSpeakers] = useState();
  const location = useLocation();

  useEffect(() => {
    generateDefaultReportId();
  }, []);

  useEffect(() => {
    if (location.state && location.state.reportId) {
      // Remove the extra closing parenthesis
      setReportId(location.state.reportId);
    }
  }, [location]);

  useEffect(() => {
    async function retrieveUserInfo() {
      try {
        const user = await Auth.currentAuthenticatedUser();
        const { attributes } = user;
        setUserId(attributes.email);
        console.log(attributes.email); // Ensure userId is set correctly
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    }
    retrieveUserInfo();
  }, []);

  useEffect(() => {
    // Calculate speaking time for each speaker
    const speakingTime = {};
    transcription.forEach((sentence) => {
      const speaker = sentence.speaker;
      const duration = sentence.end_time - sentence.start_time;
      speakingTime[speaker] = (speakingTime[speaker] || 0) + duration;
    });

    // Find the speaker with the highest speaking time
    let maxSpeakingTime = 0;
    let mostSpeakingSpeaker = "";
    for (const speaker in speakingTime) {
      if (speakingTime[speaker] > maxSpeakingTime) {
        maxSpeakingTime = speakingTime[speaker];
        mostSpeakingSpeaker = speaker;
      }
    }

    // Set the speaker with the highest speaking time as teacher
    setTeacher(mostSpeakingSpeaker);

    // Set unique speakers
    setSpeakers(Object.keys(speakingTime));
  }, [transcription]);

  function generateDefaultReportId() {
    const timestamp = new Date().getTime(); // Get current timestamp
    const randomString = Math.random().toString(36).substring(2, 8); // Generate a random string
    const reportId = `${timestamp}_${randomString}`; // Combine timestamp and random string
    setReportId(reportId);
  }

  function createSentenceList() {
    let sentenceListStr = "";
    if (transcription) {
      for (let i = 0; i < transcription.length; i++) {
        sentenceListStr += " " + transcription[i].text;
      }
    }
    return sentenceListStr;
  }

  function handleInputChange(event) {
    event.persist();
    setReportName(event.target.value);
  }

  return (
    <>
      {analysisStatus !== "completed" && (
        <UploadRecording
          reportName={reportName}
          reportId={reportId}
          setReportId={setReportId}
          userId={userId}
          transcription={transcription}
          setTranscription={setTranscription}
          analysisStatus={analysisStatus}
          setAnalysisStatus={setAnalysisStatus}
          location={location}
        />
      )}

      {analysisStatus === "completed" && (
        <div>
          <input
            placeholder="Name this report"
            onBlur={handleInputChange}
            id="name-report"
          ></input>
          <Tabs id="controlled-tab-example">
            <Tab eventKey="TranscriptKey" title="Full Transcript">
              <FullTranscript
                transcription={transcription}
                setTranscription={setTranscription}
                speakers={speakers}
                setSpeakers={setSpeakers}
                teacher={teacher}
                setShow={setShow}
                show={show}
              />
            </Tab>
            <Tab eventKey="talkingdistribution" title="Talking Distribution">
              <TalkingDistribution
                transcription={transcription}
                teacher={teacher}
              />
            </Tab>
            <Tab eventKey="wordcloud" title="Visualization">
              <ParentSize>
                {({ width, height }) => (
                  <WordCloud
                    width={width}
                    height={600}
                    showControls="true"
                    transcript={createSentenceList()}
                  />
                )}
              </ParentSize>
            </Tab>
          </Tabs>

          <CsvOptions
            transcription={transcription}
            reportId={reportId}
            userId={userId}
          />
        </div>
      )}
    </>
  );
}
