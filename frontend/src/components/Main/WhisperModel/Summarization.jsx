import React from "react";

export default function Summarization({ summary }) {

  return (
    <>
      <div className="container" style={{ maxWidth: "1400px" }}>
      <div className="card">
        <div className="card-body">
          <h1 className="card-title">Summarization</h1>
          <p className="card-text text-left">{summary}</p>
        </div>
      </div>
    </div>
      
    </>
  );
}
