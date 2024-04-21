import styles from "./about.module.css"; // Import the CSS file for styling
import NagatoKadoya from "../../../images/NagatoKadoya.png";
import TaylorGriffin from "../../../images/TaylorGriffin.png";
import JohnHenryMejia from "../../../images/JohnHenryMejia.jpg";
import JohnNguyen from "../../../images/johnheadshot2.jpeg";
import JaxonHill from "../../../images/JaxonHill.jpg";

export default function DeveloperTeam() {
  const developers = [
    {
      name: "John Nguyen",
      role: "Developer",
      description: `An Honors senior computer science student with a double minor in mathematics and astronomy. Developed features for the landing page and main portal in the frontend written in the React.js framework.`,
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
      description: `A senior computer information technology student. Created and managed the MongoDB server and handled deployment of our website on Nginx.`,
      imageUrl: JaxonHill,
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
      description: `A senior computer science student serving as the User Interface/User Experience designer. Responsible for developing frontend features in React.js and styles.`,
      imageUrl: NagatoKadoya,
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
