import React from "react";

export default function Summarization({ summary }) {
  const currentSummary = summary || "No Summary Could be Generated";

  return (
    <div className="container" style={{ maxWidth: "1400px" }}>
      <div className="card">
        <div className="card-body">
          <h1 className="card-title">Summarization</h1>
          <p className="card-text text-left">{currentSummary}</p>
        </div>
      </div>
    </div>
  );
}