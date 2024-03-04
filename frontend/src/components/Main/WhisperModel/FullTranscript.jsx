import { Dropdown } from "react-bootstrap";
import { convertMsToTime } from "../../../utils/convertMsToTime";
import { useState, useEffect } from "react";
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
  const [editing, setEditing] = useState(false);

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

  function handleRelabelSpeaker(sentence, newSpeaker) {
    const newTranscription = transcription.map((prevSentence) => {
      if (prevSentence.start_time === sentence.start_time) {
        return { ...prevSentence, speaker: newSpeaker };
      }
      return prevSentence;
    });
    setTranscription(newTranscription);
  }

  const handleItemClick = (sentence, speaker) => {
    handleRelabelSpeaker(sentence, speaker);
    setIsRelabelingSpeaker(false);
    setShow(null);
  };

  const CustomToggle = ({ children, onClick }) => (
    <div onClick={onClick} style={{ cursor: "pointer" }}>
      {children}
    </div>
  );

  const handleToggle = (event) => {
    if (show !== null) {
      //event.stopPropagation();
    }
    setShow(null);
  };

  const handleBlur = () => {
    setEditing(false);
  };

  const handleChangeText = (sentence, event) => {
    const newTranscription = transcription.map((prevSentence) => {
      if (prevSentence.start_time === sentence.start_time) {
        return { ...prevSentence, text: event.target.value };
      }
      return prevSentence;
    });
    setTranscription(newTranscription);
  };

  const handleKeyPress = (e) => {
    if (e.keyCode === 13) {
      e.target.blur();
    }
  };

  const removeSentence = (removedSentence) => {
    const updatedTranscription = transcription.filter(
      (sentence) => sentence.start_time !== removedSentence.start_time
    );
    setTranscription(updatedTranscription);
  };

  const handleAddNewSentence = (sentencePrior) => {
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
  };

  const handleAddNewSpeaker = (sentence) => {
    const newSpeaker = String.fromCharCode(
      Array.from(new Set(speakers)).length + 65
    );
    console.log(newSpeaker); // Assuming speakers are uppercase letters starting from 'A'
    handleRelabelSpeaker(sentence, newSpeaker);
    setIsRelabelingSpeaker(false);
    setShow(null);
  };

  return (
    <>
      <div className="pricing-header px-3 py-3 pt-md-5 pb-md-4 mx-auto">
        <h1>Full Transcript</h1>
        <h4>Click on a sentence to make adjustments to "Questions" list</h4>
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
                    <Dropdown show={show === sentence.start_time}>
                      <CustomToggle onClick={(event) => handleToggle(event)}>
                        <span
                          className="speaker"
                          style={{
                            color:
                              speakerColors[speakers.indexOf(sentence.speaker)],
                          }}
                        >
                          {sentence.speaker}
                        </span>
                      </CustomToggle>
                      <Dropdown.Menu>
                        {speakers.map((speaker) => (
                          <Dropdown.Item
                            key={`handle-speaker-click-${sentence.start_time}-${speaker}`}
                            onClick={() => handleItemClick(sentence, speaker)}
                          >
                            {speaker}
                          </Dropdown.Item>
                        ))}
                        <Dropdown.Item
                          key={`label-new-speaker-${sentence.start_time}`}
                          onClick={() => handleAddNewSpeaker(sentence)}
                        >
                          Label as new speaker
                        </Dropdown.Item>
                      </Dropdown.Menu>
                    </Dropdown>
                  </td>
                  <td onClick={() => setShow(sentence.start_time)}>
                    {editing === sentence.start_time ? (
                      <input
                        className="edit-text"
                        type="text"
                        value={sentence.text}
                        onBlur={handleBlur}
                        onChange={(event) => handleChangeText(sentence, event)}
                        onKeyDown={(event) => handleKeyPress(event)}
                        autoFocus
                      />
                    ) : (
                      <div className={styles.transcriptText}>
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
