import React, { useState, useEffect } from "react";
import { convertMsToTime } from "../../../utils/convertMsToTime";
import axios from "axios";

export default function QuestionCategorization({ reportId, userId, categorizedQuestions, setCategorizedQuestions, setChangeAlert }) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [categorizationDone, setCategorizationDone] = useState(false);
  const [editableLevels, setEditableLevels] = useState({});
  const [recategorizeClicked, setRecategorizeClicked] = useState(false);

  useEffect(() => {
    if (!categorizedQuestions || recategorizeClicked) {
      categorizeQuestions();
      setRecategorizeClicked(false);
    }
    else {
      setCategorizationDone(true);
    }
  }, [categorizedQuestions, recategorizeClicked]);

  const categorizeQuestions = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_SERVER}/reports/${reportId}/users/${userId}?categorize=true`
      );
      if (!response.data.reports[0].categorized) {
        setIsLoading(false);
        setCategorizedQuestions([]); // Set empty array if no categorized questions are returned
      } else {
        setCategorizedQuestions(response.data.reports[0].categorized);
        setCategorizationDone(true);
        setIsLoading(false);
      }
    } catch (error) {
      setIsLoading(false);
      setError(error);
    }
  };

  const handleLevelClick = (index) => {
    const newEditableLevels = { ...editableLevels };
    newEditableLevels[index] = true;
    setEditableLevels(newEditableLevels);
  };

  const handleLevelChange = (index, event) => {
    const newCategorizedQuestions = [...categorizedQuestions];
    newCategorizedQuestions[index].level = event.target.value;
    setCategorizedQuestions(newCategorizedQuestions);
    setChangeAlert(true);
  };

  const handleBlur = (index) => {
    const newEditableLevels = { ...editableLevels };
    delete newEditableLevels[index];
    setEditableLevels(newEditableLevels);
  };

  const handleRecategorize = () => {
    setRecategorizeClicked(true);
  };

  return (
    <>
      <div className="pricing-header px-3 py-3 pt-md-5 pb-md-4 mx-auto">
        <h1>Question Categorization</h1>
        <div className="lead" style={{ backgroundColor: "white" }}>
          {isLoading ? (
            <p>Categorizing...</p>
          ) : error ? (
            <p>Error: {error.message}</p>
          ) : categorizationDone ? (
            <div>
              <button className="btn btn-primary" onClick={handleRecategorize}>Recategorize Questions</button>
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
                      <td onClick={() => handleLevelClick(index)}>
                        {editableLevels[index] ? (
                          <input
                            type="text"
                            value={question.level}
                            onChange={(event) => handleLevelChange(index, event)}
                            onBlur={() => handleBlur(index)}
                          />
                        ) : (
                          question.level
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p>Click the button above to categorize questions.</p>
          )}
        </div>
      </div>
    </>
  );
}
