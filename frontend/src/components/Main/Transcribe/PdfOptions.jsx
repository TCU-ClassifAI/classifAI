import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { convertMsToTime } from "../../../utils/convertMsToTime";

export default function PdfOptions({ sentences, transcript, questions }) {
  async function generatePDF() {
    if (sentences) {
      let doc = new jsPDF("p", "pt", "letter");

      // Add the title
      doc.setFontSize(24);
      doc.setFont("helvetica", "bold");
      const title2 = "Analysis Visualizations";
      const titleWidth2 =
        (doc.getStringUnitWidth(title2) * doc.internal.getFontSize()) /
        doc.internal.scaleFactor;
      const pageWidth2 = doc.internal.pageSize.getWidth();
      const titleXX = (pageWidth2 - titleWidth2) / 2;
      doc.text(title2, titleXX, 50);

      // Add the first chart to the bottom
      const timeChartElement = document.getElementById("timeLineContainer");
      const timeCanvas = await html2canvas(timeChartElement, {
        scale: 2, // Increase the scale for better quality
        useCORS: true,
      });
      const timeImgData = timeCanvas.toDataURL("image/png");
      const timeImgWidth = doc.internal.pageSize.getWidth() - 40; // 20px margin on both sides
      const timeImgHeight =
        (timeCanvas.height * timeImgWidth) / timeCanvas.width;

      const pageHeight = doc.internal.pageSize.getHeight();
      const timeYPos = pageHeight - timeImgHeight - 30; // 30px margin from the bottom

      doc.addImage(
        timeImgData,
        "PNG",
        20,
        timeYPos,
        timeImgWidth,
        timeImgHeight
      );

      // Add the second chart to the baseline
      const chartElement = document.getElementById("timeChartContainer");
      const canvas = await html2canvas(chartElement, {
        scale: 2, // Increase the scale for better quality
        useCORS: true,
      });
      const imgData = canvas.toDataURL("image/png");
      const imgWidth = doc.internal.pageSize.getWidth() - 40; // 20px margin on both sides
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      const yPos = timeYPos - imgHeight - 30; // 30px margin from the first chart

      doc.addImage(imgData, "PNG", 20, yPos, imgWidth, imgHeight);

      // Add the third chart to the baseline
      const barChartElement = document.getElementById("barChartContainer");
      const barCanvas = await html2canvas(barChartElement, {
        scale: 2, // Increase the scale for better quality
        useCORS: true,
      });
      const pieChartElement = document.getElementById("pieChartContainer");
      const pieCanvas = await html2canvas(pieChartElement, {
        scale: 2, // Increase the scale for better quality
        useCORS: true,
      });

      const barImgData = barCanvas.toDataURL("image/png");
      const barImgWidth = doc.internal.pageSize.getWidth() / 2 - 40; // 20px margin on both sides
      const barImgHeight = (barCanvas.height * barImgWidth) / barCanvas.width;

      const pieImgData = pieCanvas.toDataURL("image/png");
      const pieImgWidth = doc.internal.pageSize.getWidth() / 2 - 40; // 20px margin on both sides
      const pieImgHeight = (pieCanvas.height * pieImgWidth) / pieCanvas.width;

      const chartYPos = yPos - barImgHeight - 30;
      doc.addImage(barImgData, "PNG", 20, chartYPos, barImgWidth, barImgHeight);
      doc.addImage(
        pieImgData,
        "PNG",
        doc.internal.pageSize.getWidth() / 2 + 20,
        chartYPos,
        pieImgWidth,
        pieImgHeight
      );

      let questionList = sentences.filter((sentence) => sentence.isQuestion);
      let questionArray = [];
      for (let i = 0; i < questionList.length; i++) {
        questionArray[i] = [
          convertMsToTime(questionList[i].start),
          questionList[i].speaker,
          questionList[i].text,
          questionList[i].label,
        ];
      }

      const pageWidth1 = doc.internal.pageSize.getWidth();
      //const pageHeight1 = doc.internal.pageSize.getHeight();
      const margin = 20;

      // Add a page break after charts
      doc.addPage();

      // Add question table
      doc.setFontSize(24);
      doc.setFont("helvetica", "bold");
      const title1 = "Questions Details";
      const titleWidth1 =
        (doc.getStringUnitWidth(title1) * doc.internal.getFontSize()) /
        doc.internal.scaleFactor;
      const titleX = (pageWidth1 - titleWidth1) / 2;
      doc.text(title1, titleX, margin * 2);
      doc.autoTable({
        head: [["Start Time", "Speaker", "Question", "Category"]],
        body: questionArray,
        startY: margin * 4 + 5,
        theme: "grid",
      });

      doc.save("demo.pdf");
    }
  }

  return (
    <>
      <button
        className="btn btn-primary"
        onClick={() => generatePDF(transcript, sentences, questions)}
        type="primary"
        id="bottom-button"
      >
        Download PDF
      </button>
    </>
  );
}
