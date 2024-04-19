// CostaLevel.js
import React from 'react';
import './CostaLevel.css'; // Make sure to create this CSS file
import CostaImage from "../../../images/costalevel.jpg"; // Make sure to import your image

const CostaLevel = () => {
  return (
    <div className="costaLevel-container">
      <div className="costaLevel-content">
        <div className="costaLevel-text">
          <h2>Understanding Costa Levels</h2>
          <p>
          Costa Levels leverages advanced AI to seamlessly categorize classroom questions into four distinct levels of depth: high, medium, low, and N/A.
          This innovative approach empowers educators to gain deeper insights into their teaching dynamics, enabling a more nuanced understanding 
          and strategic engagement with every aspect of their classroom discussions.
          </p>
          {/* Add more content as needed */}
        </div>
        <div className="costaLevel-image">
            <img
            src={CostaImage} // Use the imported image here
            alt="Costa Levels"
          />
        </div>
      </div>
    </div>
  );
};

export default CostaLevel;
