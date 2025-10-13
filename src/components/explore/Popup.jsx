import React from 'react';

const Popup = ({ isOpen, onClose, title, message, type = 'info' }) => {
    if (!isOpen) return null;

    return (
        <div className="popup-overlay" onClick={onClose}>
            <div className="popup-content" onClick={(e) => e.stopPropagation()}>
                <div className="popup-header">
                    <h3 className="popup-title">{title}</h3>
                    <button className="popup-close" onClick={onClose}>×</button>
                </div>
                <div className="popup-body">
                    <p className="popup-message">{message}</p>
                </div>
                <div className="popup-footer">
                    <button className="popup-button" onClick={onClose}>OK</button>
                </div>
            </div>
        </div>
    );
};

export default Popup;
