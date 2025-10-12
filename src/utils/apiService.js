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
