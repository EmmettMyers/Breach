import React, { useState } from 'react';
import { useSbcApp } from '@stablecoin.xyz/react';
import '../styles/screens/Create.css';

const Create = () => {
  const { account, ownerAddress, isLoadingAccount } = useSbcApp();
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

  // Available AI models from the mock data
  const aiModelOptions = [
    'GPT-4',
    'Claude 3',
    'Gemini Pro',
    'Llama 3',
    'Mistral Large',
    'Command R+'
  ];

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
      // Mock API call - simulate network delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock successful submission
      console.log('Form submitted:', formData);
      setSubmitMessage('Model created successfully! Your AI model is now available for jailbreaking.');
      
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
      setSubmitMessage('Error creating model. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid = formData.title && formData.description && formData.aiModel && 
                     formData.modelPrompt && formData.promptCost && formData.jailbreakPrize;
  
  const isWalletConnected = ownerAddress && account;
  const canSubmit = isFormValid && isWalletConnected && !isSubmitting;

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
              placeholder="0.01"
              step="0.001"
              min="0"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="jailbreakPrize">Jailbreak Prize (SBC)</label>
            <input
              type="number"
              id="jailbreakPrize"
              name="jailbreakPrize"
              value={formData.jailbreakPrize}
              onChange={handleInputChange}
              placeholder="100"
              step="1"
              min="1"
              required
            />
          </div>
        </div>

        {!isWalletConnected && (
          <div className="wallet-warning">
            <div className="warning-icon">⚠️</div>
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
          {isSubmitting ? 'Creating Model...' : 'Create Model'}
        </button>
      </form>
    </div>
  );
};

export default Create;
