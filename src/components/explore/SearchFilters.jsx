import React from 'react';
import { modelDisplayMap } from '../../utils/modelUtils';

const SearchFilters = ({
    searchTerm,
    setSearchTerm,
    sortBy,
    setSortBy,
    selectedModel,
    setSelectedModel,
    selectedPrizeRange,
    setSelectedPrizeRange,
    ownedFilter,
    setOwnedFilter,
    jailbrokenFilter,
    setJailbrokenFilter,
    uniqueModels
}) => {
    return (
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
    );
};

export default SearchFilters;
