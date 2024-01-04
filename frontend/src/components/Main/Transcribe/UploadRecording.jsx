import { Spinner } from "react-bootstrap";
import { uploadFile, transcribeFile } from "../../../utils/assemblyAPI";
import { useState } from "react";

export default function UploadRecording({
  userReportToLoad,
  userReportLocation,
  sentences,
  setSentences,
}) {
  const [isAudio, setIsAudio] = useState(false);
  const [isVideo, setIsVideo] = useState(false);
  const [isNeither, setIsNeither] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedFile, setSelectedFile] = useState("");
  const [fileContent, setFileContent] = useState();

  async function handleSubmission() {
    setIsAnalyzing(true);
    const audioUrl = await uploadFile(fileContent);
    const transcriptionResult = await transcribeFile(audioUrl);
    setSentences(transcriptionResult);
    setIsAnalyzing(false);
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
          <p>Analysis in progress...</p>
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
        />
      </div>
    </div>
  );

  return (
    <div>
      {userReportToLoad && (
        <div>
          <h5>Currently Viewing:</h5>
          <h5>
            {userReportLocation.substring(userReportLocation.indexOf("/") + 1)}
          </h5>
        </div>
      )}
      {!userReportToLoad && renderUploadSection()}
      {(isAudio || isVideo || isNeither) &&
        renderMediaElement(isAudio ? "audio" : isVideo ? "video" : null)}
      {!isAnalyzing && !sentences && (
        <>
        <p></p>
        <button
          type="button"
          className="btn btn-primary"
          id="submission-main"
          onClick={() => handleSubmission({ selectedFile })}
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
