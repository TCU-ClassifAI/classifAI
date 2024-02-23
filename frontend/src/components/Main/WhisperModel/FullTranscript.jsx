import { useState } from "react";
import { convertMsToTime } from "../../../utils/convertMsToTime";

export default function FullTranscript({ transcription }) {
  // Initialize state to manage expanded/collapsed state of each transcript item
  const [expandedIndex, setExpandedIndex] = useState(null);

  return (
    <div>
      {transcription.map((item, index) => (
        <div key={index} className="transcript-item">
          {/* Speaker and time */}
          <div className="transcript-header">
            <div className="speaker">{item.speaker}</div>
            <div className="time">
              {convertMsToTime(item.start_time)} -{" "}
              {convertMsToTime(item.end_time)}
            </div>
          </div>

          {/* Transcript text */}
          <div
            className="transcript-text"
            onClick={() => setExpandedIndex(index)}
          >
            {item.text}
          </div>

          {/* Additional details (expandable) */}
          {expandedIndex === index && (
            <div className="additional-details">
              {/* You can add more details here */}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
