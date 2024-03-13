import { useState } from "react";
import { convertMsToTime } from "../../../utils/convertMsToTime";
import axios from "axios";
import { saveAs } from "file-saver";
import ErrorModal from "../../Common/ErrorModal";

export default function CsvOptions({
  transcription,
  reportId,
  userId,
}) {
  const [startTimeBox, setStartTimeBox] = useState(false);
  const [endTimeBox, setEndTimeBox] = useState(false);
  const [speakerBox, setSpeakerBox] = useState(false);
  const [textBox, setTextBox] = useState(false);
  const [allSelected, setAllSelected] = useState(false);
  const [fileName, setFileName] = useState("");
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorModalMsg, setErrorModalMsg] = useState("");

  const handleSelectAll = () => {
    setAllSelected(!allSelected);
    setStartTimeBox(true);
    setEndTimeBox(true);
    setSpeakerBox(true);
    setTextBox(true);
  };

  const handleDeselectAll = () => {
    setAllSelected(false);
    setStartTimeBox(false);
    setEndTimeBox(false);
    setSpeakerBox(false);
    setTextBox(false);
  };

  const handleCloseErrorModal = () => {
    setShowErrorModal(false);
  };

  // Helper Function for saveToCSV()
  function buildCSVHeader() {
    const csvColumns = [];
    // Build the Header of the CSV based on checkboxes
    // Example Start Time, End Time, Type, Text

    if (startTimeBox) {
      csvColumns.push("Start Time");
    }

    if (endTimeBox) {
      csvColumns.push("End Time");
    }

    if (speakerBox) {
      csvColumns.push("Speaker");
    }

    if (textBox) {
      csvColumns.push("Text");
    }

    return csvColumns.join(", ");
  }

  function buildCSVRowLine(line) {
    const data = [];

    if (startTimeBox) {
      data.push(`"${convertMsToTime(line.start_time)}"`);
    }

    if (endTimeBox) {
      data.push(`"${convertMsToTime(line.end_time)}"`);
    }

    if (speakerBox) {
      data.push(`"${line.speaker}"`);
    }

    if (textBox) {
      data.push(`"${line.text.trim().replace(/"/g, '""')}"`);
    }

    return data;
  }

  function generateDefaultFileName() {
    const date = new Date();
    let day = date.getDate();
    let month = date.getMonth() + 1;
    let year = date.getFullYear();
    let hour = date.getHours();
    let min = date.getMinutes();
    let sec = date.getSeconds();

    let currentDate = `${month}_${day}_${year}_${hour}_${min}_${sec}`;
    return currentDate.concat("Transcript");
  }

  async function uploadCSV(blob, finalFileName) {
    try {
      const formData = new FormData();
      formData.append("file", blob, `${finalFileName}.csv`);

      // Make a POST request to upload the file
      await axios.post(
        `${window.backendServer}/files/reports/${reportId}/users/${userId}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      console.log("Upload Success");

      // Refetch user files after save
    } catch (error) {
      console.error("Error uploading file", error);
      // Optionally handle error here
      setErrorModalMsg("Error uploading file");
      setShowErrorModal(true);
    }
  }

  async function saveToCSV() {
    const headerRow = buildCSVHeader();
    var lines = transcription;

    // Create a CSV content with three columns: Timestamp, Speaker, and Sentences
    const csvContent = `${headerRow}\n${lines
      .map((line, index) => {
        var data = [];

        data = buildCSVRowLine(line);

        return data.join(", ");
      })
      .filter((row) => row.length > 0) // Filter out empty rows
      .join("\n")}`;

    // Create a Blob with the CSV content
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8" });

    let finalFileName = fileName;
    if (finalFileName.trim() === "") {
      finalFileName = generateDefaultFileName();
    }

    saveAs(blob, `${finalFileName}.csv`);

    // Save the file using FileSaver.js
    await uploadCSV(blob, finalFileName);
  }

  return (
    <>
      <ErrorModal 
        message={errorModalMsg}
        showErrorModal={showErrorModal}
        handleCloseErrorModal={handleCloseErrorModal}
      />
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
          Text
          <input
            type="checkbox"
            className="checkBox"
            checked={textBox}
            onChange={() => setTextBox(!textBox)}
          ></input>
        </label>
        <select className="dropdown">
          <option value="fullTranscript">Include Full Transcript</option>
        </select>
      </div>
      <div>
        <input
          className="fileNameInput"
          type="text"
          id="fileName"
          value={fileName}
          placeholder="Enter CSV file name (optional)"
          onChange={(e) => setFileName(e.target.value)}
        />
      </div>
      <button
        onClick={() => saveToCSV()}
        className="btn btn-primary"
        id="bottom-button2"
        disabled={reportId.trim() === ""}
      >
        Save & Download CSV
      </button>
    </>
  );
}
