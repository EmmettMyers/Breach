import React from 'react';

const ModelManagement = ({
  depositAmount,
  setDepositAmount,
  withdrawAmountChat,
  setWithdrawAmountChat,
  handleDepositPrize,
  handleWithdrawPrize,
  handleDeleteModel
}) => {
  return (
    <div className="model-management-nav">
      <div className="nav-section">
        <div className="nav-header">
          <h4>Model Management</h4>
          <div className="nav-actions">
            <div className="action-group">
              <input
                type="number"
                placeholder="Deposit amount (SBC)"
                value={depositAmount}
                onChange={(e) => setDepositAmount(e.target.value)}
                className="nav-input"
              />
              <button onClick={handleDepositPrize} className="nav-button deposit">
                Deposit Prize
              </button>
            </div>
            <div className="action-group">
              <input
                type="number"
                placeholder="Withdraw amount (SBC)"
                value={withdrawAmountChat}
                onChange={(e) => setWithdrawAmountChat(e.target.value)}
                className="nav-input"
              />
              <button onClick={handleWithdrawPrize} className="nav-button withdraw">
                Withdraw Prize
              </button>
            </div>
            <button onClick={handleDeleteModel} className="nav-button delete">
              Delete Model
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModelManagement;
