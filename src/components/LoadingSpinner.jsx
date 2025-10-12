import React from 'react';
import '../styles/components/LoadingSpinner.css';

const LoadingSpinner = ({ 
  message = "", 
  size = "large", 
  fullScreen = false,
  className = "" 
}) => {
  const containerClass = fullScreen ? "loading-spinner-fullscreen" : "loading-spinner-container";
  
  return (
    <div className={`${containerClass} ${className}`}>
      <div className="loading-spinner">
        <div className={`spinner spinner-${size}`}></div>
        {message && <p className="loading-message">{message}</p>}
      </div>
    </div>
  );
};

export default LoadingSpinner;
