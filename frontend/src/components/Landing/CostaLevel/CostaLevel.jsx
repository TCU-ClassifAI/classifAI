import React from 'react';
import './CostaLevel.css'; 
import CostaImage from "../../../images/costalevel.jpeg"; 

const CostaLevel = () => {
  return (
    <div className="costaLevel-container">
      <div className="title">
        <h1>Understanding Costa Levels</h1>
      </div>
      <div className="costaLevel-content">
        <div className="costaLevel-text">
          <p>
          Costa Levels leverages advanced AI to seamlessly categorize classroom questions into three distinct levels: Level 1 - Gathering, Level 2 - Procesing, and Level 3 - Applying.
            For simplicity, we will denote each level as Low, Medium, and High Level respectively. Additionally, we will denote inconclusive classifications as NA.
            This innovative approach empowers educators to gain deeper insights into their teaching dynamics, enabling a more nuanced understanding 
            and strategic engagement with every aspect of their classroom discussions.
          </p>
        </div>
        <div className="costaLevel-image">
          <img src={CostaImage} alt="Costa Levels"/>
        </div>
      </div>
    </div>
  );
};

export default CostaLevel;
