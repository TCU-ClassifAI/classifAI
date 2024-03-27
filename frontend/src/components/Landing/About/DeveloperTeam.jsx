import styles from "./about.module.css"; // Import the CSS file for styling
import generic from "../../../images/genericprofile.jpg";
import TaylorGriffin from "../../../images/TaylorGriffin.png";
import JohnHenryMejia from "../../../images/JohnHenryMejia.jpg";
import JohnNguyen from "../../../images/johnheadshot2.jpeg";

export default function DeveloperTeam() {
  const developers = [
    {
      name: "John Nguyen",
      role: "Developer",
      description: `An Honors senior computer science student with a double minor in mathematics and astronomy. Responsible for the frontend written in react.js`,
      imageUrl: JohnNguyen,
    },
    {
      name: "John Henry Mejía",
      role: "Developer",
      description: `A senior computer science student with a double minor in mathematics and general business. Developed the classifAI engine using WhisperX and NVIDIA's NeMo for alignment, and for question categorization by fine-tuning Google's Gemma via LoRA.`,
      imageUrl: JohnHenryMejia,
    },
    {
      name: "Jaxon Hill",
      role: "Developer",
      description: `A senior computer information technology student. Created and managed the MongoDB server and public domain.`,
      imageUrl: generic,
    },
    {
      name: "Taylor Griffin",
      role: "Developer",
      description: `A senior computer information technology student. Developed the backend written in Express.js. Additionally, designed ClassifAI logo.`,
      imageUrl: TaylorGriffin,
    },
    {
      name: "Nagato Kadoya",
      role: "Developer",
      description: `A senior computer science student. Responsible for frontend written in react.js`,
      imageUrl: generic,
    },
  ];
  return (
    <div>
      <div className={styles.titleContainer}>
        <h1 className={styles.title}>Developer Team</h1>
      </div>
      <div className={styles.developerContainer}>
        {developers.map((member, index) => (
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
    </div>
  );
}
