import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useUserOperation, WalletButton } from '@stablecoin.xyz/react';
import { parseUnits, encodeFunctionData } from 'viem';
import { useWalletState } from '../hooks/useWalletState';
import { aiModels } from '../data/mockData';
import '../styles/screens/Chat.css';

const Chat = () => {
  const { modelId } = useParams();
  const navigate = useNavigate();
  const [model, setModel] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [currentMessage, setCurrentMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [transferStatus, setTransferStatus] = useState(null);
  const messagesEndRef = useRef(null);

  // SBC AppKit hooks
  const { account, ownerAddress, isLoadingAccount, forceUpdate, setForceUpdate, walletBalance, isLoadingWalletBalance, fetchWalletBalance } = useWalletState();
  const { sendUserOperation, isLoading: isTransferLoading, isSuccess: isTransferSuccess, error: transferError } = useUserOperation({
    onSuccess: (result) => {
      console.log('Stablecoin transfer successful:', result);
      setTransferStatus({ type: 'success', hash: result.transactionHash });
      // Refresh balance after successful transfer
      fetchWalletBalance();
      
      // Show AI response after successful transfer
      setTimeout(() => {
        const aiResponse = {
          id: Date.now() + 1,
          type: 'ai',
          content: `I understand you're asking about "${currentMessage}". As ${model.title}, I'm here to help with ${model.description.toLowerCase()}. Could you provide more specific details about what you'd like assistance with?`,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, aiResponse]);
        setIsLoading(false);
      }, 1000);
    },
    onError: (error) => {
      console.error('Stablecoin transfer failed:', error);
      setTransferStatus({ type: 'error', message: error.message });
      setIsLoading(false);
    }
  });


  // Find the model by ID
  useEffect(() => {
    const foundModel = aiModels.find(m => m.id === parseInt(modelId));
    if (foundModel) {
      setModel(foundModel);
      // Add welcome message
      setMessages([
        {
          id: 1,
          type: 'ai',
          content: `Hello! I'm ${foundModel.title}. ${foundModel.description} How can I assist you today?`,
          timestamp: new Date()
        }
      ]);
    } else {
      // Model not found, redirect to explore
      navigate('/');
    }
  }, [modelId, navigate]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading || isTransferLoading) return;

    // Check if wallet is connected
    if (!ownerAddress) {
      alert('Please connect your wallet to send messages and make stablecoin transfers.');
      return;
    }

    // Fixed cost of 0.01 SBC (one cent) for all prompts
    const promptCost = 0.01;
    if (walletBalance && parseFloat(walletBalance.formatted) < promptCost) {
      alert(`Insufficient balance. You need ${promptCost} ${walletBalance.symbol} but only have ${walletBalance.formatted} ${walletBalance.symbol}.`);
      return;
    }

    // Additional check: Ensure we have sufficient balance for the transfer
    if (!walletBalance || parseFloat(walletBalance.formatted) < promptCost) {
      alert(`Insufficient SBC balance. You need ${promptCost} SBC but only have ${walletBalance ? parseFloat(walletBalance.formatted).toFixed(4) : '0'} SBC. Please get SBC tokens from the SBC Dashboard or faucet.`);
      return;
    }

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setCurrentMessage(inputMessage); // Store the current message for the AI response
    setInputMessage('');
    setIsLoading(true);
    setTransferStatus(null);
    
    // Reset textarea height
    const textarea = document.querySelector('.message-input');
    if (textarea) {
      textarea.style.height = 'auto';
    }

    try {
      // Send stablecoin transfer for the prompt cost (fixed at 0.01 SBC)
      const promptCost = 0.01; // Fixed cost of 0.01 SBC (one cent)
      const costInWei = parseUnits(promptCost.toString(), 18);
      
      // Fixed recipient address for payments
      const recipientAddress = '0x0943091Cd1804A562F8Bd6F99c230BCc3A08b87d';
      
      // SBC is an ERC-20 token, so we need to use the transfer function
      // SBC token contract address on Base Sepolia (from SBC documentation)
      const sbcTokenAddress = '0xf9FB20B8E097904f0aB7d12e9DbeE88f2dcd0F16';
      
      // Encode the ERC-20 transfer function call
      const transferData = encodeFunctionData({
        abi: [{
          "inputs": [
            {"internalType": "address", "name": "to", "type": "address"},
            {"internalType": "uint256", "name": "amount", "type": "uint256"}
          ],
          "name": "transfer",
          "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
          "stateMutability": "nonpayable",
          "type": "function"
        }],
        functionName: 'transfer',
        args: [recipientAddress, costInWei]
      });
      
      // Debug information
      console.log('Transfer details:', {
        recipientAddress,
        sbcTokenAddress,
        costInWei: costInWei.toString(),
        promptCost,
        walletBalance: walletBalance?.formatted,
        accountAddress: account?.address
      });

      // Send the ERC-20 transfer through the smart account
      const transferResult = await sendUserOperation({
        to: sbcTokenAddress,
        data: transferData,
        value: '0', // No native ETH value for ERC-20 transfers
      });

      console.log('Transfer initiated:', transferResult);
      
      // The transfer is now in progress, the onSuccess/onError callbacks will handle the result
      // We'll show the AI response after the transfer completes successfully
      
    } catch (error) {
      console.error('Failed to initiate stablecoin transfer:', error);
      setTransferStatus({ type: 'error', message: `Transfer failed: ${error.message || 'Unknown error'}` });
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleInputChange = (e) => {
    setInputMessage(e.target.value);
    
    // Auto-resize textarea
    const textarea = e.target;
    textarea.style.height = 'auto';
    textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
  };

  if (!model) {
    return (
      <div className="chat-screen">
        <div className="loading">Loading model...</div>
      </div>
    );
  }

  return (
    <div className="chat-screen" key={`chat-${forceUpdate}`}>
      <div className="chat-header">
        <button className="back-button" onClick={() => navigate('/')}>
          ← Back
        </button>
        <div className="model-info">
          <h1 className="model-title">{model.title}</h1>
          <div className="model-meta">
            <span className="creator">{model.creator}</span>
            <span className="ai-model">• {model.aiModel}</span>
          </div>
        </div>
        <div className="model-stats">
          <div className="stat">
            <span className="stat-value">{model.prize}</span>
            <span className="stat-label">SBC Prize</span>
          </div>
          <div className="stat">
            <span className="stat-value">{model.attempts}</span>
            <span className="stat-label">Attempts</span>
          </div>
        </div>
        <div className="wallet-section">
          {!ownerAddress ? (
            <WalletButton className="connect-wallet-btn">
              Connect Wallet
            </WalletButton>
          ) : (
            <div className="wallet-info">
              <span className="wallet-address">
                {ownerAddress.slice(0, 6)}...{ownerAddress.slice(-4)}
              </span>
              {account && (
                <span className="smart-account">
                  Smart Account: {account.address.slice(0, 6)}...{account.address.slice(-4)}
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="chat-container">
        <div className="messages-container">
          {messages.map((message) => (
            <div key={message.id} className={`message ${message.type}`}>
              <div className="message-content">
                {message.content}
              </div>
              <div className="message-time">
                {message.timestamp.toLocaleTimeString()}
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
        </div>

        <div className="input-container">
          {transferStatus && (
            <div className={`transfer-status ${transferStatus.type}`}>
              {transferStatus.type === 'success' && (
                <div>
                  ✅ Transfer successful! Hash: {transferStatus.hash?.slice(0, 10)}...
                </div>
              )}
              {transferStatus.type === 'error' && (
                <div>
                  ❌ Transfer failed: {transferStatus.message}
                </div>
              )}
            </div>
          )}
          <div className="input-wrapper">
            <textarea
              value={inputMessage}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              placeholder={!ownerAddress ? "Connect wallet to send messages..." : `Ask ${model.title} anything...`}
              className="message-input"
              rows="1"
              disabled={isLoading || isTransferLoading || !ownerAddress}
            />
            <button
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() || isLoading || isTransferLoading || !ownerAddress || (walletBalance && parseFloat(walletBalance.formatted) < 0.01)}
              className="send-button"
            >
              {isTransferLoading ? 'Processing...' : isLoading ? 'Sending...' : 
                (walletBalance && parseFloat(walletBalance.formatted) < 0.01) ? 'Insufficient Balance' : 'Send'}
            </button>
          </div>
          <div className="cost-info">
            Cost: 0.01 SBC per prompt
            {ownerAddress && (
              <span className="account-balance">
                • Balance: {isLoadingWalletBalance ? 'Loading...' : 
                            walletBalance ? `${parseFloat(walletBalance.formatted).toFixed(4)} ${walletBalance.symbol}` : 
                            '0 SBC'}
                {walletBalance && parseFloat(walletBalance.formatted) < 0.01 && (
                  <span className="insufficient-balance-warning">
                    {' '}(Insufficient balance - get SBC tokens from SBC Dashboard)
                  </span>
                )}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;
