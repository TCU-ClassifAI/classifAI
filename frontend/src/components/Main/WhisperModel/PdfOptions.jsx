import React, { useRef } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import FullTranscript from "./FullTranscript";

export default function PdfOptions({
  transcription,
  setTranscription,
  speakers,
  setSpeakers,
  teacher,
  show,
  setShow,
}) {
  const componentRef = useRef(null);

  const handleDownloadPDF = async () => {
    if (componentRef.current) {
      const canvas = await html2canvas(componentRef.current);
      const imgData = canvas.toDataURL("image/png");

      const doc = new jsPDF();
      doc.addImage(imgData, "PNG", 10, 10, 100, 100); // Add image to PDF
      doc.text("Hello, this is content for PDF!", 10, 120); // Add text to PDF
      doc.save("generated.pdf"); // Save PDF
    }
  };

  return (
    <div>
      <div ref={componentRef}>
        {/* Include the React component you want to render */}
        <FullTranscript
          transcription={transcription}
          setTranscription={setTranscription}
          speakers={speakers}
          setSpeakers={setSpeakers}
          teacher={teacher}
          setShow={setShow}
          show={show}
        />
        {/* Other content can be added here as well */}
        <h1>Hello, this is content for the image!</h1>
        <p>This is a paragraph.</p>
      </div>
      <button onClick={handleDownloadPDF}>Download PDF</button>
    </div>
  );
}
