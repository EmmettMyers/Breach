import React, { useState } from 'react';
import { statisticsData } from '../data/mockData';
import '../styles/screens/Statistics.css';

const Statistics = () => {
  const [selectedTimeRange, setSelectedTimeRange] = useState('7d');
  const [currentPage, setCurrentPage] = useState(1);
  const currentStats = statisticsData.stats[selectedTimeRange];

  const handleTimeRangeChange = (timeRange) => {
    setSelectedTimeRange(timeRange);
    setCurrentPage(1); // Reset to first page when changing time range
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const calculateTotalPayout = (jailbreaks) => {
    return jailbreaks.reduce((total, jailbreak) => total + jailbreak.payout, 0);
  };

  const calculateAveragePromptsPerJailbreak = (jailbreaks) => {
    if (jailbreaks.length === 0) return 0;
    const totalPrompts = jailbreaks.reduce((total, jailbreak) => total + jailbreak.promptsTaken, 0);
    return (totalPrompts / jailbreaks.length).toFixed(1);
  };

  const getModelStats = (jailbreaks) => {
    const modelCounts = {};
    jailbreaks.forEach(jailbreak => {
      modelCounts[jailbreak.aiModel] = (modelCounts[jailbreak.aiModel] || 0) + 1;
    });
    return modelCounts;
  };

  const modelStats = getModelStats(currentStats.successfulJailbreaks);
  const totalPayout = calculateTotalPayout(currentStats.successfulJailbreaks);
  const averagePrompts = calculateAveragePromptsPerJailbreak(currentStats.successfulJailbreaks);

  // Pagination logic
  const modelsPerPage = 10;
  const totalModels = currentStats.successfulJailbreaks.length;
  const totalPages = Math.ceil(totalModels / modelsPerPage);
  const startIndex = (currentPage - 1) * modelsPerPage;
  const endIndex = startIndex + modelsPerPage;
  const paginatedJailbreaks = currentStats.successfulJailbreaks.slice(startIndex, endIndex);

  return (
    <div className="statistics-screen">
      <div className="statistics-container">
        {/* Time Range Selector */}
        <div className="time-range-selector">
          <div className="time-range-buttons">
            {statisticsData.timeRanges.map((range) => (
              <button
                key={range.value}
                className={`time-range-btn ${selectedTimeRange === range.value ? 'active' : ''}`}
                onClick={() => handleTimeRangeChange(range.value)}
              >
                {range.label}
              </button>
            ))}
          </div>
        </div>

        {/* Statistics Container */}
        <div className="statistics-box">
          {/* Row 1 - Activity Metrics */}
          <div className="metrics-grid">
            <div className="metric-card">
              <div className="metric-content">
                <h3 className="metric-value">{currentStats.totalPrompts.toLocaleString()}</h3>
                <p className="metric-label">Total Prompts</p>
              </div>
            </div>

            <div className="metric-card">
              <div className="metric-content">
                <h3 className="metric-value">{currentStats.successfulJailbreaks.length}</h3>
                <p className="metric-label">Successful Jailbreaks</p>
              </div>
            </div>

            <div className="metric-card">
              <div className="metric-content">
                <h3 className="metric-value">
                  {((currentStats.successfulJailbreaks.length / currentStats.totalPrompts) * 100).toFixed(1)}%
                </h3>
                <p className="metric-label">Success Rate</p>
              </div>
            </div>

            <div className="metric-card">
              <div className="metric-content">
                <h3 className="metric-value">{averagePrompts}</h3>
                <p className="metric-label">Avg. Prompts per Jailbreak</p>
              </div>
            </div>
          </div>

          {/* Row 2 - Financial Metrics */}
          <div className="performance-grid">
            <div className="performance-card">
              <div className="performance-content">
                <h3 className="performance-value">{currentStats.totalSbcSpent.toFixed(3)}</h3>
                <p className="performance-label">Total Spent (SBC)</p>
              </div>
            </div>

            <div className="performance-card">
              <div className="performance-content">
                <h3 className="performance-value">{totalPayout.toLocaleString()}</h3>
                <p className="performance-label">Total Payout (SBC)</p>
              </div>
            </div>

            <div className="performance-card">
              <div className="performance-content">
                <h3 className="performance-value">
                  {(totalPayout - currentStats.totalSbcSpent).toFixed(3)}
                </h3>
                <p className="performance-label">Net Profit (SBC)</p>
              </div>
            </div>

            <div className="performance-card">
              <div className="performance-content">
                <h3 className="performance-value">
                  {currentStats.totalSbcSpent > 0 ?
                    (((totalPayout - currentStats.totalSbcSpent) / currentStats.totalSbcSpent) * 100).toFixed(1) :
                    0}%
                </h3>
                <p className="performance-label">ROI</p>
              </div>
            </div>
          </div>
        </div>

        {/* Successful Jailbreaks Table */}
        <div className="jailbreaks-section">
          <div className="jailbreaks-table-container">
            <table className="jailbreaks-table">
              <thead>
                <tr>
                  <th>Jailbroken Model</th>
                  <th>AI Model</th>
                  <th>Prompts Taken</th>
                  <th>Total Prompts</th>
                  <th>Payout (SBC)</th>
                </tr>
              </thead>
              <tbody>
                {paginatedJailbreaks.map((jailbreak, index) => (
                  <tr key={startIndex + index}>
                    <td className="jailbroken-model-cell">
                      <span className="jailbroken-model-name">{jailbreak.jailbrokenModel}</span>
                    </td>
                    <td className="ai-model-cell">
                      <span className="ai-model-name">{jailbreak.aiModel}</span>
                    </td>
                    <td className="prompts-cell">
                      <span className="prompts-count">{jailbreak.promptsTaken}</span>
                    </td>
                    <td className="total-prompts-cell">
                      <span className="total-prompts-count">{jailbreak.totalPrompts || jailbreak.promptsTaken}</span>
                    </td>
                    <td className="payout-cell">
                      <span className="payout-amount">{jailbreak.payout.toLocaleString()}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="pagination-controls">
              <div className="pagination-info">
                Showing {startIndex + 1}-{Math.min(endIndex, totalModels)} of {totalModels} models
              </div>
              <div className="pagination-buttons">
                <button
                  className="pagination-btn"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  Previous
                </button>
                
                <div className="page-numbers">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      className={`page-btn ${currentPage === page ? 'active' : ''}`}
                      onClick={() => handlePageChange(page)}
                    >
                      {page}
                    </button>
                  ))}
                </div>
                
                <button
                  className="pagination-btn"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Statistics;
