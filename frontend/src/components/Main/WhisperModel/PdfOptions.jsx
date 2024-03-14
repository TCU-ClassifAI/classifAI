import React, { useRef, useState, useEffect } from "react";
import { Modal, Button } from "react-bootstrap";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import axios from "axios"; // Import Axios
import styles from "./PdfOptions.module.css";
import Alert from "@mui/material/Alert";


const PdfOptions = ({
  wordCloudComponent,
  transcriptComponent,
  talkingDistributionComponent,
  reportId,
  userId
}) => {
  const componentRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);
  const [transcriptBox, setTranscriptBox] = useState(false);
  const [talkDistBox, setTalkDistBox] = useState(false);
  const [wordCloudBox, setWordCloudBox] = useState(false);
  const [showPdfModal, setShowPdfModal] = useState(false);
  const [pdfName, setPdfName] = useState(generateDefaultFileName()); // State for PDF name
  const [allSelected, setAllSelected] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [alertSeverity, setAlertSeverity] = useState("error");
  const [alertMsg, setAlertMsg] = useState("");

  

  useEffect(() => {
    if (isVisible) {
      // Capture component after it has been rendered
      setTimeout(() => {
        html2canvas(componentRef.current)
          .then((canvas) => {
            const imgData = canvas.toDataURL("image/png");
            const pdf = new jsPDF();
            const width = pdf.internal.pageSize.getWidth();
            const height = (canvas.height * width) / canvas.width;
            pdf.addImage(imgData, "PNG", 0, 0, width, height);

            // Save PDF with the specified name
            pdf.save(pdfName);

            // Convert PDF to blob
            const pdfBlob = pdf.output('blob');

            // Call API to save the PDF
            savePdfToApi(pdfBlob);

            // Hide the component after a delay
            setTimeout(() => {
              setIsVisible(false);
            }, 1000); // 1000 milliseconds = 1 second
          })
          .catch((error) => {
            console.error("Error generating PDF:", error);
          });
      }, 1000);
    }
  }, [isVisible, pdfName]);

  const handleSelectAll = () => {
    setAllSelected(!allSelected);
    setTranscriptBox(true);
    setTalkDistBox(true);
    setWordCloudBox(true);
  }

  const handleDeselectAll = () => {
    setAllSelected(false);
    setTranscriptBox(false);
    setTalkDistBox(false);
    setWordCloudBox(false);
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

  const savePdfToApi = (pdfBlob) => {

    const formData = new FormData();
    formData.append("file", pdfBlob, `${pdfName}.pdf`);
    // Make API call using Axios to save the PDF
    axios.post(`${window.backendServer}/files/reports/${reportId}/users/${userId}`, 
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    )
    .then(response => {
      setAlertMsg("PDF Saved to database!");
      setAlertSeverity("success");
      setShowAlert(true);
    })
    .catch(error => {
      console.error('Error saving PDF:', error);
      setAlertMsg("Error saving PDF to database!");
      setAlertSeverity("error");
      setShowAlert(true);
    });
  };

  const handleOpenModal = () => {
    setShowPdfModal(true);
  };

  const handleDownloadPDF = () => {
    setShowPdfModal(false);
    setIsVisible(true); // Show the component before capturing
  };

  const handlePdfNameChange = (e) => {
    setPdfName(e.target.value);
  };

  const componentToCapture = () => {
    let wordCloud;
    let transcript;
    let talkDist;
    if (wordCloudBox) {
      wordCloud = wordCloudComponent();
    }

    if (transcriptBox) {
      transcript = transcriptComponent();
    }

    if (talkDistBox) {
      talkDist = talkingDistributionComponent();
    }

    return (
      <>
        {wordCloud}
        {transcript}
        {talkDist}
      </>
    );
  };

  return (
    <div>
      {isVisible && <div ref={componentRef}>{componentToCapture()}</div>}
      <button onClick={handleOpenModal} className="btn btn-primary">Save & Download PDF</button>
      <Modal
        show={showPdfModal}
        onHide={() => {
          setShowPdfModal(false);
        }}
      >
        <Modal.Header closeButton>
          <Modal.Title>PDF Options</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className={styles.checkboxGroup}>
          <label className={styles.checkbox}>
            Select All
            <input
              type="checkbox"
              checked={allSelected}
              onChange={allSelected ? handleDeselectAll : handleSelectAll}
            />
          </label>
            {/* Currently this copies the transcript to an image but it doesnt capture the whole table 
            <label className={styles.checkbox}>
              Transcript
              <input
                type="checkbox"
                checked={transcriptBox}
                onChange={() => setTranscriptBox(!transcriptBox)}
              />
            </label> */}
            <label className={styles.checkbox}>
              Talking Distribution
              <input
                type="checkbox"
                checked={talkDistBox}
                onChange={() => setTalkDistBox(!talkDistBox)}
              />
            </label>
            <label className={styles.checkbox}>
              Word Cloud
              <input
                type="checkbox"
                checked={wordCloudBox}
                onChange={() => setWordCloudBox(!wordCloudBox)}
              />
            </label>
            <div>
              <label>PDF Name:</label>
              <input
                type="text"
                value={pdfName}
                onChange={handlePdfNameChange}
              />
            </div>
          </div>
          <button onClick={handleDownloadPDF} className="btn btn-primary">Save & Download PDF</button>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => {
              setShowPdfModal(false);
            }}
          >
            Close
          </Button>
        </Modal.Footer>
      </Modal>
      {showAlert && (
            <div>
              <Alert severity={alertSeverity} onClose={() => {setShowAlert(false)}}>
                {alertMsg}
              </Alert>
            </div>
          )}
    </div>
  );
};

export default PdfOptions;
