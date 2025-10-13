export const modelDisplayMap = {
    'gpt-4': 'GPT-4',
    'claude-3': 'Claude 3',
    'gemini-2.5': 'Gemini 2.5'
};

export const aiModelOptions = [
    'GPT-4',
    'Claude 3',
    'Gemini 2.5'
];

export const getModelDisplayName = (model) => {
    return modelDisplayMap[model] || model;
};
