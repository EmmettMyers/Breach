import { SBC_DECIMALS, chain } from '../config/rpc';

export const formatSbcBalance = (balance) => {
  if (!balance) return '0.0000';
  try {
    return (Number(balance) / Math.pow(10, SBC_DECIMALS(chain))).toFixed(4);
  } catch {
    return '0.0000';
  }
};

export const scrollToBottom = (messagesEndRef, smooth = true) => {
  if (messagesEndRef.current) {
    messagesEndRef.current.scrollIntoView({ 
      behavior: smooth ? 'smooth' : 'auto',
      block: 'end',
      inline: 'nearest'
    });
  }
};

export const handleScroll = (messagesContainerRef, setShowScrollButton) => {
  if (messagesContainerRef.current) {
    const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;
    const isAtBottom = scrollHeight - scrollTop - clientHeight < 50;
    setShowScrollButton(!isAtBottom);
  }
};

export const setTransferStatusWithTimeout = (setTransferStatus, transferStatusTimeoutRef) => (status) => {
  setTransferStatus(status);
  
  if (transferStatusTimeoutRef.current) {
    clearTimeout(transferStatusTimeoutRef.current);
  }
  
  transferStatusTimeoutRef.current = setTimeout(() => {
    const statusElement = document.querySelector('.transfer-status');
    if (statusElement) {
      statusElement.classList.add('fade-out');
      setTimeout(() => {
        setTransferStatus(null);
      }, 150);
    } else {
      setTransferStatus(null);
    }
  }, 3000);
};

export const isModelOwner = (ownerAddress, model) => {
  return ownerAddress && model && model.user_id === ownerAddress;
};
