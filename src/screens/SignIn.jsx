import React, { useState, useEffect, useCallback } from 'react';
import { WalletButton, WalletSelector, useSbcApp } from '@stablecoin.xyz/react';
import { useNavigate } from 'react-router-dom';
import { useWalletState } from '../hooks/useWalletState';
import '../styles/screens/SignIn.css';

const SignIn = () => {
  const navigate = useNavigate();
  const { account, ownerAddress, isLoadingAccount, isRefreshing, forceUpdate, setForceUpdate, walletBalance, isLoadingWalletBalance, fetchWalletBalance, refreshAccount } = useWalletState();
  const { disconnectWallet } = useSbcApp();
  const [showWalletSelector, setShowWalletSelector] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

  // Force re-render when connection state changes
  useEffect(() => {
    if (ownerAddress && account) {
      setIsConnecting(false);
      setForceUpdate(prev => prev + 1);
      // Optional: Auto-redirect after successful connection
      // navigate('/');
    }
  }, [ownerAddress, account, navigate]);

  // Force update when wallet connection changes
  useEffect(() => {
    setForceUpdate(prev => prev + 1);
  }, [ownerAddress]);

  // Refresh account data when component mounts or connection changes
  useEffect(() => {
    if (ownerAddress) {
      // Wait a bit for the smart account to be initialized
      const timeout = setTimeout(() => {
        refreshAccount();
      }, 1000); // 1 second delay
      
      return () => clearTimeout(timeout);
    }
  }, [ownerAddress, refreshAccount]);

  // Poll for account data if wallet is connected but no account data yet
  useEffect(() => {
    if (ownerAddress && !account && !isLoadingAccount) {
      let pollCount = 0;
      const maxPolls = 10; // Poll for maximum 20 seconds (10 * 2 seconds)
      
      const interval = setInterval(() => {
        pollCount++;
        refreshAccount();
        
        // Stop polling after max attempts
        if (pollCount >= maxPolls) {
          clearInterval(interval);
        }
      }, 2000); // Poll every 2 seconds
      
      return () => clearInterval(interval);
    }
  }, [ownerAddress, account, isLoadingAccount, refreshAccount]);

  // Reset connecting state after a timeout
  useEffect(() => {
    if (isConnecting) {
      const timeout = setTimeout(() => {
        setIsConnecting(false);
      }, 10000); // 10 second timeout

      return () => clearTimeout(timeout);
    }
  }, [isConnecting]);

  const handleDisconnect = () => {
    disconnectWallet();
    setShowWalletSelector(false);
    setIsConnecting(false);
  };

  const handleWalletConnect = useCallback(() => {
    setIsConnecting(true);
    setShowWalletSelector(false);
    // Force a refresh after a short delay
    setTimeout(() => {
      refreshAccount();
      setForceUpdate(prev => prev + 1);
    }, 2000);
  }, [refreshAccount]);

  const handleWalletSelectorConnect = useCallback(() => {
    setIsConnecting(true);
    setShowWalletSelector(false);
    // Force a refresh after a short delay
    setTimeout(() => {
      refreshAccount();
      setForceUpdate(prev => prev + 1);
    }, 2000);
  }, [refreshAccount]);

  return (
    <div className="signin-screen" key={`signin-${forceUpdate}`}>
      <div className="signin-container">
        <div className="signin-header">
          <h1>Connect Your Wallet</h1>
          <p>Sign in with your wallet to start chatting with AI models and making stablecoin payments</p>
        </div>

        {!ownerAddress && !isConnecting ? (
          <div className="wallet-connection">
            {!showWalletSelector ? (
              <div className="connection-options">
                <div className="connection-info">
                  <h3>Why connect your wallet?</h3>
                  <ul>
                    <li>Secure authentication with your crypto wallet</li>
                    <li>Make gasless stablecoin payments for AI interactions</li>
                    <li>Access to premium AI models and features</li>
                    <li>Track your usage and spending history</li>
                  </ul>
                </div>
                
                <div className="connection-buttons">
                  <WalletButton 
                    className="primary-connect-btn"
                    onConnect={handleWalletConnect}
                  >
                    Connect Wallet
                  </WalletButton>
                  
                  <button 
                    className="secondary-btn"
                    onClick={() => setShowWalletSelector(true)}
                  >
                    Choose Wallet Type
                  </button>
                </div>
              </div>
            ) : (
              <div className="wallet-selector-container">
                <div className="selector-header">
                  <h3>Select Your Wallet</h3>
                  <button 
                    className="back-btn"
                    onClick={() => setShowWalletSelector(false)}
                  >
                    ← Back
                  </button>
                </div>
                <WalletSelector
                  key={`wallet-selector-${Date.now()}`}
                  onConnect={handleWalletSelectorConnect}
                  showOnlyAvailable={true}
                />
              </div>
            )}
          </div>
        ) : (
          <div className="connected-wallet">
            <div className="connection-success">
              <div className="success-content">
                <div className="success-icon">✓</div>
                <div className="success-text">
                  <h3>Wallet Connected Successfully!</h3>
                  <p>You're now ready to start chatting with AI models</p>
                </div>
              </div>
            </div>

            <div className="wallet-details">
              <div className="detail-item">
                <span className="label">Wallet Address:</span>
                <span className="value">{ownerAddress}</span>
              </div>
              
              {account && (
                <>
                  <div className="detail-item">
                    <span className="label">Smart Account:</span>
                    <span className="value">{account.address}</span>
                  </div>
                  
                  <div className="detail-item">
                    <span className="label">Wallet Balance:</span>
                    <span className="value">
                      {isLoadingWalletBalance ? 'Loading...' : 
                        walletBalance ? `${parseFloat(walletBalance.formatted).toFixed(4)} ${walletBalance.symbol}` : 
                        '0 SBC'}
                    </span>
                  </div>
                  
                  <div className="detail-item">
                    <span className="label">Account Status:</span>
                    <span className="value">
                      {account.isDeployed ? 'Deployed' : 'Not Deployed (will deploy on first transaction)'}
                    </span>
                  </div>
                  
                  <div className="detail-item">
                    <span className="label">Smart Account Balance:</span>
                    <span className="value">
                      {account.balance ? (parseInt(account.balance) / 1e18).toFixed(4) : '0'} SBC
                    </span>
                  </div>
                </>
              )}
            </div>

            <div className="action-buttons">
              <button 
                className="disconnect-btn"
                onClick={handleDisconnect}
              >
                Disconnect Wallet
              </button>
            </div>
          </div>
        )}

        {(isLoadingAccount || isConnecting || isRefreshing) && (
          <div className="loading-state">
            <div className="skeleton-box">
              <div className="skeleton-line skeleton-title"></div>
              <div className="skeleton-line skeleton-text"></div>
              <div className="skeleton-line skeleton-text"></div>
              <div className="skeleton-line skeleton-text-short"></div>
            </div>
            <p className="loading-text">
              {isConnecting ? 'Connecting wallet...' : 
               isRefreshing ? 'Refreshing account data...' : 
               'Loading account information...'}
            </p>
          </div>
        )}

        {ownerAddress && !account && !isLoadingAccount && !isRefreshing && (
          <div className="polling-state">
            <div className="skeleton-box">
              <div className="skeleton-line skeleton-title"></div>
              <div className="skeleton-line skeleton-text"></div>
              <div className="skeleton-line skeleton-text-short"></div>
            </div>
            <p className="loading-text">Setting up your smart account...</p>
            <small>This may take a few moments</small>
          </div>
        )}
      </div>
    </div>
  );
};

export default SignIn;
