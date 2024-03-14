import React, { useRef, useState, useEffect } from "react";
import { Modal, Button } from "react-bootstrap";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import styles from "./PdfOptions.module.css";

const PdfOptions = ({
  wordCloudComponent,
  transcriptComponent,
  talkingDistributionComponent,
}) => {
  const componentRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);
  const [transcriptBox, setTranscriptBox] = useState(false);
  const [talkDistBox, setTalkDistBox] = useState(false);
  const [wordCloudBox, setWordCloudBox] = useState(false);
  const [showPdfModal, setShowPdfModal] = useState(false);

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
            pdf.save("download.pdf");

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
  }, [isVisible]);

  const handleOpenModal = () => {
    setShowPdfModal(true);
  };

  const handleDownloadPDF = () => {
    setShowPdfModal(false);
    setIsVisible(true); // Show the component before capturing
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
          {
            <div className={styles.checkboxGroup}>
              <label className={styles.checkbox}>
                Transcript
                <input
                  type="checkbox"
                  checked={transcriptBox}
                  onChange={() => setTranscriptBox(!transcriptBox)}
                />
              </label>
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
            <button onClick={handleDownloadPDF} className="btn btn-primary">Save & Download PDF</button>

            </div>      
          }
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
    </div>
  );
};

export default PdfOptions;
