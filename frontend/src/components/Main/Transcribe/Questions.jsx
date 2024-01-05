import { Dropdown } from "react-bootstrap";
import { convertMsToTime } from "../../../utils/convertMsToTime";

export default function Questions({
  sentences,
  questions,
  setQuestions,
  questioningTime,
  labeledQuestions,
  times,
  respTime,
}) {
  function removeQuestion(idx) {
    let newSentences = [...sentences];
    let filteredQuestions = newSentences.filter(
      (sentence) => sentence.isQuestion
    );
    let questionIndex = newSentences.indexOf(filteredQuestions[idx]);
    if (questionIndex !== -1) {
      newSentences[questionIndex].isQuestion = false;
    }
    labeledQuestions.splice(idx, 1);
    times.splice(idx, 1);
    setQuestions(newSentences.filter((sentence) => sentence.isQuestion));
  }

  function selectLabel(index, label) {
    let newSentences = [...sentences];
    let filteredQuestions = newSentences.filter(
      (sentence) => sentence.isQuestion
    );
    let questionIndex = newSentences.indexOf(filteredQuestions[index]);
    if (questionIndex !== -1) {
      newSentences[questionIndex].label = label;
    }
    setQuestions(sentences.filter((sentence) => sentence.isQuestion));
  }

  return (
    <>
      <div className="card-deck mb-3 text-center">
        <div className="card mb-4 box-shadow">
          <div className="card-header">
            <h2>Questions</h2>
          </div>
          <div className="card-header">
            <h5>Number of Questions: {questions && questions.length}</h5>
            <h5>Total Questioning Time: {questioningTime}</h5>
          </div>
          <div className="card-body" id="table">
            <div className="container">
              <table className="table">
                <thead>
                  <tr>
                    <th scope="col">Time</th>
                    <th scope="col">Question</th>
                    <th scope="col">Speaker</th>
                    <th scope="col">Response Time</th>
                    <th scope="col">Question Type</th>
                  </tr>
                </thead>
                <tbody>
                  {sentences &&
                    times &&
                    sentences
                      .filter((sentence) => sentence.isQuestion === true)
                      .map((question, index) => (
                        <tr key={index} className="question">
                          <td>{convertMsToTime(question.start)}</td>
                          <td
                            id="question-table-question"
                            style={{
                              color:
                                question.label === "Uncategorized"
                                  ? "#ff0000"
                                  : "#000000",
                            }}
                          >
                            "{question.text}"
                          </td>
                          <td
                            className={`transcript-speaker speaker-${question.speaker}`}
                          >
                            {question.speaker}
                          </td>
                          <td>
                            {respTime[question.end] < 1
                              ? "< 1 second"
                              : respTime[question.end] === "No Response"
                              ? "No Response"
                              : respTime[question.end] + " seconds"}
                          </td>
                          <td
                            style={{
                              color:
                                question.label === "Uncategorized"
                                  ? "#ff0000"
                                  : "#000000",
                            }}
                          >
                            {question.label}
                          </td>
                          <td className="question-options">
                            <Dropdown>
                              <Dropdown.Toggle variant="sm" id="dropdown-basic">
                                Select Type
                              </Dropdown.Toggle>

                              <Dropdown.Menu>
                                <Dropdown.Item
                                  onClick={() => {
                                    selectLabel(index, "Knowledge");
                                  }}
                                >
                                  Knowledge
                                </Dropdown.Item>
                                <Dropdown.Item
                                  onClick={() => {
                                    selectLabel(index, "Understand");
                                  }}
                                >
                                  Understand
                                </Dropdown.Item>
                                <Dropdown.Item
                                  onClick={() => {
                                    selectLabel(index, "Apply");
                                  }}
                                >
                                  Apply
                                </Dropdown.Item>
                                <Dropdown.Item
                                  onClick={() => {
                                    selectLabel(index, "Analyze");
                                  }}
                                >
                                  Analyze
                                </Dropdown.Item>
                                <Dropdown.Item
                                  onClick={() => {
                                    selectLabel(index, "Evaluate");
                                  }}
                                >
                                  Evaluate
                                </Dropdown.Item>
                                <Dropdown.Item
                                  onClick={() => {
                                    selectLabel(index, "Create");
                                  }}
                                >
                                  Create
                                </Dropdown.Item>
                              </Dropdown.Menu>
                            </Dropdown>
                            <button
                              type="button"
                              className="btn btn-danger"
                              onClick={() => removeQuestion(index)}
                            >
                              Remove
                            </button>
                          </td>
                        </tr>
                      ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
