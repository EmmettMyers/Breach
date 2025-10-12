// API service for fetching user statistics
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const fetchUserStats = async (userId) => {
  try {
    const response = await fetch(`${API_URL}/crypto/user_stats?user_id=${userId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Failed to fetch user stats:', error);
    throw error;
  }
};

export const fetchModelStats = async (userId) => {
  try {
    const response = await fetch(`${API_URL}/crypto/model_stats?user_id=${userId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Failed to fetch model stats:', error);
    throw error;
  }
};

export const createModelAccount = async (payload) => {
  try {
    const response = await fetch(`${API_URL}/crypto/create_model_account`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Failed to create model account:', error);
    throw error;
  }
};

export const fetchModels = async () => {
  try {
    const response = await fetch(`${API_URL}/crypto/models`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('API Response from /models:', data);
    return data;
  } catch (error) {
    console.error('Failed to fetch models:', error);
    throw error;
  }
};

export const sendAgentMessage = async (message, modelAddress, userId, userSmartAddress) => {
  try {
    const response = await fetch(`${API_URL}/agent`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message,
        model_address: modelAddress,
        user_id: userId,
        user_smart_address: userSmartAddress
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Failed to send agent message:', error);
    throw error;
  }
};
