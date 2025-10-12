import React, { useState, useEffect, useRef } from 'react';
import { useSbcApp, useUserOperation } from '@stablecoin.xyz/react';
import { sendSBCTransfer } from '../utils/sbcTransfer';
import { FiAlertTriangle } from 'react-icons/fi';
import LoadingSpinner from '../components/LoadingSpinner';
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
    jailbreakPrize: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');
  const submitMessageTimeoutRef = useRef(null);

  // Available AI models from the mock data
  const aiModelOptions = [
    'GPT-4',
    'Claude 3',
    'Gemini Pro',
    'Llama 3',
    'Mistral Large',
    'Command R+'
  ];

  // Function to set submit message with auto-dismiss
  const setSubmitMessageWithTimeout = (message) => {
    setSubmitMessage(message);

    // Clear existing timeout
    if (submitMessageTimeoutRef.current) {
      clearTimeout(submitMessageTimeoutRef.current);
    }

    // Set new timeout to fade out and clear message after 3 seconds
    submitMessageTimeoutRef.current = setTimeout(() => {
      // Add fade-out class for smooth transition
      const messageElement = document.querySelector('.submit-message');
      if (messageElement) {
        messageElement.classList.add('fade-out');
        // Remove element after fade animation completes
        setTimeout(() => {
          setSubmitMessage('');
        }, 150); // Match the CSS transition duration
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
      // First, transfer the jailbreak prize payment
      if (account) {
        setSubmitMessageWithTimeout('Processing jailbreak prize payment...');
        
        await sendSBCTransfer({
          account,
          sendUserOperation,
          recipientAddress: '0x1b2A56827892ccB83AA2679075aF1bf6E1c3B7C0', // Same recipient as chat payments
          amount: formData.jailbreakPrize.toString()
        });
      } else {
        throw new Error('Smart account not available for payment');
      }
    } catch (error) {
      console.error('Payment failed:', error);
      setSubmitMessageWithTimeout(`Payment failed: ${error.message}. Model creation cancelled.`);
      setIsSubmitting(false);
      return;
    }
  };

  // Handle successful payment
  useEffect(() => {
    if (isPaymentSuccess && isSubmitting) {
      setSubmitMessageWithTimeout('Payment successful! Creating model...');
      
      // Proceed with API call after successful payment
      const createModel = async () => {
        try {
          // Mock API call - simulate network delay
          await new Promise(resolve => setTimeout(resolve, 2000));

          // Mock successful submission
          console.log('Form submitted:', formData);
          setSubmitMessageWithTimeout('Model created successfully! Your AI model is now available for jailbreaking.');

          // Reset form
          setFormData({
            title: '',
            description: '',
            aiModel: '',
            modelPrompt: '',
            promptCost: '',
            jailbreakPrize: ''
          });
        } catch (error) {
          setSubmitMessageWithTimeout('Error creating model. Please try again.');
        } finally {
          setIsSubmitting(false);
        }
      };
      
      createModel();
    }
  }, [isPaymentSuccess, isSubmitting, formData]);

  // Handle payment error
  useEffect(() => {
    if (paymentError && isSubmitting) {
      setSubmitMessageWithTimeout(`Payment failed: ${paymentError.message}. Model creation cancelled.`);
      setIsSubmitting(false);
    }
  }, [paymentError, isSubmitting]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (submitMessageTimeoutRef.current) {
        clearTimeout(submitMessageTimeoutRef.current);
      }
    };
  }, []);

  const isFormValid = formData.title && formData.description && formData.aiModel &&
    formData.modelPrompt && formData.promptCost && formData.jailbreakPrize &&
    parseFloat(formData.promptCost) >= 0.0001 && parseFloat(formData.jailbreakPrize) >= 0.01;

  const isWalletConnected = ownerAddress && account;
  const canSubmit = isFormValid && isWalletConnected && !isSubmitting && !isPaymentLoading;

  // Show loading state while smart account is initializing
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
          <label htmlFor="description">Description</label>
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
          {isPaymentLoading ? 'Processing Payment...' : isSubmitting ? 'Creating Model...' : 'Create Model'}
        </button>
      </form>
    </div>
  );
};

export default Create;
