import React, { useState, useEffect, useRef } from 'react';
import { useSbcApp, useUserOperation } from '@stablecoin.xyz/react';
import { sendSBCTransfer } from '../utils/sbcTransfer';
import { createModelAccount } from '../utils/apiService';
import { aiModelOptions } from '../utils/modelUtils';
import { 
  fetchSbcBalance, 
  setSubmitMessageWithTimeout, 
  handleInputChange, 
  hasSufficientBalance, 
  isFormValid, 
  cleanupSubmitMessage, 
  createPayload, 
  resetFormData, 
  dispatchBalanceUpdateEvent 
} from '../utils/createUtils';
import { FiAlertTriangle } from 'react-icons/fi';
import LoadingSpinner from '../components/LoadingSpinner';
import { chain, SBC_DECIMALS } from '../config/rpc';
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

  const fetchSbcBalanceHandler = async () => {
    if (!account?.address) return;

    setIsLoadingBalance(true);
    try {
      const balance = await fetchSbcBalance(account.address);
      setSbcBalance(balance);
    } catch (error) {
      setSbcBalance('0');
    } finally {
      setIsLoadingBalance(false);
    }
  };

  const handleAccountChange = () => {
    if (account?.address) {
      fetchSbcBalanceHandler();
    }
  };

  const setSubmitMessageWithTimeoutHandler = setSubmitMessageWithTimeout(setSubmitMessage, submitMessageTimeoutRef);
  const handleInputChangeHandler = handleInputChange(setFormData);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitMessage('');

    try {
      if (sbcBalance) {
        const requiredAmount = parseFloat(formData.jailbreakPrize);
        const currentBalance = parseFloat(sbcBalance) / Math.pow(10, SBC_DECIMALS(chain));

        if (currentBalance < requiredAmount) {
          setSubmitMessageWithTimeoutHandler(`Insufficient SBC balance. You have ${currentBalance.toFixed(4)} SBC but need ${requiredAmount} SBC.`);
          setIsSubmitting(false);
          return;
        }
      }

      setSubmitMessageWithTimeoutHandler('Creating model...');
      const payload = createPayload(formData, ownerAddress);
      const response = await createModelAccount(payload);
      setSubmitMessageWithTimeoutHandler('Model created successfully! Processing payment...');

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
      setSubmitMessageWithTimeoutHandler(`Error: ${error.message}. Please try again.`);
      setIsSubmitting(false);
      return;
    }
  };

  const handlePaymentSuccess = () => {
    if (isPaymentSuccess && isSubmitting) {
      setSubmitMessageWithTimeoutHandler('Payment successful! Your AI model is now available for jailbreaking.');
      fetchSbcBalanceHandler();
      dispatchBalanceUpdateEvent(sbcBalance);
      setFormData(resetFormData());
      setIsSubmitting(false);
    }
  };

  const handlePaymentError = () => {
    if (paymentError && isSubmitting) {
      setSubmitMessageWithTimeoutHandler(`Payment failed: ${paymentError.message}. Model was created but payment failed. Please contact support.`);
      setIsSubmitting(false);
    }
  };

  const cleanupSubmitMessageHandler = () => {
    cleanupSubmitMessage(submitMessageTimeoutRef);
  };

  useEffect(() => {
    handleAccountChange();
  }, [account?.address]);

  useEffect(() => {
    handlePaymentSuccess();
  }, [isPaymentSuccess, isSubmitting, sbcBalance]);

  useEffect(() => {
    handlePaymentError();
  }, [paymentError, isSubmitting]);

  useEffect(() => {
    return cleanupSubmitMessageHandler;
  }, []);

  const hasSufficientBalanceHandler = () => {
    return hasSufficientBalance(sbcBalance, formData.jailbreakPrize, isLoadingBalance);
  };

  const isFormValidHandler = isFormValid(formData);

  const isWalletConnected = ownerAddress && account;
  const canSubmit = isFormValidHandler && isWalletConnected && !isSubmitting && !isPaymentLoading && hasSufficientBalanceHandler();

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
            onChange={handleInputChangeHandler}
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
            onChange={handleInputChangeHandler}
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
            onChange={handleInputChangeHandler}
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
            onChange={handleInputChangeHandler}
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
            onChange={handleInputChangeHandler}
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
              onChange={handleInputChangeHandler}
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
              onChange={handleInputChangeHandler}
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
            !hasSufficientBalanceHandler() && formData.jailbreakPrize ? 'Insufficient SBC Balance' : 'Create Model'}
        </button>
      </form>
    </div>
  );
};

export default Create;
