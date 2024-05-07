import UploadRecording from "./UploadRecording";
import FullTranscript from "./FullTranscript";
import CsvOptions from "./CsvOptions";
import WordCloud from "./WordCloud";
import ReportInfo from "./ReportInfo";
import SaveChanges from "./SaveChanges";
import TalkingDistribution from "./TalkingDistribution";
import PdfOptions from "./PdfOptions";
import QuestionCategorization from "./QuestionCategorization";
import QuestionDistribution from "./QuestionDistribution";
import CollapsedTimeline from "./CollapsedTimeline";
import TeacherQuestionTimeline from "./TeacherQuestionTimeline";
import Summarization from "./Summarization";
import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Auth } from "aws-amplify";
import { Tab, Tabs, Modal, Button } from "react-bootstrap";
import Alert from "@mui/material/Alert";
import ParentSize from "@visx/responsive/lib/components/ParentSize";
import dayjs from "dayjs";

export default function Analyze() {
  const [userId, setUserId] = useState("");
  const [reportId, setReportId] = useState("");
  const [gradeLevel, setGradeLevel] = useState("");
  const [subject, setSubject] = useState("");
  const [dateTime, setDateTime] = useState(dayjs());
  const [transcription, setTranscription] = useState([]);
  const [analysisStatus, setAnalysisStatus] = useState("");
  const [reportName, setReportName] = useState("");
  const [teacher, setTeacher] = useState();
  const [show, setShow] = useState(false);
  const [changeAlert, setChangeAlert] = useState(false);
  const [showCsvModal, setShowCsvModal] = useState(false);
  const [speakers, setSpeakers] = useState();
  const [categorizedQuestions, setCategorizedQuestions] = useState([]);
  const [summary, setSummary] = useState("");
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
        setGradeLevel(attributes["custom:grade_level"]);
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    }
    // console.log(import.meta.env.VITE_BACKEND_SERVER);
    retrieveUserInfo();
  }, []);

  useEffect(() => {
    // Calculate speaking time for each speaker
    console.log(analysisStatus);
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
  }, [transcription, analysisStatus]);

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

  return (
    <>
      {changeAlert &&
        (analysisStatus === "finished" || analysisStatus === "completed") && (
          <div>
            <Alert severity="warning">
              There are unsaved changes. Use 'Save Changes' to save them.
            </Alert>
            <SaveChanges
              reportName={reportName}
              subject={subject}
              gradeLevel={gradeLevel}
              reportId={reportId}
              dateTime={dateTime}
              userId={userId}
              setChangeAlert={setChangeAlert}
              transcription={transcription}
              categorizedQuestions={categorizedQuestions}
            />
          </div>
        )}

      {userId && (
        <ReportInfo
          key={`${reportName}-${gradeLevel}-${subject}`}
          gradeLevel={gradeLevel}
          subject={subject}
          reportName={reportName}
          dateTime={dateTime}
          setReportName={setReportName}
          setGradeLevel={setGradeLevel}
          setSubject={setSubject}
          setChangeAlert={setChangeAlert}
          setDateTime={setDateTime}
          analysisStatus={analysisStatus}
        />
      )}

      {!(analysisStatus === "finished" || analysisStatus === "completed") && (
        <UploadRecording
          reportName={reportName}
          gradeLevel={gradeLevel}
          subject={subject}
          reportId={reportId}
          dateTime={dateTime}
          setSubject={setSubject}
          userId={userId}
          transcription={transcription}
          setReportName={setReportName}
          setTranscription={setTranscription}
          setGradeLevel={setGradeLevel}
          setDateTime={setDateTime}
          setAnalysisStatus={setAnalysisStatus}
          analysisStatus={analysisStatus}
          location={location}
          setCategorizedQuestions={setCategorizedQuestions}
          setSummary={setSummary}
        />
      )}

      {(analysisStatus === "completed" || analysisStatus === "finished") && (
        <div>
          <Tabs id="controlled-tab-example">
            <Tab eventKey="TranscriptKey" title="Full Transcript">
              <FullTranscript
                transcription={transcription}
                setTranscription={setTranscription}
                categorizedQuestions={categorizedQuestions}
                setCategorizedQuestions={setCategorizedQuestions}
                speakers={speakers}
                setSpeakers={setSpeakers}
                teacher={teacher}
                setShow={setShow}
                show={show}
                setChangeAlert={setChangeAlert}
              />
            </Tab>
            <Tab eventKey="talkingdistribution" title="Talking Distribution">
              <TalkingDistribution
                transcription={transcription}
                teacher={teacher}
              />
            </Tab>
            <Tab eventKey="wordcloud" title="Word Visualization">
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
            <Tab eventKey="summary" title="Summarization">
              <Summarization summary={summary} />
            </Tab>
            <Tab eventKey="categorization" title="Question Categorization">
              <QuestionCategorization
                userId={userId}
                reportId={reportId}
                setCategorizedQuestions={setCategorizedQuestions}
                categorizedQuestions={categorizedQuestions}
                setChangeAlert={setChangeAlert}
              />
            </Tab>
            <Tab eventKey="categorizedDist" title="Question Distribution">
              <QuestionDistribution
                categorizedQuestions={categorizedQuestions}
              />
            </Tab>
            <Tab eventKey="teacherTimeline" title="Question Timeline">
              <TeacherQuestionTimeline
                categorizedQuestions={categorizedQuestions}
              />
            </Tab>
            <Tab eventKey="collapsedTimeline" title="Collapsed Timeline">
              <CollapsedTimeline categorizedQuestions={categorizedQuestions} />
            </Tab>
          </Tabs>

          <div>
            <button
              className="btn btn-primary"
              onClick={() => {
                setShowCsvModal(true);
              }}
            >
              Save & Download CSV
            </button>
          </div>

          <Modal
            show={showCsvModal}
            onHide={() => {
              setShowCsvModal(false);
            }}
          >
            <Modal.Header closeButton>
              <Modal.Title>CSV Options</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              {
                <CsvOptions
                  transcription={transcription}
                  categorizedQuestions={categorizedQuestions}
                  reportId={reportId}
                  userId={userId}
                />
              }
            </Modal.Body>
            <Modal.Footer>
              <Button
                variant="secondary"
                onClick={() => {
                  setShowCsvModal(false);
                }}
              >
                Close
              </Button>
            </Modal.Footer>
          </Modal>

          <PdfOptions
            wordCloudComponent={() => (
              <div>
                <ParentSize>
                  {({ width }) => (
                    <WordCloud
                      width={width}
                      height={600}
                      showControls="true"
                      transcript={createSentenceList()}
                    />
                  )}
                </ParentSize>
              </div>
            )}
            transcriptComponent={() => (
              <FullTranscript
                transcription={transcription}
                setTranscription={setTranscription}
                categorizedQuestions={categorizedQuestions}
                setCategorizedQuestions={setCategorizedQuestions}
                speakers={speakers}
                setSpeakers={setSpeakers}
                teacher={teacher}
                setShow={setShow}
                show={show}
                setChangeAlert={setChangeAlert}
              />
            )}
            talkingDistributionComponent={() => (
              <div>
                <TalkingDistribution
                  transcription={transcription}
                  teacher={teacher}
                />
              </div>
            )}
            questionDistributionComponent={() => (
              <div>
                <QuestionDistribution
                  categorizedQuestions={categorizedQuestions}
                />
              </div>
            )}
            collapseTimelineComponent={() => (
              <div>
                <CollapsedTimeline
                  categorizedQuestions={categorizedQuestions}
                />
              </div>
            )}
            teacherQuestionTimelineComponent={() => (
              <div>
                <TeacherQuestionTimeline
                  categorizedQuestions={categorizedQuestions}
                />
              </div>
            )}
            reportId={reportId}
            userId={userId}
          />

          <SaveChanges
            reportName={reportName}
            subject={subject}
            gradeLevel={gradeLevel}
            reportId={reportId}
            dateTime={dateTime}
            userId={userId}
            setChangeAlert={setChangeAlert}
            transcription={transcription}
            categorizedQuestions={categorizedQuestions}
          />

          {changeAlert && (
            <div>
              <Alert severity="warning">
                There are unsaved changes. Use 'Save Changes' to save them.
              </Alert>
            </div>
          )}
        </div>
      )}
    </>
  );
}
