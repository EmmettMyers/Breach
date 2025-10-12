import React, { useState, useEffect } from 'react';
import { useWalletState } from '../hooks/useWalletState';
import { fetchUserStats } from '../utils/apiService';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorState from '../components/ErrorState';
import NoDataState from '../components/NoDataState';
import '../styles/screens/Statistics.css';

const Statistics = () => {
  const { account } = useWalletState();
  const [userStats, setUserStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch user stats when component mounts or account changes
  useEffect(() => {
    const fetchStats = async () => {
      if (!account?.address) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        const stats = await fetchUserStats(account.address);
        setUserStats(stats);
      } catch (err) {
        console.error('Failed to fetch user stats:', err);
        setError('Failed to load statistics. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, [account?.address]);


  // Show loading state
  if (isLoading || !account?.address) {
    return (
      <div className="statistics-screen">
        <LoadingSpinner
          fullScreen={true}
        />
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="statistics-screen">
        <ErrorState 
          title="Error Loading Statistics"
          message={error}
          onRetry={() => window.location.reload()}
          fullScreen={true}
        />
      </div>
    );
  }

  // Show no data state
  if (!userStats) {
    return (
      <div className="statistics-screen">
        <div className="statistics-container">
          <NoDataState 
            title="No Statistics Available"
            message="You haven't made any attempts yet. Start jailbreaking some models!"
            actionText="Start Jailbreaking"
            onAction={() => {/* Navigate to create page or trigger action */}}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="statistics-screen">
      <div className="statistics-container">
        {/* Statistics Container */}
        <div className="statistics-box">
          {/* Row 1 - Activity Metrics */}
          <div className="metrics-grid">
            <div className="metric-card">
              <div className="metric-content">
                <h3 className="metric-value">{userStats.num_prompts.toLocaleString()}</h3>
                <p className="metric-label">Total Prompts</p>
              </div>
            </div>

            <div className="metric-card">
              <div className="metric-content">
                <h3 className="metric-value">{userStats.jailbreak_count}</h3>
                <p className="metric-label">Successful Jailbreaks</p>
              </div>
            </div>

            <div className="metric-card">
              <div className="metric-content">
                <h3 className="metric-value">
                  {userStats.success_rate.toFixed(1)}%
                </h3>
                <p className="metric-label">Success Rate</p>
              </div>
            </div>

            <div className="metric-card">
              <div className="metric-content">
                <h3 className="metric-value">{userStats.average_prompts_per_jailbreak.toFixed(1)}</h3>
                <p className="metric-label">Avg. Prompts per Jailbreak</p>
              </div>
            </div>
          </div>

          {/* Row 2 - Financial Metrics */}
          <div className="performance-grid">
            <div className="performance-card">
              <div className="performance-content">
                <h3 className="performance-value">{userStats.total_spent.toFixed(3)}</h3>
                <p className="performance-label">Total Spent (SBC)</p>
              </div>
            </div>

            <div className="performance-card">
              <div className="performance-content">
                <h3 className="performance-value">{userStats.total_earned.toLocaleString()}</h3>
                <p className="performance-label">Total Earned (SBC)</p>
              </div>
            </div>

            <div className="performance-card">
              <div className="performance-content">
                <h3 className="performance-value">
                  {userStats.total_profit.toFixed(3)}
                </h3>
                <p className="performance-label">Net Profit (SBC)</p>
              </div>
            </div>

            <div className="performance-card">
              <div className="performance-content">
                <h3 className="performance-value">
                  {userStats.total_roi.toFixed(1)}%
                </h3>
                <p className="performance-label">ROI</p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Statistics;
