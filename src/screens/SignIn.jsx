import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { WalletButton, useSbcApp } from '@stablecoin.xyz/react';
import { erc20Abi } from 'viem';
import { publicClient, chain, SBC_TOKEN_ADDRESS, SBC_DECIMALS } from '../config/rpc';
import BalanceTransfer from '../components/BalanceTransfer';
import '../styles/screens/SignIn.css';

function WalletStatus({ onDisconnect }) {
  const { ownerAddress } = useSbcApp();

  if (!ownerAddress) {
    return (
      <div className="wallet-status-card">
        <div className="status-header">
          <h3>Wallet Connected</h3>
          <div className="skeleton skeleton-button" style={{width: '100px', height: '2rem'}}></div>
        </div>
        <div className="info-row">
          <label>EOA Address:</label>
          <div className="skeleton skeleton-text long"></div>
        </div>
        <div className="info-row">
          <label>Connection:</label>
          <div className="skeleton skeleton-text medium"></div>
        </div>
        <div className="info-row">
          <label>Chain:</label>
          <div className="skeleton skeleton-text short"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="wallet-status-card">
      <div className="status-header">
        <h3>Wallet Connected</h3>
        <button onClick={onDisconnect} className="disconnect-btn">Disconnect</button>
      </div>
      <div className="info-row">
        <label>EOA Address:</label>
        <div className="address-display">{ownerAddress}</div>
      </div>
      <div className="info-row">
        <label>Connection:</label>
        <div className="value">Connected via wallet extension</div>
      </div>
      <div className="info-row">
        <label>Chain:</label>
        <div className="value">{chain.name}</div>
      </div>
    </div>
  );
}

function SmartAccountInfo() {
  const { account, isInitialized, refreshAccount, isLoadingAccount } = useSbcApp();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [sbcBalance, setSbcBalance] = useState(null);
  const [isLoadingBalance, setIsLoadingBalance] = useState(false);

  // Fetch SBC balance for smart account
  useEffect(() => {
    if (!account?.address) return;

    const fetchSbcBalance = async () => {
      setIsLoadingBalance(true);
      try {
        const balance = await publicClient.readContract({
          address: SBC_TOKEN_ADDRESS(chain),
          abi: erc20Abi,
          functionName: 'balanceOf',
          args: [account.address],
        });
        setSbcBalance(balance.toString());
        // Dispatch custom event to notify Navigation component of balance update
        window.dispatchEvent(new CustomEvent('sbcBalanceUpdated', { 
          detail: { 
            balance: balance.toString(),
            formattedBalance: (Number(balance) / Math.pow(10, SBC_DECIMALS(chain))).toFixed(2)
          } 
        }));
      } catch (error) {
        console.error('Failed to fetch SBC balance for smart account:', error);
        // Set to 0 on error to prevent retry loops
        setSbcBalance('0');
        // Dispatch event even on error to update navigation
        window.dispatchEvent(new CustomEvent('sbcBalanceUpdated', { 
          detail: { 
            balance: '0',
            formattedBalance: '0.00'
          } 
        }));
      } finally {
        setIsLoadingBalance(false);
      }
    };

    // Add a small delay to prevent immediate calls after account creation
    const timeout = setTimeout(fetchSbcBalance, 500);
    return () => clearTimeout(timeout);
  }, [account?.address]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refreshAccount?.();
      // Only refresh SBC balance if we have a valid account address
      if (account?.address) {
        setIsLoadingBalance(true);
        try {
          const balance = await publicClient.readContract({
            address: SBC_TOKEN_ADDRESS(chain),
            abi: erc20Abi,
            functionName: 'balanceOf',
            args: [account.address],
          });
          setSbcBalance(balance.toString());
          // Dispatch custom event to notify Navigation component of balance update
          window.dispatchEvent(new CustomEvent('sbcBalanceUpdated', { 
            detail: { 
              balance: balance.toString(),
              formattedBalance: (Number(balance) / Math.pow(10, SBC_DECIMALS(chain))).toFixed(2)
            } 
          }));
        } catch (error) {
          console.error('Failed to refresh SBC balance:', error);
          // Don't set to 0 on error, keep previous value
        } finally {
          setIsLoadingBalance(false);
        }
      }
    } catch (error) {
      console.error('Failed to refresh account:', error);
    } finally {
      setIsRefreshing(false);
    }
  };


  const formatSbcBalance = (balance) => {
    if (!balance) return '0.00';
    try {
      return (Number(balance) / Math.pow(10, SBC_DECIMALS(chain))).toFixed(2);
    } catch {
      return '0.00';
    }
  };

  if (!isInitialized) {
    return (
      <div className="smart-account-card">
        <div className="status-header">
          <h3>Smart Account</h3>
          <div className="skeleton skeleton-button" style={{width: '80px', height: '2rem'}}></div>
        </div>
        <div className="info-row">
          <label>Address:</label>
          <div className="skeleton skeleton-text long"></div>
        </div>
        <div className="info-row">
          <label>Deployed:</label>
          <div className="skeleton skeleton-text medium"></div>
        </div>
        <div className="info-row">
          <label>SBC Balance:</label>
          <div className="skeleton skeleton-text medium"></div>
        </div>
      </div>
    );
  }

  if (!account) {
    return (
      <div className="smart-account-card">
        <div className="status-header">
          <h3>Smart Account</h3>
          <div className="skeleton skeleton-button" style={{width: '80px', height: '2rem'}}></div>
        </div>
        <div className="info-row">
          <label>Address:</label>
          <div className="skeleton skeleton-text long"></div>
        </div>
        <div className="info-row">
          <label>Deployed:</label>
          <div className="skeleton skeleton-text medium"></div>
        </div>
        <div className="info-row">
          <label>SBC Balance:</label>
          <div className="skeleton skeleton-text medium"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="smart-account-card">
      <div className="status-header">
        <h3>Smart Account</h3>
        <button
          onClick={handleRefresh}
          disabled={isRefreshing || isLoadingAccount}
          className="refresh-btn"
        >
          {isRefreshing || isLoadingAccount ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>
      <div className="info-row">
        <label>Address:</label>
        <div className="address-display">{account.address}</div>
      </div>
      <div className="info-row">
        <label>Deployed:</label>
        <div className="value">{account.isDeployed ? 'Yes' : 'On first transaction'}</div>
      </div>
      <div className="info-row">
        <label>SBC Balance:</label>
        <div className="value">
          {isLoadingBalance ? (
            <div className="skeleton skeleton-text medium"></div>
          ) : (
            `${formatSbcBalance(sbcBalance)} SBC`
          )}
        </div>
      </div>
    </div>
  );
}

function WalletConnectFlow() {
  const { ownerAddress, disconnectWallet, refreshAccount } = useSbcApp();
  const prevOwnerAddress = useRef(null);

  useEffect(() => {
    if (ownerAddress && !prevOwnerAddress.current) {
      // Only refresh once when wallet first connects
      refreshAccount();
      // Dispatch custom event to notify Navigation component
      window.dispatchEvent(new CustomEvent('walletConnected', { 
        detail: { ownerAddress } 
      }));
    }
    prevOwnerAddress.current = ownerAddress;
  }, [ownerAddress, refreshAccount]);

  if (!ownerAddress) {
    return (
      <div className="connect-prompt">
        <h3>Connect Your Wallet</h3>
        <p>Enables creation of a smart account with gasless transactions and payments for jailbreak chats using SBC</p>
        <div className="wallet-button-container">
          <WalletButton
            walletType="auto"
            onConnect={refreshAccount}
            render={({ onClick, isConnecting }) => (
              <button
                className="wallet-connect-btn"
                onClick={onClick}
                disabled={isConnecting}
              >
                {isConnecting ? 'Connecting...' : 'Connect Wallet'}
              </button>
            )}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="connected-content">
      <div className="left-column">
        <WalletStatus onDisconnect={disconnectWallet} />
        <SmartAccountInfo />
      </div>
      <div className="right-column">
        <BalanceTransfer />
      </div>
    </div>
  );
}

const SignIn = () => {
  const navigate = useNavigate();
  const { account, ownerAddress, isLoadingAccount, refreshAccount, disconnectWallet } = useSbcApp();
  const [showWalletSelector, setShowWalletSelector] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

  // Handle connection state changes
  useEffect(() => {
    if (ownerAddress && account) {
      setIsConnecting(false);
      // Optional: Auto-redirect after successful connection
      // navigate('/');
    }
  }, [ownerAddress, account, navigate]);

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
  // Reduced polling frequency and max attempts to prevent rate limiting
  useEffect(() => {
    if (ownerAddress && !account && !isLoadingAccount) {
      let pollCount = 0;
      const maxPolls = 5; // Reduced from 10 to 5 attempts
      
      const interval = setInterval(() => {
        pollCount++;
        refreshAccount();
        
        // Stop polling after max attempts
        if (pollCount >= maxPolls) {
          clearInterval(interval);
        }
      }, 5000); // Increased from 2 seconds to 5 seconds to reduce API calls
      
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
    console.log('Disconnect button clicked, dispatching events...');
    // Set global state immediately
    window.walletDisconnected = true;
    disconnectWallet();
    setShowWalletSelector(false);
    setIsConnecting(false);
    // Dispatch custom event to notify Navigation component
    window.dispatchEvent(new CustomEvent('walletDisconnected'));
    
    // Dispatch multiple events to ensure Navigation gets it
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('walletDisconnected'));
    }, 50);
    
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('walletDisconnected'));
    }, 100);
  };

  const handleWalletConnect = useCallback(() => {
    setIsConnecting(true);
    setShowWalletSelector(false);
    // Force a refresh after a short delay
    setTimeout(() => {
      refreshAccount();
    }, 2000);
  }, [refreshAccount]);

  const handleWalletSelectorConnect = useCallback(() => {
    setIsConnecting(true);
    setShowWalletSelector(false);
    // Force a refresh after a short delay
    setTimeout(() => {
      refreshAccount();
    }, 2000);
  }, [refreshAccount]);

  return (
    <div className="signin-screen">
      <main className="signin-main">
        <WalletConnectFlow />
      </main>
    </div>
  );
};

export default SignIn;
