// about.js
import styles from "./about.module.css"; // Import the CSS file for styling
import MichaelFaggella from "../../../images/michael-img.jpg";
import CurbyAlexander from "../../../images/curby-img.jpg";
import LiranMa from "../../../images/ma_liran-img.jpg";

export default function ResearchTeam() {
  const researchers = [
    {
      name: "Dr. Michael Faggella Luby",
      role: "Researcher",
      description:
        "A Professor of Special Education and Core Faculty of the Alice Neeley Special Education Research and Service (ANSERS) Institute.",
      imageUrl: MichaelFaggella,
    },
    {
      name: "Dr. Curby Alexander",
      role: "Researcher",
      description: `An Associate Professor of Professional Practice in the TCU College of Education. 
            He teaches courses on the foundations of education, instructional methods, digital 
            communication and collaboration, and experiential education. His current scholarship 
            is focused on K-12 technology integration, cybersecurity education and workforce development, 
            and geospatial education. For more information about Curby’s teaching, research, and writing, visit curbyalexander.net.`,
      imageUrl: CurbyAlexander,
    },
    {
      name: "Dr. Liran Ma",
      role: "Researcher",
      description:
        "A Professor in the Department of Computer Science at Texas Christian University. His current research interests cover the security and reliability of networked information systems (such as Wi-Fi networks, cognitive radio networks, vehicular networks, sensor networks, social networks, and cloud services), and algorithms and protocols for smartphone based systems and applications (such as smart health and care), Internet of Things (IoT), artificial intelligence and security education.",
      imageUrl: LiranMa,
    },
  ];
  return (
    <>
      <div className={styles.titleContainer}>
        <h1 className={styles.title}>Research Team</h1>
      </div>
      <div className={styles.researcherContainer}>
        {researchers.map((member, index) => (
          <div key={index} className={styles.teamMember}>
            <img
              src={member.imageUrl}
              alt={member.name}
              className={styles.circularImage}
            />
            <h3>{member.name}</h3>
            <p className={styles.role}>{member.role}</p>
            <p className={styles.description}>{member.description}</p>
          </div>
        ))}
      </div>
    </>
  );
}
