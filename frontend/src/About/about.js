// about.js
import React from 'react';
import './about.css'; // Import the CSS file for styling
import ImageOne from '../images/michael-img.jpg';
import ImageTwo from '../images/curby-img.jpg';
import ImageThree from '../images/ma_liran-img.jpg';

const About = () => {
    return (
        <div className="about-container">
            <h1>The ClassifAI Project</h1>
            <p className="about-description">
            The Instructional Equity Observing Tool is an online video/audio analysis tool 
            that is geared towards assisting the teachers and faculty of educational institutions 
            in analyzing and understanding how their interaction with students translates into real learning. 
            Our platform is meant to replace the current, manual method of analysis that many teachers/instructors 
            perform to try and quantify different metrics about their teacher-student interaction. 
            Instructors have expressed desire to view metrics such as the time the teacher talks during a lesson, 
            what is the response time of students to those questions, and other data points 
            such as the types of questions being asked (as categorized by Bloom’s Taxonomy). 
            Quantifying these instructional variables helps these instructors more accurately 
            understand the areas that they are strong in, and more importantly, the areas in 
            which they can be more interactive with the students as to allow them to better absorb 
            the lessons being taught. With the help of our tool (hosted at https://ai4c.eurekalabs.net), 
            we can allow teachers to quickly and efficiently gather this data about each of their lessons 
            so that data driven changes in teaching techniques is possible, and moreover, so that teachers 
            can identify potential vectors of ineffective instruction.
            </p>

            <h2>Client</h2>

            <div className="image-text-row">
                <img src={ImageOne} alt="Description of Image One" className="about-image" />

                <div className="text-section">  
                    <h3>Dr. Michael Faggella-Luby</h3>
                    <p>
                    Dr. Faggella-Luby is a Professor of Special Education and Core Faculty of the Alice Neeley Special Education Research and Service (ANSERS) Institute
                    </p>
                </div>
            </div>

            <div className="image-text-row">
                <img src={ImageTwo} alt="Description of Image Two" className="about-image" />
                <div className="text-section">  
                    <h3>Dr. Curby Alexander</h3>
                    <p>
                    Curby Alexander is an Associate Professor of Professional Practice in the TCU College of Education.
                    He teaches courses on the foundations of education, instructional methods, digital communication and collaboration,
                    and experiential education. His current scholarship is focused on K-12 technology integration, 
                    cybersecurity education and workforce development, and geospatial education. For more information about Curby’s 
                    teaching, research, and writing, visit curbyalexander.net.
                    </p>
                </div>
            </div>

            <div className="image-text-row">
                <img src={ImageThree} alt="Description of Image Three" className="about-image" />
                <div className="text-section">  
                    <h3>Dr. Liran Ma</h3>
                    <p>
                    Dr. Ma is a Professor in the Department of Computer Science at Texas Christian University. 
                    His current research interests cover the security and reliability of networked information systems 
                    (such as Wi-Fi networks, cognitive radio networks, vehicular networks, sensor networks, social networks, and cloud services), 
                    and algorithms and protocols for smartphone based systems and applications (such as smart health and care), 
                    Internet of Things (IoT), artificial intelligence and security education.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default About;
