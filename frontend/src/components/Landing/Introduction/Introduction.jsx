import { Link } from "react-router-dom";
import styles from "./Introduction.module.css";
import classroomgraphic from "../../../images/classroomgraphic.jpg";


export default function Introduction() {
    const title =
        "An Instructional Equity Observing Tool Powered by AI";
    const sections = [
        {
            title: "Why:",
            content:
                "Manual methods of analysis are time-consuming and may not be effective in quantifying metrics between teacher and student interactions.",
        },
        {
            title: "Who:",
            content:
                "Instructors who seek more effective and efficient ways to analyze their teaching methodologies.",
        },
        {
            title: "What:",
            content:
                "An online video/audio analysis platform to assist educators in understanding how their interactions with students impact real learning. It provides quantifiable metrics related to teacher-student interaction, such as talk time, student response time, and question types (categorized by Blooms Taxonomy).",
        },
        {
            title: "Where:",
            content:
                "Hosted here at https://classifai.tcu.edu, our platform provides instructors with an easily accessible solution to gain insights from each of their lessons.",
        },
        {
            title: "How:",
            content:
                "Register an account with us and start uploading your lessons today!",
        },
    ];

    const highlightKeywords = (text) => {
        const keywords = ["time-consuming", "teacher and student", "effective", "efficient", "Instructors who", "Register an account", "categorized by Blooms Taxonomy", "Hosted here at https://classifai.tcu.edu", "online video/audio analysis platform", "accessible"];
        return keywords.reduce((result, keyword) => {
            const regex = new RegExp(`\\b${keyword}\\b`, "gi");
            return result.replace(regex, `<strong>${keyword}</strong>`);
        }, text);
    };

    return (
        <div id="home" className={styles.imageDescriptionContainer}>
            <div className={styles.description}>
                <h2>{title}</h2>
                {sections.map((section, index) => (
                    <p
                        key={index}
                        dangerouslySetInnerHTML={{
                            __html: `<strong class=${styles.strong}>${section.title} </strong>${highlightKeywords(
                                section.content
                            )}`,
                        }}
                    />
                ))}
                 <div className={styles.buttonsContainer}>
                    <Link to="/signup">
                        <button className={styles.button}>Sign Up</button>
                    </Link>
                    <Link to="/login">
                        <button className={styles.button}>Login</button>
                    </Link>
                </div>
            </div>
            <div className={styles.image}>
                <img src={classroomgraphic} alt="Description" />
            </div>
        </div>
    );
}
