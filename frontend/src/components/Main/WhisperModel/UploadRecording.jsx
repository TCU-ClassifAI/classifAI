import { Spinner } from "react-bootstrap";
import { useState, useEffect } from "react";
import { uploadFile } from "../../../utils/assemblyAPI";
import axios from 'axios';

export default function UploadRecording({
  reportName,
  userId,
  transcription,
  setTranscription,
  analysisStatus,
  setAnalysisStatus
}) {
  const [isAudio, setIsAudio] = useState(false);
  const [isVideo, setIsVideo] = useState(false);
  const [isNeither, setIsNeither] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedFile, setSelectedFile] = useState("");
  const [fileContent, setFileContent] = useState();
  const [isFileSelected, setIsFileSelected] = useState(false);


  useEffect(() => {
    if (isAnalyzing) {
      const intervalId = setInterval(checkAnalysisStatus, 5000); // Check status every 5 seconds
      console.log("Checked Status")

      return () => clearInterval(intervalId); // Cleanup function to clear interval on component unmount
    }
  }, [isAnalyzing]);

  async function handleSubmission() {
    setIsAnalyzing(true);
    try {

      const formData = new FormData();
      formData.append("file",selectedFile);

      const response = await axios.post(
        `http://localhost:5001/reports/${reportName}/users/${userId}`, 
        formData, // Pass formData directly as data
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );
  
      console.log("Upload and transfer success!")

    }catch (error) {
      console.log("Error uploading or transferring to engine!")
    }
  }

  async function checkAnalysisStatus() {
    try {
      const response = await axios.get(
        `http://localhost:5001/reports/${reportName}/users/${userId}/`
      );

      const status = response.data.reports[0].transferData.status;
      console.log(response);

      setAnalysisStatus(status);
      
      if (status === "completed") {
        setIsAnalyzing(false); // Stop analysis once completed
        const transcription = JSON.parse(response.data.reports[0].transcription)
        setTranscription(transcription)
        console.log(transcription);
      }

   
    } catch (error) {
      console.log("Error checking analysis status!", error);
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
    setIsFileSelected(!fileContent);
  }

  const renderMediaElement = (tag) => (
    <div>
      <p>Click "Submit" to begin file analysis</p>
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
      {isAnalyzing && (
        <div>
          <Spinner
            className="spinner"
            animation="border"
            role="status"
          ></Spinner>
          <p>Analysis Status: ({analysisStatus})</p>
          <p>Please do not refresh or exit this screen during this time</p>
        </div>
      )}
    </div>
  );

  const renderUploadSection = () => (
    <div>
      <label className="form-label" htmlFor="customFile">
        <h4>Please upload an audio or video recording for transcription</h4>
        <p>
          Accepted AUDIO file types: .mp3, .m4a, .aac, .oga, .ogg, .flac, .wav,
          .wv, .aiff
        </p>
        <p>
          Accepted VIDEO file types: .webm, .MTS, .M2TS, .TS, .mov, .mp2, .mp4,
          .m4v, .mxf
        </p>
      </label>
      <div>
        <input
          type="file"
          className="form-control"
          id="customFile"
          onChange={handleFileChange}
          disabled={isAnalyzing}
        />
      </div>
    </div>
  );

  return (
    <div>
      {renderUploadSection()}
      {(isAudio || isVideo || isNeither) &&
        renderMediaElement(isAudio ? "audio" : isVideo ? "video" : null)}
      {!isAnalyzing && (
        <>
        <p></p>
        <button
          type="button"
          className="btn btn-primary"
          id="submission-main"
          onClick={() => handleSubmission({ selectedFile })}
          disabled={!isFileSelected}
        >
          Analyze Recording
        </button>
        </>
        
      )}
      {isAnalyzing && (
        <button 
          type="button"
          className="btn btn-primary"
          id="submission-main"
          onClick={() => window.location.reload()}
        >
          Cancel
        </button>
      )}
    </div>
  );
}
