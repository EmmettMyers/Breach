import React from 'react';
import { FiAlertCircle, FiRefreshCw } from 'react-icons/fi';
import '../styles/components/ErrorState.css';

const ErrorState = ({ 
  title = "Error", 
  message = "Something went wrong. Please try again.", 
  onRetry = null,
  retryText = "Retry",
  fullScreen = false,
  className = "",
  icon: Icon = FiAlertCircle
}) => {
  const containerClass = fullScreen ? "error-state-fullscreen" : "error-state-container";
  
  const handleRetry = () => {
    if (onRetry) {
      onRetry();
    } else {
      window.location.reload();
    }
  };

  return (
    <div className={`${containerClass} ${className}`}>
      <div className="error-state">
        <div className="error-icon">
          <Icon />
        </div>
        <h2 className="error-title">{title}</h2>
        <p className="error-message">{message}</p>
        <button className="error-retry-btn" onClick={handleRetry}>
          <FiRefreshCw className="retry-icon" />
          {retryText}
        </button>
      </div>
    </div>
  );
};

export default ErrorState;
