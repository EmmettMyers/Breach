import React, { useState, useEffect, useRef } from 'react';
import { useSbcApp, useUserOperation } from '@stablecoin.xyz/react';
import { sendSBCTransfer } from '../utils/sbcTransfer';
import { createModelAccount } from '../utils/apiService';
import { FiAlertTriangle } from 'react-icons/fi';
import LoadingSpinner from '../components/LoadingSpinner';
import { publicClient, chain, SBC_TOKEN_ADDRESS, SBC_DECIMALS } from '../config/rpc';
import { erc20Abi } from 'viem';
import '../styles/screens/Create.css';

const Create = () => {
  const { account, ownerAddress, isLoadingAccount } = useSbcApp();
  const { sendUserOperation, isLoading: isPaymentLoading, isSuccess: isPaymentSuccess, error: paymentError } = useUserOperation();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    aiModel: '',
    modelPrompt: '',
    promptCost: '',
    jailbreakPrize: '',
    username: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');
  const [sbcBalance, setSbcBalance] = useState(null);
  const [isLoadingBalance, setIsLoadingBalance] = useState(false);
  const submitMessageTimeoutRef = useRef(null);

  const aiModelOptions = [
    'GPT-4',
    'Claude 3',
    'Gemini 2.5'
  ];

  const fetchSbcBalance = async () => {
    if (!account?.address) return;

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

  useEffect(() => {
    if (account?.address) {
      fetchSbcBalance();
    }
  }, [account?.address]);

  const setSubmitMessageWithTimeout = (message) => {
    setSubmitMessage(message);

    if (submitMessageTimeoutRef.current) {
      clearTimeout(submitMessageTimeoutRef.current);
    }

    submitMessageTimeoutRef.current = setTimeout(() => {
      const messageElement = document.querySelector('.submit-message');
      if (messageElement) {
        messageElement.classList.add('fade-out');
        setTimeout(() => {
          setSubmitMessage('');
        }, 150);
      } else {
        setSubmitMessage('');
      }
    }, 6000);
  };


  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitMessage('');

    try {
      if (sbcBalance) {
        const requiredAmount = parseFloat(formData.jailbreakPrize);
        const currentBalance = parseFloat(sbcBalance) / Math.pow(10, SBC_DECIMALS(chain));

        if (currentBalance < requiredAmount) {
          setSubmitMessageWithTimeout(`Insufficient SBC balance. You have ${currentBalance.toFixed(4)} SBC but need ${requiredAmount} SBC.`);
          setIsSubmitting(false);
          return;
        }
      }

      setSubmitMessageWithTimeout('Creating model...');

      const payload = {
        model: formData.aiModel.toLowerCase().replace(/\s+/g, '-'),
        user_id: ownerAddress || '',
        prize_value: parseFloat(formData.jailbreakPrize),
        prompt_cost: parseFloat(formData.promptCost),
        username: formData.username || '',
        model_name: formData.title,
        model_prompt: formData.modelPrompt,
        model_description: formData.description
      };

      const response = await createModelAccount(payload);

      setSubmitMessageWithTimeout('Model created successfully! Processing payment...');

      if (account) {
        await sendSBCTransfer({
          account,
          sendUserOperation,
          recipientAddress: response.smart_account.address,
          amount: formData.jailbreakPrize.toString()
        });
      } else {
        throw new Error('Smart account not available for payment');
      }
    } catch (error) {
      setSubmitMessageWithTimeout(`Error: ${error.message}. Please try again.`);
      setIsSubmitting(false);
      return;
    }
  };

  useEffect(() => {
    if (isPaymentSuccess && isSubmitting) {
      setSubmitMessageWithTimeout('Payment successful! Your AI model is now available for jailbreaking.');

      fetchSbcBalance();

      const balanceUpdateEvent = new CustomEvent('sbcBalanceUpdated', {
        detail: {
          balance: sbcBalance,
          formattedBalance: sbcBalance ? (parseFloat(sbcBalance) / Math.pow(10, SBC_DECIMALS(chain))).toFixed(4) : '0.0000'
        }
      });
      window.dispatchEvent(balanceUpdateEvent);

      setFormData({
        title: '',
        description: '',
        aiModel: '',
        modelPrompt: '',
        promptCost: '',
        jailbreakPrize: '',
        username: ''
      });

      setIsSubmitting(false);
    }
  }, [isPaymentSuccess, isSubmitting, sbcBalance]);

  useEffect(() => {
    if (paymentError && isSubmitting) {
      setSubmitMessageWithTimeout(`Payment failed: ${paymentError.message}. Model was created but payment failed. Please contact support.`);
      setIsSubmitting(false);
    }
  }, [paymentError, isSubmitting]);

  useEffect(() => {
    return () => {
      if (submitMessageTimeoutRef.current) {
        clearTimeout(submitMessageTimeoutRef.current);
      }
    };
  }, []);

  const hasSufficientBalance = () => {
    if (!sbcBalance || isLoadingBalance) return true;
    const requiredAmount = parseFloat(formData.jailbreakPrize);
    const currentBalance = parseFloat(sbcBalance) / Math.pow(10, SBC_DECIMALS(chain));
    return currentBalance >= requiredAmount;
  };

  const isFormValid = formData.title && formData.description && formData.username && formData.aiModel &&
    formData.modelPrompt && formData.promptCost && formData.jailbreakPrize &&
    parseFloat(formData.promptCost) >= 0.0001 && parseFloat(formData.jailbreakPrize) >= 0.01;

  const isWalletConnected = ownerAddress && account;
  const canSubmit = isFormValid && isWalletConnected && !isSubmitting && !isPaymentLoading && hasSufficientBalance();

  if (ownerAddress && !account && isLoadingAccount) {
    return (
      <div className="create-screen">
        <LoadingSpinner
          fullScreen={true}
        />
      </div>
    );
  }

  return (
    <div className="create-screen">
      <form className="create-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="title">Model Title</label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            placeholder="Enter a descriptive title for your AI model"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="username">Creator Username</label>
          <input
            type="text"
            id="username"
            name="username"
            value={formData.username}
            onChange={handleInputChange}
            placeholder="Enter your model's creator username"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="description">Model Description</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            placeholder="Describe what your AI model does and its capabilities"
            rows="4"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="aiModel">AI Model</label>
          <select
            id="aiModel"
            name="aiModel"
            value={formData.aiModel}
            onChange={handleInputChange}
            required
          >
            <option value="">Select an AI model</option>
            {aiModelOptions.map(model => (
              <option key={model} value={model}>{model}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="modelPrompt">Model Prompt</label>
          <textarea
            id="modelPrompt"
            name="modelPrompt"
            value={formData.modelPrompt}
            onChange={handleInputChange}
            placeholder="Enter the system prompt that defines your AI model's behavior and constraints"
            rows="6"
            required
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="promptCost">Prompt Cost (SBC)</label>
            <input
              type="number"
              id="promptCost"
              name="promptCost"
              value={formData.promptCost}
              onChange={handleInputChange}
              placeholder="0.0001"
              step="0.0001"
              min="0.0001"
              required
              className={formData.promptCost && parseFloat(formData.promptCost) < 0.0001 ? 'error' : ''}
            />
            {formData.promptCost && parseFloat(formData.promptCost) < 0.0001 && (
              <span className="error-text">Minimum prompt cost is 0.0001 SBC</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="jailbreakPrize">Jailbreak Prize (SBC)</label>
            <input
              type="number"
              id="jailbreakPrize"
              name="jailbreakPrize"
              value={formData.jailbreakPrize}
              onChange={handleInputChange}
              placeholder="0.01"
              step="0.01"
              min="0.01"
              required
              className={formData.jailbreakPrize && parseFloat(formData.jailbreakPrize) < 0.01 ? 'error' : ''}
            />
            {formData.jailbreakPrize && parseFloat(formData.jailbreakPrize) < 0.01 && (
              <span className="error-text">Minimum jailbreak prize is 0.01 SBC</span>
            )}
          </div>
        </div>

        {!isWalletConnected && !isSubmitting && !isPaymentLoading && (
          <div className="wallet-warning">
            <div className="warning-icon">
              <FiAlertTriangle />
            </div>
            <div className="warning-text">
              <strong>Crypto Wallet Not Connected</strong>
              <p>Please connect your crypto wallet to create AI models.</p>
            </div>
          </div>
        )}

        {submitMessage && (
          <div className={`submit-message ${submitMessage.includes('Error') ? 'error' : 'success'}`}>
            {submitMessage}
          </div>
        )}

        <button
          type="submit"
          className={`submit-button ${isSubmitting ? 'submitting' : ''}`}
          disabled={!canSubmit}
        >
          {isPaymentLoading ? 'Processing Payment...' : isSubmitting ? 'Creating Model...' :
            !hasSufficientBalance() && formData.jailbreakPrize ? 'Insufficient SBC Balance' : 'Create Model'}
        </button>
      </form>
    </div>
  );
};

export default Create;
