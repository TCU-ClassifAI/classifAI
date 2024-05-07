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
  questionDistributionComponent,
  collapseTimelineComponent,
  teacherQuestionTimelineComponent,
  reportId,
  userId,
}) => {
  const componentRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);
  const [transcriptBox, setTranscriptBox] = useState(false);
  const [talkDistBox, setTalkDistBox] = useState(false);
  const [wordCloudBox, setWordCloudBox] = useState(false);
  const [questDistBox, setQuestDistBox] = useState(false);
  const [collapseBox, setCollapseBox] = useState(false);
  const [timeLineBox, setTimelineBox] = useState(false);
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
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const imgWidth = canvas.width;
    const imgHeight = canvas.height;
    const maxImgHeightPerPage = pageHeight - 20; // Adjust for margins or padding
    const maxImgWidthPerPage = pageWidth - 20; // Adjust for margins or padding
    let scale;

    if (imgWidth > imgHeight) {
      scale = maxImgWidthPerPage / imgWidth;
    } else {
      scale = maxImgHeightPerPage / imgHeight;
    }

    pdf.addImage(imgData, "PNG", 0, 0, imgWidth * scale, imgHeight * scale);

    // Save PDF with the specified name
    pdf.save(pdfName);

    // Convert PDF to blob
    const pdfBlob = pdf.output("blob");

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


      
      }, 1500);
    }
  }, [isVisible, pdfName]);

  const handleSelectAll = () => {
    setAllSelected(!allSelected);
    // setTranscriptBox(true);
    setTalkDistBox(true);
    setWordCloudBox(true);
    setQuestDistBox(true);
    setCollapseBox(true);
    setTimelineBox(true);
  };

  const handleDeselectAll = () => {
    setAllSelected(false);
    setTranscriptBox(false);
    setTalkDistBox(false);
    setWordCloudBox(false);
    setQuestDistBox(false);
    setCollapseBox(false);
    setTimelineBox(false);
  };

  function generateDefaultFileName() {
    const date = new Date();
    let day = date.getDate();
    let month = date.getMonth() + 1;
    let year = date.getFullYear();
    let hour = date.getHours();
    let min = date.getMinutes();
    let sec = date.getSeconds();

    let currentDate = `${month}_${day}_${year}_${hour}_${min}_${sec}`;
    return currentDate.concat("Report");
  }

  const savePdfToApi = (pdfBlob) => {
    const formData = new FormData();
    formData.append("file", pdfBlob, `${pdfName}.pdf`);
    // Make API call using Axios to save the PDF
    axios
      .post(
        `${
          import.meta.env.VITE_BACKEND_SERVER
        }/files/reports/${reportId}/users/${userId}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      )
      .then((response) => {
        setAlertMsg("PDF Saved to database!");
        setAlertSeverity("success");
        setShowAlert(true);
      })
      .catch((error) => {
        console.error("Error saving PDF:", error);
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
    const componentsPerPage = 4; // Number of components per page
    const components = [];
    let currentComponentIndex = 0;

    // Push components to each page
    while (currentComponentIndex < 6) {
      // Assuming you have 6 components
      const pageComponents = [];
      for (let i = 0; i < componentsPerPage && currentComponentIndex < 6; i++) {
        switch (currentComponentIndex) {
          case 0:
            if (wordCloudBox) pageComponents.push(wordCloudComponent());
            break;
          case 1:
            if (transcriptBox) pageComponents.push(transcriptComponent());
            break;
          case 2:
            if (talkDistBox)
              pageComponents.push(talkingDistributionComponent());
            break;
          case 3:
            if (questDistBox)
              pageComponents.push(questionDistributionComponent());
            break;
          case 4:
            if (collapseBox) pageComponents.push(collapseTimelineComponent());
            break;
          case 5:
            if (timeLineBox)
              pageComponents.push(teacherQuestionTimelineComponent());
            break;
          default:
            break;
        }
        currentComponentIndex++;
      }
      components.push(pageComponents);
    }

    return components.map((pageComponents, index) => (
      <div key={index} ref={componentRef}>
        {pageComponents}
      </div>
    ));
  };

  return (
    <div>
      {isVisible && <div ref={componentRef}>{componentToCapture()}</div>}
      <button onClick={handleOpenModal} className="btn btn-primary">
        Save & Download PDF
      </button>
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
            <label className={styles.checkbox}>
              Question Distribution
              <input
                type="checkbox"
                checked={questDistBox}
                onChange={() => setQuestDistBox(!questDistBox)}
              />
            </label>
            <label className={styles.checkbox}>
              Question Timeline
              <input
                type="checkbox"
                checked={timeLineBox}
                onChange={() => setTimelineBox(!timeLineBox)}
              />
            </label>
            <label className={styles.checkbox}>
              Collapsed Timeline
              <input
                type="checkbox"
                checked={collapseBox}
                onChange={() => setCollapseBox(!collapseBox)}
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
          <button onClick={handleDownloadPDF} className="btn btn-primary">
            Save & Download PDF
          </button>
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
          <Alert
            severity={alertSeverity}
            onClose={() => {
              setShowAlert(false);
            }}
          >
            {alertMsg}
          </Alert>
        </div>
      )}
    </div>
  );
};

export default PdfOptions;
