import React from 'react';
import { HiSearch } from 'react-icons/hi';

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

export default ZeroState;
