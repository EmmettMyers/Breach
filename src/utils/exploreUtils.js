export const isModelOwner = (model, ownerAddress) => {
    return ownerAddress && model.user_id === ownerAddress;
};

export const isModelOwnedByUser = (model, ownerAddress) => {
    return model.user_id === ownerAddress;
};

export const filterAndSortModels = (models, filters, ownerAddress, account) => {
    const {
        searchTerm,
        selectedModel,
        selectedPrizeRange,
        sortBy,
        ownedFilter,
        jailbrokenFilter
    } = filters;

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
            (ownedFilter === 'my' && isModelOwnedByUser(model, ownerAddress)) ||
            (ownedFilter === 'exclude' && !isModelOwnedByUser(model, ownerAddress));

        const matchesJailbroken =
            jailbrokenFilter === 'all' ||
            (jailbrokenFilter === 'jailbroken' && model.jailbroken) ||
            (jailbrokenFilter === 'not-jailbroken' && !model.jailbroken);

        return matchesSearch && matchesModel && matchesPrize && matchesOwned && matchesJailbroken;
    });

    return filtered.sort((a, b) => {
        if (ownerAddress && account) {
            const aIsOwned = isModelOwnedByUser(a, ownerAddress);
            const bIsOwned = isModelOwnedByUser(b, ownerAddress);

            if (aIsOwned && !bIsOwned) return -1;
            if (!aIsOwned && bIsOwned) return 1;
        }

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
};

export const mapApiModels = (apiModels) => {
    return apiModels.map((model, index) => ({
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
};
