import React from 'react';
import { FiInbox, FiPlus } from 'react-icons/fi';
import '../styles/components/NoDataState.css';

const NoDataState = ({ 
  title = "No Data Available", 
  message = "There's nothing to show here yet.", 
  actionText = null,
  onAction = null,
  fullScreen = false,
  className = "",
  icon: Icon = FiInbox
}) => {
  const containerClass = fullScreen ? "no-data-state-fullscreen" : "no-data-state-container";
  
  return (
    <div className={`${containerClass} ${className}`}>
      <div className="no-data-state">
        <div className="no-data-icon">
          <Icon />
        </div>
        <h2 className="no-data-title">{title}</h2>
        <p className="no-data-message">{message}</p>
        {actionText && onAction && (
          <button className="no-data-action-btn" onClick={onAction}>
            <FiPlus className="action-icon" />
            {actionText}
          </button>
        )}
      </div>
    </div>
  );
};

export default NoDataState;
