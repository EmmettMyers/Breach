import React from 'react';
import { useNavigate } from 'react-router-dom';
import { modelDisplayMap } from '../../utils/modelUtils';

const ChatHeader = ({ model, isModelOwner }) => {
  const navigate = useNavigate();

  return (
    <div className="chat-header">
      <button className="back-button" onClick={() => navigate('/')}>
        ← Back
      </button>
      <div className="model-info">
        <h1 className="model-title">{model.title}</h1>
        <div className="model-meta">
          <span className="creator">{model.creator}</span>
          <span className="ai-model">•&nbsp;&nbsp;{modelDisplayMap[model.aiModel] || model.aiModel}</span>
          {isModelOwner && (
            <span className="owned-pill">Your Model</span>
          )}
        </div>
      </div>
      <div className="model-stats">
        <div className="stat">
          <span className="stat-value">{Number(model.prize).toFixed(4)}</span>
          <span className="stat-label">SBC Prize</span>
        </div>
        <div className="stat">
          <span className="stat-value">{model.attempts}</span>
          <span className="stat-label">Attempts</span>
        </div>
      </div>
    </div>
  );
};

export default ChatHeader;
