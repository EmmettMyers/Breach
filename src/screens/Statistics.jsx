import React, { useState, useEffect } from 'react';
import { useWalletState } from '../hooks/useWalletState';
import { fetchUserStats, fetchModelStats } from '../utils/apiService';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorState from '../components/ErrorState';
import NoDataState from '../components/NoDataState';
import '../styles/screens/Statistics.css';

const modelDisplayMap = {
  'gpt-4': 'GPT-4',
  'claude-3': 'Claude 3',
  'gemini-2.5': 'Gemini 2.5'
};

const getModelDisplayName = (model) => {
  console.log('Model Name:', model);
  return modelDisplayMap[model] || model;
};

const Statistics = () => {
  const { account } = useWalletState();
  const [userStats, setUserStats] = useState(null);
  const [modelStats, setModelStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStats = async () => {
    if (!account?.address) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const [stats, modelData] = await Promise.all([
        fetchUserStats(account.address),
        fetchModelStats(account.address)
      ]);
      setUserStats(stats);
      setModelStats(modelData);
    } catch (err) {
      console.error('Failed to fetch statistics:', err);
      setError('Failed to load statistics. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [account?.address]);


  if (isLoading || !account?.address) {
    return (
      <div className="statistics-screen">
        <LoadingSpinner
          fullScreen={true}
        />
      </div>
    );
  }

  if (error) {
    return (
      <div className="statistics-screen">
        <ErrorState 
          title="Error Loading Statistics"
          message={error}
          onRetry={fetchStats}
          fullScreen={true}
        />
      </div>
    );
  }

  if (!userStats) {
    return (
      <div className="statistics-screen">
        <div className="statistics-container">
          <NoDataState 
            title="No Statistics Available"
            message="You haven't made any attempts yet. Start jailbreaking some models!"
            actionText="Start Jailbreaking"
            onAction={() => {}}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="statistics-screen">
      <div className="statistics-container">
        <div className="statistics-box">
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

        {modelStats && Object.keys(modelStats).length > -1 && (
          <div className="model-stats-section">
            <div className="model-stats-table-container">
              <table className="model-stats-table">
                <thead>
                  <tr>
                    <th>Jailbroken Model Name</th>
                    <th>Jailbroken Model Type</th>
                    <th>Your Prompts</th>
                    <th>Payout (SBC)</th>
                  </tr>
                </thead>
                 <tbody>
                   {Object.keys(modelStats).length > 0 ? (
                     Object.entries(modelStats).map(([modelName, stats]) => (
                       <tr key={modelName}>
                         <td className="model-name">{stats.model_name}</td>
                         <td className="model-type">{getModelDisplayName(stats.model)}</td>
                         <td className="your-prompts">{stats.your_prompts.toLocaleString()}</td>
                         <td className="payout">{stats.payout.toFixed(4)}</td>
                       </tr>
                     ))
                   ) : (
                     <tr>
                       <td colSpan="4" className="empty-table-message">
                         You haven't broken any models yet.
                       </td>
                     </tr>
                   )}
                 </tbody>
              </table>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default Statistics;
