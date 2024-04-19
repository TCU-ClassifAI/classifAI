import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faComments, faFileExport, faMicrochip, faQuestion } from "@fortawesome/free-solid-svg-icons";
import styles from "./Features.module.css";

export default function Features() {
  const featuresData = [
    {
      icon: faComments,
      title: "Speech Recognition and Diarization",
      description:
        "Enjoy blazing fast performance transcription through optimized speech recognition and diarization algorithms.",
    },
    {
      icon: faMicrochip,
      title: "Summarization",
      description:
       "Condense class lectures into succinct summaries using AI-driven technology. Enhanced by WhisperX, it distills key points for quick, efficient review and comprehension.",
    },
    {
      icon: faQuestion,
      title: "Question Categorization and Analysis",
      description:
        "All transcripts will undergo a thorough analysis to categorize the questions and evaluate instructional effectiveness. Detailed data visualization will be provided.",
    },
    {
      icon: faFileExport,
      title: "Exportable Data",
      description:
        "Easily export transcriptions and data visualization models to PDF and CSV!",
    },
  ];

  const title = "Features";

  return (
    <>
      <div className={styles.title} id="features">
        <h1>{title}</h1>
      </div>
      <div className={styles.featuresContainer}>
        {featuresData.map((feature, index) => (
          <div className={styles.featureItem} key={index}>
            <div className={styles.featureIcon}>
              <FontAwesomeIcon icon={feature.icon} />
            </div>
            <div className={styles.featureDetails}>
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
