
export default function CsvOptions({
    allSelected,
    setAllSelected,
    startTimeBox,
    setStartTimeBox,
    endTimeBox,
    setEndTimeBox,
    speakerBox,
    setSpeakerBox,
    isQuestionBox,
    setIsQuestionBox,
    questionTypeBox,
    setQuestionTypeBox,
    sentencesBox,
    setSentencesBox,
    questionsBox,
    setQuestionsBox,
    handleSelectAll,
    handleDeselectAll,
}) {
    return (
        <>
            <div className="checkBox">
                <strong>Select what to include in CSV:</strong>
                <label className="checkBox">
                    Select All
                    <input
                        type="checkbox"
                        className="checkBox"
                        checked={allSelected}
                        onChange={allSelected ? handleDeselectAll : handleSelectAll}
                    ></input>
                </label>
                <label className="checkBox">
                    Start Times
                    <input
                        type="checkbox"
                        className="checkBox"
                        checked={startTimeBox}
                        onChange={() => setStartTimeBox(!startTimeBox)}
                    ></input>
                </label>
                <label className="checkBox">
                    End Times
                    <input
                        type="checkbox"
                        className="checkBox"
                        checked={endTimeBox}
                        onChange={() => setEndTimeBox(!endTimeBox)}
                    ></input>
                </label>
                <label className="checkBox">
                    Speakers
                    <input
                        type="checkbox"
                        className="checkBox"
                        checked={speakerBox}
                        onChange={() => setSpeakerBox(!speakerBox)}
                    ></input>
                </label>
                <label className="checkBox">
                    isQuestion Label
                    <input
                        type="checkbox"
                        className="checkBox"
                        checked={isQuestionBox}
                        onChange={() => setIsQuestionBox(!isQuestionBox)}
                    ></input>
                </label>
                <label className="checkBox">
                    Question Type
                    <input
                        type="checkbox"
                        className="checkBox"
                        checked={questionTypeBox}
                        onChange={() => setQuestionTypeBox(!questionTypeBox)}
                    ></input>
                </label>
                <label className="checkBox">
                    Text
                    <input
                        type="checkbox"
                        className="checkBox"
                        checked={sentencesBox}
                        onChange={() => setSentencesBox(!sentencesBox)}
                    ></input>
                </label>
                <select
                    className="dropdown"
                    value={questionsBox ? "questions" : "fullTranscript"}
                    onChange={(e) => setQuestionsBox(e.target.value === "questions")}
                >
                    <option value="fullTranscript">Include Full Transcript</option>
                    <option value="questions">Only Include Questions</option>
                </select>
            </div>

        </>
    )
};