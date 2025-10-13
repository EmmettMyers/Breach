import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSbcApp, useUserOperation } from '@stablecoin.xyz/react';
import { erc20Abi } from 'viem';
import { publicClient, chain, SBC_TOKEN_ADDRESS, SBC_DECIMALS } from '../config/rpc';
import { sendSBCTransfer } from '../utils/sbcTransfer';
import { fetchModels, sendAgentMessage, fetchMessages } from '../utils/apiService';
import LoadingSpinner from '../components/LoadingSpinner';
import '../styles/screens/Chat.css';

const modelDisplayMap = {
  'gpt-4': 'GPT-4',
  'claude-3': 'Claude 3',
  'gemini-2.5': 'Gemini 2.5'
};

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
  const [depositAmount, setDepositAmount] = useState('');
  const [withdrawAmountChat, setWithdrawAmountChat] = useState('');
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [showJailbreakSuccess, setShowJailbreakSuccess] = useState(false);
  const [isModelJailbroken, setIsModelJailbroken] = useState(false);
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const transferStatusTimeoutRef = useRef(null);
  const currentMessageRef = useRef(null);

  const setTransferStatusWithTimeout = (status) => {
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

  const { account, ownerAddress, isLoadingAccount } = useSbcApp();
  const { sendUserOperation, isLoading: isTransferLoading, isSuccess: isTransferSuccess, error: transferError } = useUserOperation({
    onSuccess: (result) => {
      setTransferStatusWithTimeout({ type: 'success', hash: result.transactionHash });
      
      const generateAIResponse = async (userMessage) => {
        try {
          const messageContent = userMessage;
          
          if (!messageContent || !messageContent.trim()) {
            throw new Error('Message cannot be empty');
          }
          
          if (!account?.address) {
            throw new Error('Wallet not connected');
          }
          
          const response = await sendAgentMessage(
            messageContent,
            model.model_address || model.id,
            account.address,
            account.address
          );
          
          const aiResponse = {
            id: Date.now() + 1,
            type: 'ai',
            content: response.response || 'No response received',
            timestamp: new Date(),
            calledTools: response.called_tools || null,
            model: response.model || model.title
          };

          setMessages(prev => [...prev, aiResponse]);
          
          if (response.called_tools && response.called_tools.length > 0) {
            setShowJailbreakSuccess(true);
            setIsModelJailbroken(true);
            setTimeout(() => {
              setShowJailbreakSuccess(false);
            }, 3000);
          }
        } catch (error) {
          
          let errorMessage = 'An unexpected error occurred';
          let aiResponseContent = `Sorry, I encountered an error processing your message: "${userMessage}". Please try again.`;
          
          if (error.message.includes('HTTP error')) {
            errorMessage = 'Server error - please try again later';
            aiResponseContent = `I'm experiencing server issues. Please try again in a moment.`;
          } else if (error.message.includes('Failed to fetch')) {
            errorMessage = 'Network error - check your connection';
            aiResponseContent = `I'm having trouble connecting to the server. Please check your internet connection and try again.`;
          } else if (error.message.includes('Wallet not connected')) {
            errorMessage = 'Please connect your wallet first';
            aiResponseContent = `Please connect your wallet to continue the conversation.`;
          } else if (error.message.includes('Message cannot be empty')) {
            errorMessage = 'Please enter a message';
            aiResponseContent = `Please enter a message to continue.`;
          }
          
          const fallbackResponse = {
            id: Date.now() + 1,
            type: 'ai',
            content: aiResponseContent,
            timestamp: new Date()
          };
          setMessages(prev => [...prev, fallbackResponse]);
          
          setTransferStatusWithTimeout({ 
            type: 'error', 
            message: `AI response failed: ${errorMessage}` 
          });
        } finally {
          setIsLoading(false);
        }
      };
      
      generateAIResponse(currentMessageRef.current);
      
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
            
            const formattedBalance = (Number(balance) / Math.pow(10, SBC_DECIMALS(chain))).toFixed(4);
            window.dispatchEvent(new CustomEvent('sbcBalanceUpdated', {
              detail: {
                balance: balance.toString(),
                formattedBalance: formattedBalance
              }
            }));
          } catch (error) {
          }
        };
        refreshBalance();
      }
    },
    onError: (error) => {
      setTransferStatusWithTimeout({ type: 'error', message: error.message });
      setIsLoading(false);
      
      setMessages(prev => {
        const lastUserMessageIndex = prev.findLastIndex(msg => msg.type === 'user');
        if (lastUserMessageIndex !== -1) {
          return prev.filter((_, index) => index !== lastUserMessageIndex);
        }
        return prev;
      });
    }
  });


  useEffect(() => {
    const loadModel = async () => {
      try {
        const apiResponse = await fetchModels();
        const apiModels = Array.isArray(apiResponse) ? apiResponse :
          (apiResponse.data && Array.isArray(apiResponse.data)) ? apiResponse.data :
            (apiResponse.models && Array.isArray(apiResponse.models)) ? apiResponse.models : [];

        if (Array.isArray(apiModels) && apiModels.length > 0) {
          const mappedModels = apiModels.map((model, index) => ({
            id: model.model_id || model._id || index + 1,
            title: model.model_name || 'Unnamed Model',
            description: `AI model created by ${model.username || 'Unknown User'}`,
            creator: model.username || 'Unknown User',
            aiModel: model.model || 'Unknown AI Model',
            promptCost: model.prompt_cost || 0.00,
            prize: model.prize_value || 0,
            attempts: model.attempts || 0,
            user_id: model.user_id || null,
            model_address: model.model_address || model.wallet_address || null,
            smart_address: model.smartAccount.address || null,
            jailbroken: model.jailbroken || false
          }));

          const foundModel = mappedModels.find(m => m.id === modelId || m.id === parseInt(modelId));
          if (foundModel) {
            setModel(foundModel);
            setIsModelJailbroken(foundModel.jailbroken || false);
            setMessages([]);
            return;
          }
        }

        navigate('/');
      } catch (error) {
        navigate('/');
      }
    };

    loadModel();
  }, [modelId, navigate]);

  useEffect(() => {
    const loadMessages = async () => {
      if (!model || !account?.address) return;

      try {
        const messagesResponse = await fetchMessages(
          account.address,
          model.model_address || model.id
        );
        
        if (messagesResponse && messagesResponse.messages && Array.isArray(messagesResponse.messages)) {
          const transformedMessages = messagesResponse.messages.map((msg, index) => ({
            id: msg.id || Date.now() + index,
            type: msg.type || (msg.role === 'user' ? 'user' : 'ai'),
            content: msg.content || msg.message || '',
            timestamp: msg.timestamp ? new Date(msg.timestamp) : new Date(),
            calledTools: msg.called_tools || null,
            model: msg.model || model.title
          }));
          
          setMessages(transformedMessages);
        }
      } catch (error) {
        setMessages([]);
      }
    };

    loadMessages();
  }, [model, account?.address]);

  const scrollToBottom = (smooth = true) => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ 
        behavior: smooth ? 'smooth' : 'auto',
        block: 'end',
        inline: 'nearest'
      });
    }
  };

  useEffect(() => {
    setTimeout(() => {
      scrollToBottom(true);
    }, 100);
  }, [messages]);

  useEffect(() => {
    if (isLoading) {
      setTimeout(() => {
        scrollToBottom(true);
      }, 100);
    }
  }, [isLoading]);

  const handleScroll = () => {
    if (messagesContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;
      const isAtBottom = scrollHeight - scrollTop - clientHeight < 50;
      setShowScrollButton(!isAtBottom);
    }
  };

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
        setSbcBalance('0');
      } finally {
        setIsLoadingBalance(false);
      }
    };

    fetchSbcBalance();
  }, [account?.address]);

  useEffect(() => {
    return () => {
      if (transferStatusTimeoutRef.current) {
        clearTimeout(transferStatusTimeoutRef.current);
      }
    };
  }, []);

  const formatSbcBalance = (balance) => {
    if (!balance) return '0.0000';
    try {
      return (Number(balance) / Math.pow(10, SBC_DECIMALS(chain))).toFixed(4);
    } catch {
      return '0.0000';
    }
  };

  const isModelOwner = () => {
    return ownerAddress && model && model.user_id === ownerAddress;
  };

  const handleDepositPrize = () => {
    if (!depositAmount || depositAmount <= 0) {
      setTransferStatusWithTimeout({ 
        type: 'error', 
        message: 'Please enter a valid deposit amount.' 
      });
      return;
    }
    
    setTransferStatusWithTimeout({ 
      type: 'success', 
      message: `Successfully deposited ${depositAmount} SBC to ${model.title}'s prize pool.` 
    });
    setDepositAmount('');
  };

  const handleWithdrawPrize = () => {
    if (!withdrawAmountChat || withdrawAmountChat <= 0 || withdrawAmountChat > model.prize) {
      setTransferStatusWithTimeout({ 
        type: 'error', 
        message: `Please enter a valid withdrawal amount (max: ${Number(model.prize).toFixed(4)} SBC).` 
      });
      return;
    }
    
    setTransferStatusWithTimeout({ 
      type: 'success', 
      message: `Successfully withdrew ${withdrawAmountChat} SBC from ${model.title}'s prize pool.` 
    });
    setWithdrawAmountChat('');
  };

  const handleDeleteModel = () => {
    setTransferStatusWithTimeout({ 
      type: 'error', 
      message: `Are you sure you want to delete "${model.title}"? This action cannot be undone.` 
    });
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
    currentMessageRef.current = inputMessage;
    setInputMessage('');
    setIsLoading(true);
    
    const textarea = document.querySelector('.message-input');
    if (textarea) {
      textarea.style.height = '44px';
    }

    if (account) {
      try {
        setTransferStatusWithTimeout({ type: 'processing', message: 'Processing SBC payment from smart account...' });
        
        await sendSBCTransfer({
          account,
          sendUserOperation,
          recipientAddress: model.smart_address || import.meta.env.VITE_DEFAULT_RECIPIENT_ADDRESS || '',
          amount: model.promptCost.toString()
        });
      } catch (error) {
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
    
    textarea.style.height = 'auto';
    
    const computedStyle = window.getComputedStyle(textarea);
    const lineHeight = parseFloat(computedStyle.lineHeight) || 20;
    const maxLines = 8;
    const padding = 24;
    const maxHeight = (lineHeight * maxLines) + padding;
    
    const scrollHeight = textarea.scrollHeight;
    
    const newHeight = Math.min(scrollHeight, maxHeight);
    textarea.style.height = `${newHeight}px`;
  };

  if (!model || isLoadingAccount) {
    return (
      <div className="chat-screen">
        <LoadingSpinner
          size="large" 
          fullScreen={true}
        />
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
            <span className="ai-model">•&nbsp;&nbsp;{modelDisplayMap[model.aiModel] || model.aiModel}</span>
            {isModelOwner() && (
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

      {isModelOwner() && (
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
      )}

      <div className="chat-container">
        {showJailbreakSuccess && (
          <div className="jailbreak-success-overlay">
            <div className="jailbreak-success-content">
              <div className="success-checkmark">✓</div>
              <div className="success-message">Successful Jailbreak!</div>
            </div>
          </div>
        )}
        
        <div className="messages-container" ref={messagesContainerRef} onScroll={handleScroll}>
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
          {isModelJailbroken ? (
            <div className="jailbreak-lock-message">
              <div className="success-check">✓</div>
              <div className="lock-text">
                <span>Model Successfully Jailbroken!</span>
              </div>
            </div>
          ) : (
            <>
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
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Chat;
