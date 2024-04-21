import { ProgressBar, Form } from "react-bootstrap";
import GenericModal from "../../Common/GenericModal";
import { useState, useEffect } from "react";
import YoutubeUpload from "./YoutubeUpload";
import axios from "axios";
import styles from "./UploadRecording.module.css";
import dayjs from "dayjs";

export default function UploadRecording({
  reportName,
  gradeLevel,
  subject,
  userId,
  reportId,
  dateTime,
  setGradeLevel,
  setTranscription,
  setSubject,
  setAnalysisStatus,
  setReportName,
  analysisStatus,
  location,
  setCategorizedQuestions,
  setSummary,
  setDateTime,
}) {
  const [isAudio, setIsAudio] = useState(false);
  const [isVideo, setIsVideo] = useState(false);
  const [isNeither, setIsNeither] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedFile, setSelectedFile] = useState("");
  const [fileContent, setFileContent] = useState();
  const [progress, setProgress] = useState(0);
  const [showGenericModal, setShowGenericModal] = useState(false);
  const [genericModalMsg, setGenericModalMsg] = useState("");
  const [genericModalTitle, setGenericModalTitle] = useState("");
  const [youtubeMode, setYoutubeMode] = useState(false);
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [analysisStatusMsg, setAnalysisStatusMsg] = useState("Starting");

  useEffect(() => {
    if (location.state && location.state.reportId) {
      // Remove the extra closing parenthesis
      setShowGenericModal(true);
      let msg = "Loading Report " + location.state.reportId;
      setGenericModalMsg(msg);
      setGenericModalTitle("Loading...");
      setIsAnalyzing(true);
      setProgress(15);
      setAnalysisStatus("Loading Report");
    }
  }, [location, setAnalysisStatus]);

  useEffect(() => {
    if (isAnalyzing) {
      const intervalId = setInterval(checkAnalysisStatus, 5000); // Check status every 5 seconds

      return () => clearInterval(intervalId); // Cleanup function to clear interval on component unmount
    }
  }, [isAnalyzing]);

  function validateYoutubeLink(link) {
    // Regular expression to match YouTube URL patterns allowing both with and without "m." for mobile
    const youtubeRegex =
      /^(https?:\/\/)?(www\.)?(m\.)?(youtube\.com|youtu\.?be)\/.+$/;
    return youtubeRegex.test(link);
  }

  async function handleSubmission() {
    try {
      const formData = new FormData();
      if (youtubeMode) {
        if (!validateYoutubeLink(youtubeUrl)) {
          setShowGenericModal(true);
          setGenericModalMsg(
            "Invalid Youtube Link. Please paste a valid youtube link."
          );
          setGenericModalTitle("Error");
          return;
        }
        formData.append("url", youtubeUrl);
      } else {
        if (!validateFileType(selectedFile)) {
          setShowGenericModal(true);
          setGenericModalMsg(
            "Invalid file type. Please upload a valid audio or video file."
          );
          setGenericModalTitle("Error");
          return;
        }
        formData.append("file", selectedFile);
      }
      setIsAnalyzing(true);

      formData.append("reportName", reportName);
      formData.append("gradeLevel", gradeLevel);
      formData.append("subject", subject);
      formData.append("audioDate", dateTime.format("MM-DD-YYYY HH:mm:ss"));

      const response = await axios.post(
        `${
          import.meta.env.VITE_BACKEND_SERVER
        }/reports/${reportId}/users/${userId}`,
        formData, // Pass formData directly as data
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      console.log(response);
      setGenericModalMsg(
        "Audio Uploaded and Report Entry Created! Please remain on this page until our engine completes its analysis."
      );
      setGenericModalTitle("Upload Success");
      setShowGenericModal(true);
      console.log("Upload and transfer success!");
    } catch (error) {
      console.log("Error uploading or transferring to engine!");
      setGenericModalMsg("Error uploading or transferring to engine!");
      setGenericModalTitle("Error");
      setShowGenericModal(true);
    }
  }

  function checkIfCategorizedAndSummarized(response) {
    let categorizedQuestions;
    if (response.data.reports[0].transferData.categorized) {
      categorizedQuestions =
        response.data.reports[0].transferData.categorized.map((question) => ({
          ...question,
          level: question.level !== null ? question.level : 0,
        }));
      setCategorizedQuestions(categorizedQuestions);
      console.log(categorizedQuestions);
    }
    if (response.data.reports[0].transferData.summary) {
      let summary = response.data.reports[0].transferData.summary;
      console.log(summary);
      setSummary(summary);
    }
  }

  async function checkAnalysisStatus() {
    try {
      const response = await axios.get(
        `${
          import.meta.env.VITE_BACKEND_SERVER
        }/reports/${reportId}/users/${userId}/`
      );

      if (!response.data.reports[0]) {
        setProgress(3);
        setAnalysisStatusMsg("Uploading Audio to Database");
        return; // report might still be uploading, check later
      }
      let status, progress, message;
      if (response.data.reports[0].transferData) {
        status = response.data.reports[0].transferData.status;
        progress = response.data.reports[0].transferData.progress;
        message = response.data.reports[0].transferData.message;
      } else {
        status = "started";
        progress = "started";
        message = "";
      }

      const grade = response.data.reports[0].gradeLevel;
      const reportSubject = response.data.reports[0].subject;
      const reportName = response.data.reports[0].reportName;
      const audioDate = response.data.reports[0].audioDate;
      console.log(response);
      if (progress) {
        setAnalysisStatus(progress);
      } else {
        setAnalysisStatus(status);
      }
      setAnalysisStatusMsg(message);
      setGradeLevel(grade);
      setSubject(reportSubject);
      setReportName(reportName);
      if (audioDate) {
        setDateTime(dayjs(audioDate));
      }

      if (status === "failed") {
        setProgress(0);
        setAnalysisStatusMsg("failed");
        return;
      }

      if (
        progress === "finished" ||
        progress === "completed" ||
        status === "completed"
      ) {
        setIsAnalyzing(false); // Stop analysis once completed
        const transcription = response.data.reports[0].transferData.result;
        console.log(transcription);
        setTranscription(transcription);
        checkIfCategorizedAndSummarized(response);
        setProgress(100);
      } else if (progress === "downloading") {
        setProgress(7);
      } else if (progress === "start_transcribing") {
        setProgress(10);
      } else if (progress === "splitting") {
        setProgress(20);
      } else if (progress === "loading_nemo") {
        setProgress(30);
      } else if (progress === "transcribing") {
        setProgress(40);
      } else if (progress === "loading_align_model") {
        setProgress(45);
      } else if (progress === "aligning") {
        setProgress(50);
      } else if (progress === "diarizing") {
        setProgress(55);
      } else if (progress === "transcription_finished") {
        setProgress(57);
      } else if (progress === "extracting_questions") {
        setProgress(60);
      } else if (progress === "categorizing_questions") {
        setProgress(70);
      } else if (progress === "summarizing") {
        setProgress(80);
      } else if (progress === "combining_results") {
        setProgress(90);
      } else if (progress === "started" || progress === "queued") {
        setProgress(5);
      } else {
        setProgress(0);
      }
    } catch (error) {
      console.log("Error checking analysis status!", error);
      setGenericModalMsg("Error checking analysis status!");
      setGenericModalTitle("Error");
      setShowGenericModal(true);
    }
  }

  function handleFileChange(event) {
    const file = event.target.files[0];
    setSelectedFile(event.target.files[0]);
    const reader = new FileReader();
    reader.readAsArrayBuffer(file);
    reader.onloadend = (event) => {
      setFileContent(event.target.result);
    };

    const type = file.type;
    if (type.includes("audio")) {
      setIsAudio(true);
      setIsVideo(false);
    } else if (type.includes("video")) {
      setIsVideo(true);
      setIsAudio(false);
    } else {
      setIsAudio(false);
      setIsVideo(false);
      setIsNeither(true);
    }
  }

  const validateFileType = (file) => {
    const acceptedTypes = [
      "audio/mpeg",
      "audio/mp4",
      "audio/x-m4a",
      "audio/aac",
      "audio/ogg",
      "audio/wav",
      "audio/webm",
      "video/mp4",
      "video/x-matroska",
      "video/webm",
      "audio/mp3",
    ];
    return acceptedTypes.includes(file.type);
  };

  const renderMediaElement = (tag) => (
    <div>
      <p>Click "Analyze Recording" to begin file analysis</p>
      {tag === "audio" && (
        <audio controls id="audio-player">
          <source
            src={URL.createObjectURL(selectedFile)}
            type={selectedFile.type}
          />
        </audio>
      )}
      {tag === "video" && (
        <video controls id="video-player">
          <source
            src={URL.createObjectURL(selectedFile)}
            type={selectedFile.type}
          />
        </video>
      )}
    </div>
  );

  const renderUploadSection = () => (
    <div>
      <label className="form-label" htmlFor="customFile">
        <h4>Please upload an audio or video recording for transcription</h4>
        <p>
          Accepted AUDIO file types: .mp3, .m4a, .aac, .ogg, .flac, .avr, cdda,
          .aiff, .au, .amr, .mp2, .ac3
        </p>
        <p>Accepted VIDEO file types: .mp4, .avi, .wmv, .mpeg</p>
      </label>
      <div>
        <input
          type="file"
          className="form-control"
          id="customFile"
          onChange={handleFileChange}
          disabled={isAnalyzing}
        />
        <br />
        <h6>Privacy Disclaimer: A copy of any file uploaded is retained on our database for your ease of access in 'My Reports'. </h6>

<h6>Your data will not be used for training AI nor distributed elsewhere.</h6>
      </div>
    </div>
  );

  const handleCloseGenericModal = () => {
    setShowGenericModal(false);
  };

  const handleSwitchChange = () => {
    setYoutubeMode(!youtubeMode);
  };

  return (
    <>
      <GenericModal
        title={genericModalTitle}
        message={genericModalMsg}
        showGenericModal={showGenericModal}
        handleCloseGenericModal={handleCloseGenericModal}
      />
      <div className={styles.switchContainer}>
        <Form.Check
          className={styles.switchLabel}
          label="Use Youtube Link"
          type="switch"
          checked={youtubeMode}
          onChange={handleSwitchChange}
          id="useYoutubeLinkSwitch"
          disabled={analysisStatus !== ""}
        />
      </div>

      {youtubeMode && analysisStatus !== "finished" && (
        <div>
          <YoutubeUpload
            youtubeUrl={youtubeUrl}
            setYoutubeUrl={setYoutubeUrl}
            isAnalyzing={isAnalyzing}
          />
        </div>
      )}

      {!youtubeMode && (
        <div>
          {renderUploadSection()}
          {(isAudio || isVideo || isNeither || isAnalyzing) &&
            renderMediaElement(isAudio ? "audio" : isVideo ? "video" : null)}
        </div>
      )}
      {!isAnalyzing && (
        <>
          <p></p>
          <button
            type="button"
            className="btn btn-primary"
            id="submission-main"
            onClick={() => handleSubmission({ selectedFile })}
            disabled={!selectedFile && !youtubeUrl}
          >
            Analyze Recording
          </button>
        </>
      )}
      {isAnalyzing && (
        <div>
          <p>
            Our Engine is analyzing audio in the background.{" "}
            <strong>Please stay on this page and wait until completion.</strong>{" "}
            Upon completion, you may leave and load this report from{" "}
            <strong>'My Reports'</strong>.
          </p>
          <ProgressBar
            animated
            variant="info"
            now={progress}
            className={styles.progessBar}
            label={analysisStatus}
          />
          <p>Analysis Status Description: ({analysisStatusMsg})</p>
        </div>
      )}
    </>
  );
}
