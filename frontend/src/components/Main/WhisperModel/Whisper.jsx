import UploadRecording from "./UploadRecording";
import FullTranscript from "./FullTranscript";
import { useState, useEffect } from "react";
import { Auth } from "aws-amplify";
import { Tab, Tabs } from "react-bootstrap";

export default function Whisper() {
    const [userId, setUserId] = useState("");
    const [reportId, setReportId] = useState("");
    const [transcription, setTranscription] = useState([]);
    const [analysisStatus, setAnalysisStatus] = useState("");
    const [isAnalysisCompleted, setIsAnalysisCompleted] = useState(false);
    const [teacher, setTeacher] = useState();
    const [show, setShow] = useState(false);
    const [speakers, setSpeakers] = useState();

    useEffect(() => {
        generateDefaultReportId(); // Call generateDefaultReportId when component mounts
    }, []); // Empty dependency array ensures it only runs once on mount

    useEffect(() => {
        async function retrieveUserInfo() {
          try {
            const user = await Auth.currentAuthenticatedUser();
            const { attributes } = user;
            setUserId(attributes.email);
            console.log(attributes.email); // Ensure userId is set correctly
          } catch (error) {
            console.error('Error fetching user data:', error);
          }
        }
    
        retrieveUserInfo();
      }, []);

    function generateDefaultReportId() {
        const timestamp = new Date().getTime(); // Get current timestamp
        const randomString = Math.random().toString(36).substring(2, 8); // Generate a random string
        const reportId = `report_${timestamp}_${randomString}`; // Combine timestamp and random string
        setReportId(reportId)
    }

    return (
        <>
        
        {analysisStatus !== "completed" && (
            <UploadRecording
            reportName={reportId}
            userId={userId}
            transcription={transcription}
            setTranscription={setTranscription}
            analysisStatus={analysisStatus}
            setAnalysisStatus={setAnalysisStatus} 
            />
        )}


        {analysisStatus === "completed" && (
            <Tabs id="controlled-tab-example">
            <Tab eventKey="TranscriptKey" title="Full Transcript">
                <FullTranscript
                    transcription={transcription}
                />
            </Tab>
        </Tabs>
        )}
        </>
    )
}