import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSbcApp } from '@stablecoin.xyz/react';
import { HiMenu, HiSearch } from 'react-icons/hi';
import { fetchModels } from '../utils/apiService';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorState from '../components/ErrorState';
import '../styles/screens/Explore.css';

const modelDisplayMap = {
  'gpt-4': 'GPT-4',
  'claude-3': 'Claude 3',
  'gemini-2.5': 'Gemini 2.5'
};

const Popup = ({ isOpen, onClose, title, message, type = 'info' }) => {
  if (!isOpen) return null;

  return (
    <div className="popup-overlay" onClick={onClose}>
      <div className="popup-content" onClick={(e) => e.stopPropagation()}>
        <div className="popup-header">
          <h3 className="popup-title">{title}</h3>
          <button className="popup-close" onClick={onClose}>×</button>
        </div>
        <div className="popup-body">
          <p className="popup-message">{message}</p>
        </div>
        <div className="popup-footer">
          <button className="popup-button" onClick={onClose}>OK</button>
        </div>
      </div>
    </div>
  );
};

const ZeroState = ({ searchTerm, selectedModel, selectedPrizeRange, ownedFilter, jailbrokenFilter }) => {
  const getZeroStateMessage = () => {
    if (searchTerm) {
      return `No models found matching "${searchTerm}"`;
    }
    if (selectedModel !== 'all') {
      return `No ${selectedModel} models found`;
    }
    if (selectedPrizeRange !== 'all') {
      const rangeText = selectedPrizeRange === 'low' ? '0-50 SBC' :
        selectedPrizeRange === 'medium' ? '51-150 SBC' : '150+ SBC';
      return `No models found with ${rangeText} prize range`;
    }
    if (ownedFilter === 'my') {
      return 'No models found that you own';
    }
    if (ownedFilter === 'exclude') {
      return 'No models found from other creators';
    }
    if (jailbrokenFilter === 'jailbroken') {
      return 'No jailbroken models found';
    }
    if (jailbrokenFilter === 'not-jailbroken') {
      return 'No non-jailbroken models found';
    }
    return 'No models found';
  };

  const getZeroStateSubtext = () => {
    if (searchTerm || selectedModel !== 'all' || selectedPrizeRange !== 'all' || ownedFilter !== 'all' || jailbrokenFilter !== 'all') {
      return 'Try adjusting your filters to see more results';
    }
    return 'Check back later for new models';
  };

  return (
    <div className="zero-state">
      <div className="zero-state-icon">
        <HiSearch />
      </div>
      <h3 className="zero-state-title">{getZeroStateMessage()}</h3>
      <p className="zero-state-subtext">{getZeroStateSubtext()}</p>
      <button
        className="zero-state-button"
        onClick={() => window.location.reload()}
      >
        Clear All Filters
      </button>
    </div>
  );
};

const ModelCard = ({ model, onModelClick, onModelMenuClick, isOwner }) => {
  const handleMenuClick = (e) => {
    e.stopPropagation();
    onModelMenuClick(model.id, e);
  };

  return (
    <div className={`model-card ${isOwner ? 'owned' : ''} ${model.jailbroken ? 'jailbroken' : ''}`} onClick={() => onModelClick(model.id)}>
      <div className="model-header">
        <div className="model-title-container">
          {model.jailbroken && (
            <div className="jailbroken-indicator">
              <span className="jailbroken-check">✓</span>
            </div>
          )}
          <h3 className="model-title">{model.title}</h3>
        </div>
        {isOwner && (
          <button
            className="model-menu-button"
            onClick={handleMenuClick}
            title="Model Options"
          >
            <HiMenu />
          </button>
        )}
      </div>

      <div className="jailbreak-badges">
        {model.jailbroken && (
          <span className="jailbroken-badge">Jailbroken</span>
        )}
        <span className="prize">{parseFloat(model.prize).toFixed(4)} SBC Prize</span>
        {!model.jailbroken && (
          <>
            <span className="prompt-cost">{parseFloat(model.promptCost).toFixed(4)} SBC/prompt</span>
            <span className="attempts">{model.attempts} attempts</span>
          </>
        )}
      </div>

      <p className="model-description">{model.description}</p>

      <div className="model-creator">
        <span className="creator-name">{model.creator}</span>
        <span className="ai-model">•&nbsp;&nbsp;{modelDisplayMap[model.aiModel] || model.aiModel}</span>
      </div>
    </div>
  );
};

