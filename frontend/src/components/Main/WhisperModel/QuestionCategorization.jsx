import React, { useState, useEffect } from "react";
import { convertMsToTime } from "../../../utils/convertMsToTime";
import axios from "axios";

export default function QuestionCategorization({ reportId, userId}) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [categorizationDone, setCategorizationDone] = useState(false); // State to track if categorization has been done
  const [categorizedQuestions, setCategorizedQuestions] = useState([]);

  useEffect(() => {
    // Trigger categorization when component mounts or reportId or userId changes
    if (reportId && userId) {
      categorizeQuestions();
    }
  }, [reportId, userId]); // Dependencies that trigger the effect

  const categorizeQuestions = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_BACKEND_SERVER}/reports/${reportId}/users/${userId}?categorize=true`
      );
      console.log(response);
      setIsLoading(false);
      console.log(response.data.reports[0].categorized);
      setCategorizedQuestions(response.data.reports[0].categorized || []); // Ensure default value is set if response.data.categorized is undefined
      setCategorizationDone(true); // Mark categorization as done
    } catch (error) {
      setIsLoading(false);
      setError(error);
    }
  };

  return (
    <>
      <div className="pricing-header px-3 py-3 pt-md-5 pb-md-4 mx-auto">
        <h1>Question Categorization</h1>
        <div className="lead" style={{ backgroundColor: "white" }}>
          {categorizationDone ? (
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
                {/* Render categorized questions directly */}
                {categorizedQuestions.map((question, index) => (
                  <tr key={index}>
                    <td>{convertMsToTime(question.start_time)}</td>
                    <td>{convertMsToTime(question.end_time)}</td>
                    <td>{question.speaker}</td>
                    <td>{question.question}</td>
                    <td>{question.level}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>Click the button above to categorize questions.</p>
          )}
        </div>
      </div>
    </>
  );
}
