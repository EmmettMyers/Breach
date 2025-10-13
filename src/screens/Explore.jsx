import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSbcApp } from '@stablecoin.xyz/react';
import { fetchModels } from '../utils/apiService';
import { filterAndSortModels, mapApiModels, isModelOwner } from '../utils/exploreUtils';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorState from '../components/ErrorState';
import Popup from '../components/explore/Popup';
import ZeroState from '../components/explore/ZeroState';
import ModelCard from '../components/explore/ModelCard';
import ModelMenu from '../components/explore/ModelMenu';
import SearchFilters from '../components/explore/SearchFilters';
import '../styles/screens/Explore.css';

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

  const [models, setModels] = useState([]);
  const [isLoadingModels, setIsLoadingModels] = useState(true);
  const [modelsError, setModelsError] = useState(null);

  const loadModels = async () => {
    try {
      setIsLoadingModels(true);
      setModelsError(null);
      const apiResponse = await fetchModels();

      const apiModels = Array.isArray(apiResponse) ? apiResponse :
        (apiResponse.data && Array.isArray(apiResponse.data)) ? apiResponse.data :
          (apiResponse.models && Array.isArray(apiResponse.models)) ? apiResponse.models : [];

      if (!Array.isArray(apiModels) || apiModels.length === 0) {
        setModelsError('No models found');
        setModels([]);
        return;
      }

      const mappedModels = mapApiModels(apiModels);
      setModels(mappedModels);
    } catch (error) {
      setModelsError('Failed to load models');
      setModels([]);
    } finally {
      setIsLoadingModels(false);
    }
  };

  useEffect(() => {
    loadModels();
  }, []);

  const uniqueModels = [...new Set(models.map(model => model.aiModel))];

  const filteredAndSortedModels = useMemo(() => {
    const filters = {
      searchTerm,
      selectedModel,
      selectedPrizeRange,
      sortBy,
      ownedFilter,
      jailbrokenFilter
    };

    return filterAndSortModels(models, filters, ownerAddress, account);
  }, [searchTerm, selectedModel, selectedPrizeRange, sortBy, ownedFilter, jailbrokenFilter, ownerAddress, account, models]);

  const handleModelClick = (modelId) => {
    if (!ownerAddress) {
      setPopup({
        isOpen: true,
        title: 'Crypto Wallet Required',
        message: 'Please connect your crypto wallet to attempt to jailbreak the AI models.',
        type: 'warning'
      });
      return;
    }

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
      x: rect.right - 200,
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
      <SearchFilters
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        sortBy={sortBy}
        setSortBy={setSortBy}
        selectedModel={selectedModel}
        setSelectedModel={setSelectedModel}
        selectedPrizeRange={selectedPrizeRange}
        setSelectedPrizeRange={setSelectedPrizeRange}
        ownedFilter={ownedFilter}
        setOwnedFilter={setOwnedFilter}
        jailbrokenFilter={jailbrokenFilter}
        setJailbrokenFilter={setJailbrokenFilter}
        uniqueModels={uniqueModels}
      />

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
              isOwner={isModelOwner(model, ownerAddress)}
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

      <ModelMenu
        isOpen={modelMenu.isOpen}
        onClose={closeModelMenu}
        modelMenu={modelMenu}
        depositAmount={depositAmount}
        setDepositAmount={setDepositAmount}
        withdrawAmount={withdrawAmount}
        setWithdrawAmount={setWithdrawAmount}
        onDepositPrize={handleDepositPrize}
        onWithdrawPrize={handleWithdrawPrize}
        onDeleteModel={handleDeleteModel}
      />
    </div>
  );
};

export default Explore;