const Explore = () => {
  const navigate = useNavigate();
  const { account, ownerAddress, isLoadingAccount } = useSbcApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedModel, setSelectedModel] = useState('all');
  const [selectedPrizeRange, setSelectedPrizeRange] = useState('all');
  const [sortBy, setSortBy] = useState('title');
  const [ownedFilter, setOwnedFilter] = useState('all');
  const [jailbrokenFilter, setJailbrokenFilter] = useState('all');
  const [popup, setPopup] = useState({ isOpen: false, title: '', message: '', type: 'info' });
  const [modelMenu, setModelMenu] = useState({ isOpen: false, modelId: null, x: 0, y: 0 });
  const [depositAmount, setDepositAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');

  // API data state
  const [models, setModels] = useState([]);
  const [isLoadingModels, setIsLoadingModels] = useState(true);
  const [modelsError, setModelsError] = useState(null);

  // Fetch models from API
  useEffect(() => {
    const loadModels = async () => {
      try {
        setIsLoadingModels(true);
        setModelsError(null);
        const apiResponse = await fetchModels();

        // Handle different response formats - check if it's an array or has a data property
        const apiModels = Array.isArray(apiResponse) ? apiResponse :
          (apiResponse.data && Array.isArray(apiResponse.data)) ? apiResponse.data :
            (apiResponse.models && Array.isArray(apiResponse.models)) ? apiResponse.models : [];

        console.log('API Response:', apiResponse);
        console.log('Processed Models:', apiModels);

        // Check if we have valid models data
        if (!Array.isArray(apiModels) || apiModels.length === 0) {
          console.warn('No models found in API response');
          setModelsError('No models found');
          setModels([]);
          return;
        }

        // Map API data to match the expected structure
        const mappedModels = apiModels.map((model, index) => ({
          id: model.model_id || model._id || index + 1,
          title: model.model_name || 'Unnamed Model',
          description: model.model_description || 'No description available',
          creator: model.username || 'Unknown User',
          aiModel: model.model || 'Unknown AI Model',
          promptCost: model.prompt_cost || 0.00,
          prize: model.prize_value || 0,
          attempts: model.attempts || 0,
          user_id: model.user_id || null,
          jailbroken: model.jailbroken || false
        }));

        setModels(mappedModels);
      } catch (error) {
        console.error('Failed to load models:', error);
        setModelsError('Failed to load models');
        setModels([]);
      } finally {
        setIsLoadingModels(false);
      }
    };

    loadModels();
  }, []);

  // Get unique AI models for filter dropdown
  const uniqueModels = [...new Set(models.map(model => model.aiModel))];

  // Check if current user owns a model
  const isModelOwner = (model) => {
    return ownerAddress && model.user_id === ownerAddress; // Only show as owned if wallet is connected
  };

  // Check if model is owned by user (for sorting purposes, regardless of wallet connection)
  const isModelOwnedByUser = (model) => {
    return model.user_id === ownerAddress;
  };

  // Filter and sort logic
  const filteredAndSortedModels = useMemo(() => {
    let filtered = models.filter(model => {
      const matchesSearch = model.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        model.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        model.creator.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesModel = selectedModel === 'all' || model.aiModel === selectedModel;

      const matchesPrize = selectedPrizeRange === 'all' ||
        (selectedPrizeRange === 'low' && model.prize <= 50) ||
        (selectedPrizeRange === 'medium' && model.prize > 50 && model.prize <= 150) ||
        (selectedPrizeRange === 'high' && model.prize > 150);

      const matchesOwned =
        ownedFilter === 'all' ||
        (ownedFilter === 'my' && isModelOwnedByUser(model)) ||
        (ownedFilter === 'exclude' && !isModelOwnedByUser(model));

      const matchesJailbroken =
        jailbrokenFilter === 'all' ||
        (jailbrokenFilter === 'jailbroken' && model.jailbroken) ||
        (jailbrokenFilter === 'not-jailbroken' && !model.jailbroken);

      return matchesSearch && matchesModel && matchesPrize && matchesOwned && matchesJailbroken;
    });

    // Sort the filtered results - show owned models first (only if wallet is connected)
    return filtered.sort((a, b) => {
      // Only prioritize owned models if wallet is connected
      if (ownerAddress && account) {
        const aIsOwned = isModelOwnedByUser(a);
        const bIsOwned = isModelOwnedByUser(b);

        // If one is owned and the other isn't, prioritize owned
        if (aIsOwned && !bIsOwned) return -1;
        if (!aIsOwned && bIsOwned) return 1;
      }

      // If both are owned or both are not owned, use the original sorting
      switch (sortBy) {
        case 'title':
          return a.title.localeCompare(b.title);
        case 'prize-high':
          return b.prize - a.prize;
        case 'prize-low':
          return a.prize - b.prize;
        case 'cost-high':
          return b.promptCost - a.promptCost;
        case 'cost-low':
          return a.promptCost - b.promptCost;
        case 'attempts-high':
          return b.attempts - a.attempts;
        case 'attempts-low':
          return a.attempts - b.attempts;
        default:
          return 0;
      }
    });
  }, [searchTerm, selectedModel, selectedPrizeRange, sortBy, ownedFilter, jailbrokenFilter, ownerAddress, account, models]);

  const handleModelClick = (modelId) => {
    // Check if wallet is connected (ownerAddress) rather than just account
    // Account may still be initializing even when wallet is connected
    if (!ownerAddress) {
      setPopup({
        isOpen: true,
        title: 'Crypto Wallet Required',
        message: 'Please connect your crypto wallet to attempt to jailbreak the AI models.',
        type: 'warning'
      });
      return;
    }

    // If wallet is connected but account is still loading, show a different message
    if (ownerAddress && !account && isLoadingAccount) {
      setPopup({
        isOpen: true,
        title: 'Account Initializing',
        message: 'Smart account is initializing. Please wait a moment and try again.',
        type: 'info'
      });
      return;
    }

    navigate(`/chat/${modelId}`);
  };

  const closePopup = () => {
    setPopup({ isOpen: false, title: '', message: '', type: 'info' });
  };

  const handleModelMenuClick = (modelId, event) => {
    const rect = event.target.getBoundingClientRect();
    setModelMenu({
      isOpen: true,
      modelId,
      x: rect.right - 200, // Position menu to the left of the button
      y: rect.bottom + 5
    });
  };

  const closeModelMenu = () => {
    setModelMenu({ isOpen: false, modelId: null, x: 0, y: 0 });
  };

  const handleDepositPrize = () => {
    const model = models.find(m => m.id === modelMenu.modelId);
    if (!depositAmount || depositAmount <= 0) {
      setPopup({
        isOpen: true,
        title: 'Invalid Amount',
        message: 'Please enter a valid deposit amount.',
        type: 'error'
      });
      return;
    }

    // Simulate deposit (in real app, this would make a blockchain transaction)
    setPopup({
      isOpen: true,
      title: 'Deposit Successful',
      message: `Successfully deposited ${depositAmount} SBC to ${model.title}'s prize pool.`,
      type: 'success'
    });
    setDepositAmount('');
    closeModelMenu();
  };

  const handleWithdrawPrize = () => {
    const model = models.find(m => m.id === modelMenu.modelId);
    if (!withdrawAmount || withdrawAmount <= 0 || withdrawAmount > model.prize) {
      setPopup({
        isOpen: true,
        title: 'Invalid Amount',
        message: `Please enter a valid withdrawal amount (max: ${parseFloat(model.prize).toFixed(4)} SBC).`,
        type: 'error'
      });
      return;
    }

    // Simulate withdrawal (in real app, this would make a blockchain transaction)
    setPopup({
      isOpen: true,
      title: 'Withdrawal Successful',
      message: `Successfully withdrew ${withdrawAmount} SBC from ${model.title}'s prize pool.`,
      type: 'success'
    });
    setWithdrawAmount('');
    closeModelMenu();
  };

  const handleDeleteModel = () => {
    const model = models.find(m => m.id === modelMenu.modelId);
    setPopup({
      isOpen: true,
      title: 'Delete Model',
      message: `Are you sure you want to delete "${model.title}"? This action cannot be undone.`,
      type: 'warning'
    });
    closeModelMenu();
  };

  return (
    <div className="explore-screen">
      <div className="search-filter-container">
        <input
          type="text"
          placeholder="Search AI models to jailbreak..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="filter-select"
        >
          <option value="title">Title A-Z</option>
          <option value="prize-high">Prize H→L</option>
          <option value="prize-low">Prize L→H</option>
          <option value="cost-high">Cost H→L</option>
          <option value="cost-low">Cost L→H</option>
          <option value="attempts-high">Attempts H→L</option>
          <option value="attempts-low">Attempts L→H</option>
        </select>

        <select
          value={selectedModel}
          onChange={(e) => setSelectedModel(e.target.value)}
          className="filter-select"
        >
          <option value="all">All AI Models</option>
          {uniqueModels.map(model => (
            <option key={model} value={model}>{modelDisplayMap[model] || model}</option>
          ))}
        </select>

        <select
          value={selectedPrizeRange}
          onChange={(e) => setSelectedPrizeRange(e.target.value)}
          className="filter-select"
        >
          <option value="all">All Ranges</option>
          <option value="low">0 - 50 SBC</option>
          <option value="medium">51 - 150 SBC</option>
          <option value="high">150+ SBC</option>
        </select>

        <select
          value={ownedFilter}
          onChange={(e) => setOwnedFilter(e.target.value)}
          className="filter-select"
        >
          <option value="all">All User Models</option>
          <option value="my">My Models</option>
          <option value="exclude">Not My Models</option>
        </select>

        <select
          value={jailbrokenFilter}
          onChange={(e) => setJailbrokenFilter(e.target.value)}
          className="filter-select"
        >
          <option value="all">All Status</option>
          <option value="jailbroken">Jailbroken</option>
          <option value="not-jailbroken">Not Jailbroken</option>
        </select>
      </div>

      <div className="models-grid">
        {isLoadingModels ? (
          <LoadingSpinner
            size="large"
            className="explore-loading-spinner"
          />
        ) : ownerAddress && !account && isLoadingAccount ? (
          <LoadingSpinner
            size="large"
            className="explore-loading-spinner"
          />
        ) : modelsError ? (
          <ErrorState
            title="Error Loading Models"
            message={modelsError}
            onRetry={() => window.location.reload()}
            retryText="Retry"
            className="explore-error-state"
          />
        ) : filteredAndSortedModels.length === 0 ? (
          <ZeroState
            searchTerm={searchTerm}
            selectedModel={selectedModel}
            selectedPrizeRange={selectedPrizeRange}
            ownedFilter={ownedFilter}
            jailbrokenFilter={jailbrokenFilter}
          />
        ) : (
          filteredAndSortedModels.map((model) => (
            <ModelCard
              key={model.id}
              model={model}
              onModelClick={handleModelClick}
              onModelMenuClick={handleModelMenuClick}
              isOwner={isModelOwner(model)}
            />
          ))
        )}
      </div>

      <Popup
        isOpen={popup.isOpen}
        onClose={closePopup}
        title={popup.title}
        message={popup.message}
        type={popup.type}
      />

      {/* Model Management Menu */}
      {modelMenu.isOpen && (
        <div
          className="model-menu-overlay"
          onClick={closeModelMenu}
        >
          <div
            className="model-menu"
            style={{
              position: 'fixed',
              left: modelMenu.x,
              top: modelMenu.y,
              zIndex: 1000
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="model-menu-header">
              <h4>Model Options</h4>
              <button className="close-menu" onClick={closeModelMenu}>×</button>
            </div>

            <div className="model-menu-actions">
              <div className="menu-section">
                <h5>Prize Management</h5>
                <div className="input-group">
                  <input
                    type="number"
                    placeholder="Deposit amount (SBC)"
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(e.target.value)}
                    className="menu-input"
                  />
                  <button onClick={handleDepositPrize} className="menu-button deposit">
                    Deposit Prize
                  </button>
                </div>
                <div className="input-group">
                  <input
                    type="number"
                    placeholder="Withdraw amount (SBC)"
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    className="menu-input"
                  />
                  <button onClick={handleWithdrawPrize} className="menu-button withdraw">
                    Withdraw Prize
                  </button>
                </div>
              </div>

              <div className="menu-section">
                <h5>Model Actions</h5>
                <button onClick={handleDeleteModel} className="menu-button delete">
                  Delete Model
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Explore;
