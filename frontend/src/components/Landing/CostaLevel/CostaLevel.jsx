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
          Costa Levels leverages advanced AI to seamlessly categorize classroom questions into three distinct levels of Gathering, Procesing, and Applying.
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
