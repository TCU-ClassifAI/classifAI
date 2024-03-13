import { convertMsToTime } from "../../../utils/convertMsToTime";
import { useState, useEffect, useCallback } from "react";
import styles from "./FullTranscript.module.css";

export default function FullTranscript({
  transcription,
  setTranscription,
  speakers,
  setSpeakers,
  teacher,
  show,
  setShow,
}) {
  const [isRelabelingSpeaker, setIsRelabelingSpeaker] = useState(false);
  const [editingSpeaker, setEditingSpeaker] = useState(null);
  const [editingText, setEditingText] = useState(null);

  const speakerColors = [
    "#0074D9",
    "#3D9970",
    "#B10DC9",
    "#FF851B",
    "#F012BE",
    "#01FF70",
    "#7FDBFF",
    "#39CCCC",
    "#3D9970",
    "#85144b",
    "#111111",
    "#DDDDDD",
    "#001f3f",
    "#0074D9",
    "#7FDBFF",
    "#39CCCC",
    "#FFDC00",
    "#FF851B",
  ];

  useEffect(() => {
    // Extract unique speakers from the transcription
    const uniqueSpeakers = Array.from(
      new Set(transcription.map((sentence) => sentence.speaker))
    );
    setSpeakers(uniqueSpeakers);
  }, [transcription]);

  const handleRelabelSpeaker = useCallback((sentence, newSpeaker) => {
    const newTranscription = transcription.map((prevSentence) => {
      if (prevSentence.start_time === sentence.start_time) {
        return { ...prevSentence, speaker: newSpeaker };
      }
      return prevSentence;
    });
    setTranscription(newTranscription);
  }, [transcription, setTranscription]);

  const handleItemClick = useCallback((sentence, speaker) => {
    handleRelabelSpeaker(sentence, speaker);
    setIsRelabelingSpeaker(false);
    setShow(null);
  }, [handleRelabelSpeaker, setIsRelabelingSpeaker, setShow]);

  const handleBlur = useCallback(() => {
    setEditingSpeaker(null);
    setEditingText(null);
  }, []);

  const handleChangeSpeaker = useCallback((sentence, event) => {
    handleRelabelSpeaker(sentence, event.target.value);
  }, [handleRelabelSpeaker]);

  const handleChangeText = useCallback((sentence, event) => {
    const newTranscription = transcription.map((prevSentence) => {
      if (prevSentence.start_time === sentence.start_time) {
        return { ...prevSentence, text: event.target.value };
      }
      return prevSentence;
    });
    setTranscription(newTranscription);
  }, [transcription, setTranscription]);

  const handleKeyPress = useCallback((e) => {
    if (e.keyCode === 13) {
      e.target.blur();
    }
  }, []);

  const removeSentence = useCallback((removedSentence) => {
    const updatedTranscription = transcription.filter(
      (sentence) => sentence.start_time !== removedSentence.start_time
    );
    setTranscription(updatedTranscription);
  }, [transcription, setTranscription]);

  const handleAddNewSentence = useCallback((sentencePrior) => {
    const selectedIndex = transcription.findIndex((s) => s === sentencePrior);
    const newStart = Math.ceil(sentencePrior.start_time / 1000) * 1000;
    const newEnd = newStart + 1000;
    const newSentence = {
      start_time: newStart,
      end_time: newEnd,
      speaker: "A",
      text: "",
    };
    const updatedTranscription = [
      ...transcription.slice(0, selectedIndex + 1),
      newSentence,
      ...transcription.slice(selectedIndex + 1),
    ];
    setTranscription(updatedTranscription);
  }, [transcription, setTranscription]);

  const handleAddNewSpeaker = useCallback((sentence) => {
    const newSpeaker = String.fromCharCode(
      Array.from(new Set(speakers)).length + 65
    );
    console.log(newSpeaker); // Assuming speakers are uppercase letters starting from 'A'
    handleRelabelSpeaker(sentence, newSpeaker);
    setIsRelabelingSpeaker(false);
    setShow(null);
  }, [speakers, handleRelabelSpeaker, setIsRelabelingSpeaker, setShow]);

  return (
    <>
      <div className="pricing-header px-3 py-3 pt-md-5 pb-md-4 mx-auto">
        <h1>Full Transcript</h1>
        <h4>Click on a cell to edit</h4>
        <div className="lead" style={{ backgroundColor: "white" }}>
          <table className="table">
            <thead>
              <tr>
                <th>Start Time</th>
                <th>End Time</th>
                <th>Speaker</th>
                <th>Text</th>
              </tr>
            </thead>
            <tbody>
              {transcription.map((sentence) => (
                <tr key={sentence.start_time}>
                  <td>{convertMsToTime(sentence.start_time)}</td>
                  <td>{convertMsToTime(sentence.end_time)}</td>
                  <td>
                    {editingSpeaker === sentence.start_time ? (
                      <input
                        type="text"
                        value={sentence.speaker}
                        onBlur={handleBlur}
                        onChange={(event) => handleChangeSpeaker(sentence, event)}
                      />
                    ) : (
                      <span
                        onClick={() => setEditingSpeaker(sentence.start_time)}
                        className="speaker"
                        style={{
                          color:
                            speakerColors[speakers.indexOf(sentence.speaker)],
                          cursor: "pointer",
                        }}
                      >
                        {sentence.speaker}
                      </span>
                    )}
                  </td>
                  <td>
                    {editingText === sentence.start_time ? (
                      <input
                        type="text"
                        value={sentence.text}
                        className={styles.wideInput}
                        onBlur={handleBlur}
                        onChange={(event) => handleChangeText(sentence, event)}
                      />
                    ) : (
                      <div
                        onClick={() => setEditingText(sentence.start_time)}
                        className={styles.transcriptText}
                      >
                        {sentence.text}
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div className="alert alert-secondary">
        <h5>
          From our analysis,{" "}
          <strong className={`transcript-speaker speaker-${teacher}`}>
            {" "}
            {teacher}
          </strong>{" "}
          is the Teacher (based on greatest speaking time) and <u>all other speakers are Students</u>.
        </h5>
        <p>
          If this is not the case, please relabel the speakers in the "Full
          Transcript" box above to update this information.
        </p>
      </div>
    </>
  );
}
