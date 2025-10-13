import React from 'react';

const ModelMenu = ({
    isOpen,
    onClose,
    modelMenu,
    depositAmount,
    setDepositAmount,
    withdrawAmount,
    setWithdrawAmount,
    onDepositPrize,
    onWithdrawPrize,
    onDeleteModel
}) => {
    if (!isOpen) return null;

    return (
        <div className="model-menu-overlay" onClick={onClose}>
            <div
                className="model-menu"
                style={{
                    position: 'fixed',
                    left: modelMenu.x,
                    top: modelMenu.y,
                    zIndex: 1000
                }}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="model-menu-header">
                    <h4>Model Options</h4>
                    <button className="close-menu" onClick={onClose}>×</button>
                </div>

                <div className="model-menu-actions">
                    <div className="menu-section">
                        <h5>Prize Management</h5>
                        <div className="input-group">
                            <input
                                type="number"
                                placeholder="Deposit amount (SBC)"
                                value={depositAmount}
                                onChange={(e) => setDepositAmount(e.target.value)}
                                className="menu-input"
                            />
                            <button onClick={onDepositPrize} className="menu-button deposit">
                                Deposit Prize
                            </button>
                        </div>
                        <div className="input-group">
                            <input
                                type="number"
                                placeholder="Withdraw amount (SBC)"
                                value={withdrawAmount}
                                onChange={(e) => setWithdrawAmount(e.target.value)}
                                className="menu-input"
                            />
                            <button onClick={onWithdrawPrize} className="menu-button withdraw">
                                Withdraw Prize
                            </button>
                        </div>
                    </div>

                    <div className="menu-section">
                        <h5>Model Actions</h5>
                        <button onClick={onDeleteModel} className="menu-button delete">
                            Delete Model
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ModelMenu;
