import React from 'react';
import { HiMenu } from 'react-icons/hi';
import { modelDisplayMap } from '../../utils/modelUtils';

const ModelCard = ({ model, onModelClick, onModelMenuClick, isOwner }) => {
    const handleMenuClick = (e) => {
        e.stopPropagation();
        onModelMenuClick(model.id, e);
    };

    return (
        <div className={`model-card ${isOwner ? 'owned' : ''} ${model.jailbroken ? 'jailbroken' : ''}`} onClick={() => onModelClick(model.id)}>
            <div className="model-header">
                <div className="model-title-container">
                    {model.jailbroken && (
                        <div className="jailbroken-indicator">
                            <span className="jailbroken-check">✓</span>
                        </div>
                    )}
                    <h3 className="model-title">{model.title}</h3>
                </div>
                {isOwner && (
                    <button
                        className="model-menu-button"
                        onClick={handleMenuClick}
                        title="Model Options"
                    >
                        <HiMenu />
                    </button>
                )}
            </div>

            <div className="jailbreak-badges">
                {model.jailbroken && (
                    <span className="jailbroken-badge">Jailbroken</span>
                )}
                <span className="prize">{parseFloat(model.prize).toFixed(4)} SBC Prize</span>
                {!model.jailbroken && (
                    <>
                        <span className="prompt-cost">{parseFloat(model.promptCost).toFixed(4)} SBC/prompt</span>
                        <span className="attempts">{model.attempts} attempts</span>
                    </>
                )}
            </div>

            <p className="model-description">{model.description}</p>

            <div className="model-creator">
                <span className="creator-name">{model.creator}</span>
                <span className="ai-model">•&nbsp;&nbsp;{modelDisplayMap[model.aiModel] || model.aiModel}</span>
            </div>
        </div>
    );
};

export default ModelCard;
