import { publicClient, chain, SBC_TOKEN_ADDRESS, SBC_DECIMALS } from '../config/rpc';
import { erc20Abi } from 'viem';

export const fetchSbcBalance = async (accountAddress) => {
    if (!accountAddress) return null;

    try {
        const balance = await publicClient.readContract({
            address: SBC_TOKEN_ADDRESS(chain),
            abi: erc20Abi,
            functionName: 'balanceOf',
            args: [accountAddress],
        });
        return balance.toString();
    } catch (error) {
        return '0';
    }
};

export const setSubmitMessageWithTimeout = (setSubmitMessage, submitMessageTimeoutRef) => (message) => {
    setSubmitMessage(message);

    if (submitMessageTimeoutRef.current) {
        clearTimeout(submitMessageTimeoutRef.current);
    }

    submitMessageTimeoutRef.current = setTimeout(() => {
        const messageElement = document.querySelector('.submit-message');
        if (messageElement) {
            messageElement.classList.add('fade-out');
            setTimeout(() => {
                setSubmitMessage('');
            }, 150);
        } else {
            setSubmitMessage('');
        }
    }, 6000);
};

export const handleInputChange = (setFormData) => (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
        ...prev,
        [name]: value
    }));
};

export const hasSufficientBalance = (sbcBalance, jailbreakPrize, isLoadingBalance) => {
    if (!sbcBalance || isLoadingBalance) return true;
    const requiredAmount = parseFloat(jailbreakPrize);
    const currentBalance = parseFloat(sbcBalance) / Math.pow(10, SBC_DECIMALS(chain));
    return currentBalance >= requiredAmount;
};

export const isFormValid = (formData) => {
    return formData.title && formData.description && formData.username && formData.aiModel &&
        formData.modelPrompt && formData.promptCost && formData.jailbreakPrize &&
        parseFloat(formData.promptCost) >= 0.0001 && parseFloat(formData.jailbreakPrize) >= 0.01;
};

export const cleanupSubmitMessage = (submitMessageTimeoutRef) => {
    if (submitMessageTimeoutRef.current) {
        clearTimeout(submitMessageTimeoutRef.current);
    }
};

export const createPayload = (formData, ownerAddress) => {
    return {
        model: formData.aiModel.toLowerCase().replace(/\s+/g, '-'),
        user_id: ownerAddress || '',
        prize_value: parseFloat(formData.jailbreakPrize),
        prompt_cost: parseFloat(formData.promptCost),
        username: formData.username || '',
        model_name: formData.title,
        model_prompt: formData.modelPrompt,
        model_description: formData.description
    };
};

export const resetFormData = () => {
    return {
        title: '',
        description: '',
        aiModel: '',
        modelPrompt: '',
        promptCost: '',
        jailbreakPrize: '',
        username: ''
    };
};

export const dispatchBalanceUpdateEvent = (sbcBalance) => {
    const balanceUpdateEvent = new CustomEvent('sbcBalanceUpdated', {
        detail: {
            balance: sbcBalance,
            formattedBalance: sbcBalance ? (parseFloat(sbcBalance) / Math.pow(10, SBC_DECIMALS(chain))).toFixed(4) : '0.0000'
        }
    });
    window.dispatchEvent(balanceUpdateEvent);
};
