import React, { useState, useEffect } from "react";
import { convertMsToTime } from "../../../utils/convertMsToTime";
import axios from "axios";

export default function QuestionCategorization({ reportId, userId, categorizedQuestions, setCategorizedQuestions, setChangeAlert }) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [categorizationDone, setCategorizationDone] = useState(false);

  useEffect(() => {
    if (!categorizedQuestions) {
      categorizeQuestions();
    }
    else {
      setCategorizationDone(true);
    }
  }, [categorizedQuestions]);

  const categorizeQuestions = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_SERVER}/reports/${reportId}/users/${userId}?categorize=true`
      );
      if (!response.data.reports[0].transferData.categorized) {
        setIsLoading(false);
        setCategorizedQuestions([]); // Set empty array if no categorized questions are returned
      } else {
        setCategorizedQuestions(response.data.reports[0].transferData.categorized);
        setCategorizationDone(true);
        setIsLoading(false);
      }
    } catch (error) {
      setIsLoading(false);
      setError(error);
    }
  };

  const handleLevelChange = (index, event) => {
    const newCategorizedQuestions = [...categorizedQuestions];
    const selectedLevel = parseInt(event.target.value);
    newCategorizedQuestions[index].level = selectedLevel !== null ? selectedLevel : 0; // Set to 0 if selectedLevel is null
    setCategorizedQuestions(newCategorizedQuestions);
    setChangeAlert(true);
  };

  const handleRecategorize = async () => {
    await categorizeQuestions();
  };

  return (
    <>
      <div className="pricing-header px-3 py-3 pt-md-5 pb-md-4 mx-auto">
        <h1>Question Categorization</h1>
        <h2>Based on Costa Level</h2>
        <div className="lead" style={{ backgroundColor: "white" }}>
          {isLoading ? (
            <p>Categorizing based on costa level...</p>
          ) : error ? (
            <p>Error: {error.message}</p>
          ) : categorizationDone ? (
            <div>
              {/* <button className="btn btn-primary" onClick={handleRecategorize}>Recategorize Questions</button> */}
              <table className="table">
                <thead>
                  <tr>
                    <th>Start Time</th>
                    <th>End Time</th>
                    <th>Speaker</th>
                    <th>Question</th>
                    <th>Level</th>
                  </tr>
                </thead>
                <tbody>
                  {categorizedQuestions.map((question, index) => (
                    <tr key={index}>
                      <td>{convertMsToTime(question.start_time)}</td>
                      <td>{convertMsToTime(question.end_time)}</td>
                      <td>{question.speaker}</td>
                      <td>{question.question}</td>
                      <td>
                        <select
                          value={question.level}
                          onChange={(event) => handleLevelChange(index, event)}
                        >
                          <option value={0}>NA</option>
                          <option value={1}>Low Level</option>
                          <option value={2}>Medium Level</option>
                          <option value={3}>High Level</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p>Click the button above to categorize questions based on costa level</p>
          )}
        </div>
      </div>
    </>
  );
}
