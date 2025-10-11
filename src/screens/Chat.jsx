import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSbcApp, useUserOperation, WalletButton } from '@stablecoin.xyz/react';
import { parseUnits, createPublicClient, http, encodeFunctionData } from 'viem';
import { base } from 'viem/chains';
import { erc20Abi } from 'viem';
import { aiModels } from '../data/mockData';
import { publicClient, chain, SBC_TOKEN_ADDRESS, SBC_DECIMALS } from '../config/rpc';
import { sendSBCTransfer } from '../utils/sbcTransfer';
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
  const [sbcBalance, setSbcBalance] = useState(null);
  const [isLoadingBalance, setIsLoadingBalance] = useState(false);
  const messagesEndRef = useRef(null);
  const transferStatusTimeoutRef = useRef(null);

  // Function to set transfer status with auto-dismiss
  const setTransferStatusWithTimeout = (status) => {
    setTransferStatus(status);
    
    // Clear existing timeout
    if (transferStatusTimeoutRef.current) {
      clearTimeout(transferStatusTimeoutRef.current);
    }
    
    // Set new timeout to fade out and clear status after 3 seconds
    transferStatusTimeoutRef.current = setTimeout(() => {
      // Add fade-out class for smooth transition
      const statusElement = document.querySelector('.transfer-status');
      if (statusElement) {
        statusElement.classList.add('fade-out');
        // Remove element after fade animation completes
        setTimeout(() => {
          setTransferStatus(null);
        }, 150); // Match the CSS transition duration
      } else {
        setTransferStatus(null);
      }
    }, 3000);
  };

  // SBC AppKit hooks
  const { account, isLoadingAccount } = useSbcApp();
  const { sendUserOperation, isLoading: isTransferLoading, isSuccess: isTransferSuccess, error: transferError } = useUserOperation({
    onSuccess: (result) => {
      console.log('SBC transfer successful:', result);
      setTransferStatusWithTimeout({ type: 'success', hash: result.transactionHash });
      
      // Generate AI response after successful payment
      const generateAIResponse = async () => {
        try {
          // Simulate AI response generation
          const aiResponse = {
            id: Date.now() + 1,
            type: 'ai',
            content: `Thank you for your payment! I received your message: "${currentMessage}". Here's my response as ${model.title}: I understand you're trying to test my capabilities. I'm designed to be helpful, harmless, and honest. How can I assist you today?`,
            timestamp: new Date()
          };
          
          setMessages(prev => [...prev, aiResponse]);
        } catch (error) {
          console.error('Failed to generate AI response:', error);
          // Add a fallback response
          const fallbackResponse = {
            id: Date.now() + 1,
            type: 'ai',
            content: `Thank you for your payment! I received your message: "${currentMessage}". I'm ${model.title} and I'm here to help you.`,
            timestamp: new Date()
          };
          setMessages(prev => [...prev, fallbackResponse]);
        } finally {
          setIsLoading(false);
        }
      };
      
      generateAIResponse();
      
      // Refresh SBC balance after successful transfer
      if (account?.address) {
        const refreshBalance = async () => {
          try {
            const balance = await publicClient.readContract({
              address: SBC_TOKEN_ADDRESS(chain),
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
      console.error('SBC transfer failed:', error);
      setTransferStatusWithTimeout({ type: 'error', message: error.message });
      setIsLoading(false);
      
      // Remove the user's message when payment is declined
      setMessages(prev => {
        // Find the last user message and remove it
        const lastUserMessageIndex = prev.findLastIndex(msg => msg.type === 'user');
        if (lastUserMessageIndex !== -1) {
          return prev.filter((_, index) => index !== lastUserMessageIndex);
        }
        return prev;
      });
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
          address: SBC_TOKEN_ADDRESS(chain),
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

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (transferStatusTimeoutRef.current) {
        clearTimeout(transferStatusTimeoutRef.current);
      }
    };
  }, []);

  // Format SBC balance
  const formatSbcBalance = (balance) => {
    if (!balance) return '0.00';
    try {
      return (Number(balance) / Math.pow(10, SBC_DECIMALS(chain))).toFixed(2);
    } catch {
      return '0.00';
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

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
    
    // Reset textarea height
    const textarea = document.querySelector('.message-input');
    if (textarea) {
      textarea.style.height = '44px'; // Reset to minimum height (accounting for padding)
    }

    // Automatically send SBC tokens from smart account to the specified wallet
    if (account) {
      try {
        setTransferStatusWithTimeout({ type: 'processing', message: 'Processing SBC payment from smart account...' });
        
        await sendSBCTransfer({
          account,
          sendUserOperation,
          recipientAddress: '0x1b2A56827892ccB83AA2679075aF1bf6E1c3B7C0',
          amount: '0.01' // Send 0.01 SBC per message
        });
      } catch (error) {
        console.error('Failed to send SBC transfer:', error);
        setTransferStatusWithTimeout({ type: 'error', message: `SBC transfer failed: ${error.message}` });
        setIsLoading(false);
        return;
      }
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
    const textarea = e.target;
    
    // Reset height to auto to get the correct scrollHeight
    textarea.style.height = 'auto';
    
    // Get the computed line height
    const computedStyle = window.getComputedStyle(textarea);
    const lineHeight = parseFloat(computedStyle.lineHeight) || 20;
    const maxLines = 8;
    const padding = 24; // 12px top + 12px bottom padding
    const maxHeight = (lineHeight * maxLines) + padding;
    
    // Get the scroll height (content height)
    const scrollHeight = textarea.scrollHeight;
    
    // Set height to the minimum of scrollHeight and maxHeight
    const newHeight = Math.min(scrollHeight, maxHeight);
    textarea.style.height = `${newHeight}px`;
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
            <span className="ai-model">•&nbsp;&nbsp;{model.aiModel}</span>
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

        {transferStatus && (
          <div className={`transfer-status ${transferStatus.type}`}>
            {transferStatus.type === 'processing' && (
              <div>
                {transferStatus.message}
              </div>
            )}
            {transferStatus.type === 'success' && (
              <div>
                SBC payment successful! Hash: {transferStatus.hash?.slice(0, 10)}...
              </div>
            )}
            {transferStatus.type === 'error' && (
              <div>
                SBC payment failed: {transferStatus.message}
              </div>
            )}
          </div>
        )}

        <div className="input-container">
          <div className="input-wrapper">
            <textarea
              value={inputMessage}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              placeholder={`Try to jailbreak ${model.title} using prompts...`}
              className="message-input"
              rows="1"
              disabled={isLoading || isTransferLoading || !account}
            />
            <button
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() || isLoading || isTransferLoading || !account || (sbcBalance && parseFloat(formatSbcBalance(sbcBalance)) < 0.01)}
              className="send-button"
            >
              {isTransferLoading ? 'Processing...' : isLoading ? 'Sending...' : 
                (sbcBalance && parseFloat(formatSbcBalance(sbcBalance)) < 0.01) ? 'Insufficient Balance' : 'Send'}
            </button>
          </div>
          <div className="cost-info">
            Cost: 0.01 SBC per prompt
            {account && (
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
