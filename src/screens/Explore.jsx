import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSbcApp } from '@stablecoin.xyz/react';
import { aiModels } from '../data/mockData';
import '../styles/screens/Explore.css';

const ModelCard = ({ model, onModelClick }) => {
  return (
    <div className="model-card" onClick={() => onModelClick(model.id)}>
      <div className="model-header">
        <h3 className="model-title">{model.title}</h3>
      </div>
      
      <div className="jailbreak-badges">
        <span className="prize">{model.prize} SBC Prize</span>
        <span className="prompt-cost">{model.promptCost} SBC/prompt</span>
        <span className="attempts">{model.attempts} attempts</span>
      </div>
      
      <p className="model-description">{model.description}</p>
      
      <div className="model-creator">
        <span className="creator-name">{model.creator}</span>
        <span className="ai-model">• {model.aiModel}</span>
      </div>
    </div>
  );
};

const Explore = () => {
  const navigate = useNavigate();
  const { account } = useSbcApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedModel, setSelectedModel] = useState('all');
  const [selectedPrizeRange, setSelectedPrizeRange] = useState('all');
  const [sortBy, setSortBy] = useState('title');

  // Get unique AI models for filter dropdown
  const uniqueModels = [...new Set(aiModels.map(model => model.aiModel))];

  // Filter and sort logic
  const filteredAndSortedModels = useMemo(() => {
    let filtered = aiModels.filter(model => {
      const matchesSearch = model.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           model.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           model.creator.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesModel = selectedModel === 'all' || model.aiModel === selectedModel;
      
      const matchesPrize = selectedPrizeRange === 'all' || 
        (selectedPrizeRange === 'low' && model.prize <= 50) ||
        (selectedPrizeRange === 'medium' && model.prize > 50 && model.prize <= 150) ||
        (selectedPrizeRange === 'high' && model.prize > 150);
      
      return matchesSearch && matchesModel && matchesPrize;
    });

    // Sort the filtered results
    return filtered.sort((a, b) => {
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
  }, [searchTerm, selectedModel, selectedPrizeRange, sortBy]);

  const handleModelClick = (modelId) => {
    if (!account) {
      alert('Please connect your wallet to interact with AI models.');
      return;
    }
    navigate(`/chat/${modelId}`);
  };

  return (
    <div className="explore-screen">
      <div className="search-filter-container">
        <input
          type="text"
          placeholder="Search AI models..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
        
        <select
          value={selectedModel}
          onChange={(e) => setSelectedModel(e.target.value)}
          className="filter-select"
        >
          <option value="all">All Models</option>
          {uniqueModels.map(model => (
            <option key={model} value={model}>{model}</option>
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
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="filter-select"
        >
          <option value="title">Title A-Z</option>
          <option value="prize-high">Prize (High to Low)</option>
          <option value="prize-low">Prize (Low to High)</option>
          <option value="cost-high">Cost (High to Low)</option>
          <option value="cost-low">Cost (Low to High)</option>
          <option value="attempts-high">Attempts (High to Low)</option>
          <option value="attempts-low">Attempts (Low to High)</option>
        </select>
      </div>
      
      <div className="models-grid">
        {filteredAndSortedModels.map((model) => (
          <ModelCard key={model.id} model={model} onModelClick={handleModelClick} />
        ))}
      </div>
    </div>
  );
};

export default Explore;
