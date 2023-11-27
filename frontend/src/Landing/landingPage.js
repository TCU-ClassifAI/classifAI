// about.js
import React from 'react';
import './landing.css'; // Import the CSS file for styling
import ImageOne from '../images/michael-img.jpg'
import ImageTwo from '../images/curby-img.jpg';
import ImageThree from '../images/ma_liran-img.jpg';

const landingPage = () => {
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
            the lessons being taught. With the help of our tool (hosted at http://classifai.tcu.edu), 
            we can allow teachers to quickly and efficiently gather this data about each of their lessons 
            so that data driven changes in teaching techniques is possible, and moreover, so that teachers 
            can identify potential vectors of ineffective instruction.
            </p>



            
        </div>
    );
};

export default landingPage;
