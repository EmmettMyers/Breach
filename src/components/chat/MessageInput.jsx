import React from 'react';

const MessageInput = ({
  model,
  inputMessage,
  handleSendMessage,
  handleKeyPress,
  handleInputChange,
  isLoading,
  isTransferLoading,
  account,
  sbcBalance,
  formatSbcBalance,
  isModelJailbroken,
  isLoadingBalance
}) => {
  if (isModelJailbroken) {
    return (
      <div className="input-container">
        <div className="jailbreak-lock-message">
          <div className="success-check">✓</div>
          <div className="lock-text">
            <span>Model Successfully Jailbroken!</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="input-container">
      <div className="input-wrapper">
        <textarea
          value={inputMessage}
          onChange={handleInputChange}
          onKeyPress={handleKeyPress}
          placeholder={`Enter prompts to jailbreak ${model.title}...`}
          className="message-input"
          rows="1"
          disabled={isLoading || isTransferLoading || !account}
        />
        <button
          onClick={handleSendMessage}
          disabled={!inputMessage.trim() || isLoading || isTransferLoading || !account || (sbcBalance && parseFloat(formatSbcBalance(sbcBalance)) < model.promptCost)}
          className="send-button"
        >
          {isTransferLoading ? 'Processing...' : isLoading ? 'Sending...' :
            (sbcBalance && parseFloat(formatSbcBalance(sbcBalance)) < model.promptCost) ? 'Insufficient Balance' : 'Send'}
        </button>
      </div>
      <div className="cost-info">
        Cost: {parseFloat(model.promptCost).toFixed(4)} SBC per prompt
        {account && (
          <span className="account-balance">
            &nbsp;• SBC Balance: {isLoadingBalance ? 'Loading...' : `${formatSbcBalance(sbcBalance)} SBC`}
          </span>
        )}
      </div>
    </div>
  );
};

export default MessageInput;
