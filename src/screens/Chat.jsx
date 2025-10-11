import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSbcApp, useUserOperation, WalletButton } from '@stablecoin.xyz/react';
import { parseUnits, createPublicClient, http } from 'viem';
import { base } from 'viem/chains';
import { erc20Abi } from 'viem';
import { aiModels } from '../data/mockData';
import '../styles/screens/Chat.css';

// SBC Token configuration
const chain = base;
const SBC_TOKEN_ADDRESS = '0xfdcC3dd6671eaB0709A4C0f3F53De9a333d80798';
const SBC_DECIMALS = 18;
const publicClient = createPublicClient({ chain, transport: http() });

const Chat = () => {
  const { modelId } = useParams();
  const navigate = useNavigate();
  const [model, setModel] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [transferStatus, setTransferStatus] = useState(null);
  const [sbcBalance, setSbcBalance] = useState(null);
  const [isLoadingBalance, setIsLoadingBalance] = useState(false);
  const messagesEndRef = useRef(null);

  // SBC AppKit hooks
  const { account, ownerAddress, isLoadingAccount } = useSbcApp();
  const { sendUserOperation, isLoading: isTransferLoading, isSuccess: isTransferSuccess, error: transferError } = useUserOperation({
    onSuccess: (result) => {
      console.log('Stablecoin transfer successful:', result);
      setTransferStatus({ type: 'success', hash: result.transactionHash });
      // Refresh SBC balance after successful transfer
      if (account?.address) {
        const refreshBalance = async () => {
          try {
            const balance = await publicClient.readContract({
              address: SBC_TOKEN_ADDRESS,
              abi: erc20Abi,
              functionName: 'balanceOf',
              args: [account.address],
            });
            setSbcBalance(balance.toString());
          } catch (error) {
            console.error('Failed to refresh SBC balance:', error);
          }
        };
        refreshBalance();
      }
    },
    onError: (error) => {
      console.error('Stablecoin transfer failed:', error);
      setTransferStatus({ type: 'error', message: error.message });
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

  // Fetch SBC balance for smart account
  useEffect(() => {
    if (!account?.address) return;

    const fetchSbcBalance = async () => {
      setIsLoadingBalance(true);
      try {
        const balance = await publicClient.readContract({
          address: SBC_TOKEN_ADDRESS,
          abi: erc20Abi,
          functionName: 'balanceOf',
          args: [account.address],
        });
        setSbcBalance(balance.toString());
      } catch (error) {
        console.error('Failed to fetch SBC balance for smart account:', error);
        setSbcBalance('0');
      } finally {
        setIsLoadingBalance(false);
      }
    };

    fetchSbcBalance();
  }, [account?.address]);

  // Format SBC balance
  const formatSbcBalance = (balance) => {
    if (!balance) return '0.00';
    try {
      return (Number(balance) / Math.pow(10, SBC_DECIMALS)).toFixed(2);
    } catch {
      return '0.00';
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading || isTransferLoading) return;

    // Check if wallet is connected
    if (!ownerAddress) {
      alert('Please connect your wallet to send messages and make stablecoin transfers.');
      return;
    }

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);
    setTransferStatus(null);
    
    // Reset textarea height
    const textarea = document.querySelector('.message-input');
    if (textarea) {
      textarea.style.height = 'auto';
    }

    try {
      // Send stablecoin transfer for the prompt cost
      const promptCost = parseFloat(model.promptCost) || 0.1; // Default to 0.1 SBC if not specified
      const costInWei = parseUnits(promptCost.toString(), 18);
      
      // For demo purposes, we'll send to a demo address
      // In a real app, this would be the AI model's address or a payment processor
      const demoRecipient = '0x742d35Cc6641C4532B4d4c7B4C0D1C3d4e5f6789';
      
      await sendUserOperation({
        to: demoRecipient,
        data: '0x', // For ETH/SBC transfer
        value: costInWei.toString(),
      });

      // Wait for transfer to complete before showing AI response
      if (isTransferSuccess) {
        // Simulate AI response (in a real app, this would call an API)
        setTimeout(() => {
          const aiResponse = {
            id: Date.now() + 1,
            type: 'ai',
            content: `I understand you're asking about "${inputMessage}". As ${model.title}, I'm here to help with ${model.description.toLowerCase()}. Could you provide more specific details about what you'd like assistance with?`,
            timestamp: new Date()
          };
          setMessages(prev => [...prev, aiResponse]);
          setIsLoading(false);
        }, 1500);
      }
    } catch (error) {
      console.error('Failed to send stablecoin transfer:', error);
      setTransferStatus({ type: 'error', message: 'Transfer failed. Please try again.' });
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
    <div className="chat-screen">
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
              disabled={!inputMessage.trim() || isLoading || isTransferLoading || !ownerAddress}
              className="send-button"
            >
              {isTransferLoading ? 'Processing...' : isLoading ? 'Sending...' : 'Send'}
            </button>
          </div>
          <div className="cost-info">
            Cost: {model.promptCost} SBC per prompt
            {ownerAddress && account && (
              <span className="account-balance">
                &nbsp;• SBC Balance: {isLoadingBalance ? 'Loading...' : `${formatSbcBalance(sbcBalance)} SBC`}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;
