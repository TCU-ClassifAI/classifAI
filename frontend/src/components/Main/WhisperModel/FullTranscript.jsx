import React, { useState, useEffect, useCallback } from "react";
import { Dropdown } from "react-bootstrap";
import { convertMsToTime } from "../../../utils/convertMsToTime";
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
  const [newSpeakerName, setNewSpeakerName] = useState("");

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

  const handleRelabelSpeaker = useCallback(
    (sentence, newSpeaker, editAll) => {
      const newTranscription = transcription.map((prevSentence) => {
        if (
          editAll ||
          (prevSentence.start_time === sentence.start_time &&
            editingSpeaker === sentence.start_time)
        ) {
          return { ...prevSentence, speaker: newSpeaker };
        }
        return prevSentence;
      });
      setTranscription(newTranscription);
    },
    [transcription, setTranscription, editingSpeaker]
  );

  const handleItemClick = useCallback(
    (sentence, speaker) => {
      handleRelabelSpeaker(sentence, speaker, false);
      setIsRelabelingSpeaker(false);
      setShow(null);
    },
    [handleRelabelSpeaker, setIsRelabelingSpeaker, setShow]
  );

  const handleEditAllOccurences = useCallback(
    (sentence, newSpeaker) => {
      const newTranscription = transcription.map((prevSentence) => {
        if (prevSentence.speaker === sentence.speaker) {
          return { ...prevSentence, speaker: newSpeaker };
        }
        return prevSentence;
      });
      setTranscription(newTranscription);
      setIsRelabelingSpeaker(false);
      setShow(null);
      setEditingSpeaker(null); // Reset editingSpeaker after editing all occurrences
    },
    [transcription, setTranscription, editingSpeaker, setIsRelabelingSpeaker, setShow]
  );

  const handleBlur = useCallback(() => {
    setEditingSpeaker(null);
    setEditingText(null);
  }, []);

  const handleChangeText = useCallback(
    (sentence, event) => {
      const newTranscription = transcription.map((prevSentence) => {
        if (prevSentence.start_time === sentence.start_time) {
          return { ...prevSentence, text: event.target.value };
        }
        return prevSentence;
      });
      setTranscription(newTranscription);
      setNewSpeakerName("");
    },
    [transcription, setTranscription]
  );

  const handleChangeName = useCallback(
    (sentence) => {
      const newTranscription = transcription.map((prevSentence) => {
        if (prevSentence.start_time === sentence.start_time) {
          return { ...prevSentence, speaker: newSpeakerName };
        }
        return prevSentence;
      });
      setTranscription(newTranscription);
      setIsRelabelingSpeaker(false);
      setShow(null);
      setNewSpeakerName("");
    },
    [transcription, setTranscription, newSpeakerName, setIsRelabelingSpeaker, setShow]
  );

  const handleInputChange = (e) => {
    // This prevents the click event from propagating to the Dropdown.Toggle
    e.stopPropagation();
  };

  const handleInputKeyDown = (e) => {
    // Prevent the dropdown from closing when space is pressed
    if (e.key === " ") {
      e.stopPropagation();
    }
  };

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
                      <Dropdown>
                        <Dropdown.Toggle variant="secondary" id="dropdown-basic">
                          {sentence.speaker}
                        </Dropdown.Toggle>
                        <Dropdown.Menu onClick={(e) => e.stopPropagation()}>
                        <Dropdown.Item>
                            <input
                              type="text"
                              placeholder="New Name"
                              value={newSpeakerName}
                              onChange={(e) => setNewSpeakerName(e.target.value)}
                              onClick={handleInputChange} // prevent propagation
                              onKeyDown={handleInputKeyDown} // prevent dropdown close on space
                            />
                            <button onClick={() => handleChangeName(sentence)}>Change Name</button>
                            <button onClick={() => handleEditAllOccurences(sentence, newSpeakerName)}>Change All Occurrences</button>
                          </Dropdown.Item>
                          {speakers.map((speaker) => (
                            <Dropdown.Item
                              key={speaker}
                              onClick={() => handleItemClick(sentence, speaker)}
                            >
                              {speaker}
                            </Dropdown.Item>
                          ))}
                        </Dropdown.Menu>
                      </Dropdown>
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
                        onChange={(event) =>
                          handleChangeText(sentence, event)
                        }
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
          is the Teacher (based on greatest speaking time) and{" "}
          <u>all other speakers are Students</u>.
        </h5>
        <p>
          If this is not the case, please relabel the speakers in the "Full
          Transcript" box above to update this information.
        </p>
      </div>
    </>
  );
}
