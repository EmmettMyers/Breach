import React from 'react';

const MessageList = ({
  messages,
  isLoading,
  showScrollButton,
  scrollToBottom,
  messagesContainerRef,
  messagesEndRef,
  onScroll
}) => {
  return (
    <div className="messages-container" ref={messagesContainerRef} onScroll={onScroll}>
      {messages.map((message) => (
        <div key={message.id} className={`message ${message.type}`}>
          <div className="message-content">
            {message.content}
          </div>
        </div>
      ))}
      {isLoading && (
        <div className="message ai">
          <div className="message-content">
            <div className="typing-indicator">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        </div>
      )}
      <div ref={messagesEndRef} />

      {showScrollButton && (
        <button
          className="scroll-to-bottom-button"
          onClick={() => scrollToBottom(true)}
          title="Scroll to bottom"
        >
          ↓
        </button>
      )}
    </div>
  );
};

export default MessageList;
