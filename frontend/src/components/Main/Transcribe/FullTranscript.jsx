import { Dropdown } from "react-bootstrap";
import { convertMsToTime } from "../../../utils/convertMsToTime";
import { useState } from "react";
 
export default function FullTranscript({ sentences, setSentences, speakers, teacher, show, setShow}) {
    const [isRelabelingSpeaker, setIsRelabelingSpeaker] = useState(false);
    const [editing, setEditing] = useState(false);
    
      function handleRelabelSpeaker(sentence, newSpeaker) {
        const newSentences = sentences.map((prevSentence) => {
          if (prevSentence.start === sentence.start) {
            return { ...prevSentence, speaker: newSpeaker };
          }
          return prevSentence;
        });
        setSentences(newSentences);
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
        const newSentences = sentences.map((prevSentence) => {
          if (prevSentence.start === sentence.start) {
            return { ...prevSentence, text: event.target.value };
          }
          return prevSentence;
        });
        setSentences(newSentences);
      };
    
      const handleKeyPress = (e) => {
        if (e.keyCode === 13) {
          e.target.blur();
        }
      };
    
      const removeSentence = (removedSentence) => {
        const updatedSentences = sentences.filter(
          (sentence) => sentence.start !== removedSentence.start
        );
        setSentences(updatedSentences);
      };
    
      const handleAddNewSentence = (sentencePrior) => {
        const selectedIndex = sentences.findIndex((s) => s === sentencePrior);
        const newStart = Math.ceil(sentencePrior.start / 1000) * 1000;
        const newEnd = newStart + 1000;
        const newSentence = {
          start: newStart,
          end: newEnd,
          speaker: "A",
          label: "non-question",
          isQuestion: false,
          text: "",
        };
        const updatedSentences = [
          ...sentences.slice(0, selectedIndex + 1),
          newSentence,
          ...sentences.slice(selectedIndex + 1),
        ];
        setSentences(updatedSentences);
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

      const handleAddQuestion = (sentence, event) => {
        //event.stopPropagation();
        const newSentences = sentences.map((prevSentence) => {
          if (prevSentence.start === sentence.start) {
            return { ...prevSentence, label: "Uncategorized", isQuestion: true };
          }
          return prevSentence;
        });
        setSentences(newSentences);
      };

    return (
        <>
            <div className="pricing-header px-3 py-3 pt-md-5 pb-md-4 mx-auto text-center">
                <h1>Full Transcript</h1>
                <h4>
                  Click on a sentence to make adjustments to "Questions" list
                </h4>
                <div className="lead" style={{ backgroundColor: "white" }}>
                  {sentences.map((sentence) => (
                    <div
                      key={sentence.start}
                      onClick={() => setShow(sentence.start)}
                    >
                      <Dropdown show={show === sentence.start}>
                        <CustomToggle onClick={(event) => handleToggle(event)}>
                          <div
                            className="sentence"
                            style={{
                              backgroundColor:
                                show === sentence.start ? "#F0F0F0" : "white",
                            }}
                          >
                            <div className="sentence-transcript">
                              <div className="transcript-time">
                                {convertMsToTime(sentence.start)}
                              </div>
                              <div
                                className={`transcript-speaker speaker-${sentence.speaker}`}
                              >
                                Speaker {sentence.speaker}:
                              </div>
                              {editing === sentence.start ? (
                                <input
                                  className="edit-text"
                                  type="text"
                                  value={sentence.text}
                                  onBlur={handleBlur}
                                  onChange={(event) =>
                                    handleChangeText(sentence, event)
                                  }
                                  onKeyDown={(event) => handleKeyPress(event)}
                                  autoFocus
                                />
                              ) : (
                                <div className="transcript-text">
                                  {sentence.text}
                                </div>
                              )}
                            </div>
                          </div>
                        </CustomToggle>
                        <Dropdown.Menu style={{ backgroundColor: "#F0F0F0" }}>
                          {!isRelabelingSpeaker ? (
                            <div>
                              <Dropdown.Item
                                onClick={(event) => {
                                  handleAddQuestion(sentence, event);
                                  handleToggle(null);
                                }}
                              >
                                Add as a question
                              </Dropdown.Item>
                              <Dropdown.Item
                                onClick={() => setIsRelabelingSpeaker(true)}
                              >
                                Relabel speaker
                              </Dropdown.Item>
                              <Dropdown.Item
                                onClick={() => setEditing(sentence.start)}
                              >
                                Edit sentence
                              </Dropdown.Item>
                              <Dropdown.Item
                                onClick={() => removeSentence(sentence)}
                              >
                                Remove sentence
                              </Dropdown.Item>
                              <Dropdown.Item
                                onClick={() => handleAddNewSentence(sentence)}
                              >
                                Insert sentence after
                              </Dropdown.Item>
                            </div>
                          ) : (
                            <div>
                              {Array.from(new Set(speakers.sort())).map(
                                (speaker) => (
                                  <Dropdown.Item
                                    onClick={() =>
                                      handleItemClick(sentence, speaker)
                                    }
                                  >
                                    {speaker}
                                  </Dropdown.Item>
                                )
                              )}{" "}
                              <div
                                onClick={() => handleAddNewSpeaker(sentence)}
                              >
                                <Dropdown.Item>
                                  Label as new speaker
                                </Dropdown.Item>
                              </div>
                            </div>
                          )}
                        </Dropdown.Menu>
                      </Dropdown>
                    </div>
                  ))}
                </div>
              </div>
              <div className="alert alert-secondary">
                <h5>
                  From our analysis,{" "}
                  <strong className={`transcript-speaker speaker-${teacher}`}>
                    {" "}
                    Speaker {teacher}
                  </strong>{" "}
                  is the Teacher and <u>all other speakers are Students</u>.
                </h5>
                <p>
                  If this is not the case, please relabel the speakers in the
                  "Full Transcript" box above to update this information.
                </p>
              </div>
        </>
    )
}