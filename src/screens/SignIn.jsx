import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { WalletButton, useSbcApp } from '@stablecoin.xyz/react';
import { base } from 'viem/chains';
import { createPublicClient, http } from 'viem';
import { erc20Abi } from 'viem';
import BalanceTransfer from '../components/BalanceTransfer';
import '../styles/screens/SignIn.css';

// Chain configuration
const chain = base;

// SBC Token configuration
const SBC_TOKEN_ADDRESS = (chain) => {
  if (chain.id === base.id) {
    return '0xfdcC3dd6671eaB0709A4C0f3F53De9a333d80798';
  }
  throw new Error('Unsupported chain');
};

const SBC_DECIMALS = (chain) => {
  if (chain.id === base.id) {
    return 18;
  }
  throw new Error('Unsupported chain');
};

const publicClient = createPublicClient({ chain, transport: http() });

function WalletStatus({ onDisconnect }) {
  const { ownerAddress } = useSbcApp();

  if (!ownerAddress) return null;

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
      } catch (error) {
        console.error('Failed to fetch SBC balance for smart account:', error);
        setSbcBalance('0');
      } finally {
        setIsLoadingBalance(false);
      }
    };

    fetchSbcBalance();
  }, [account?.address]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refreshAccount?.();
      // Refresh SBC balance as well
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
        } catch (error) {
          console.error('Failed to refresh SBC balance:', error);
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

  const formatEthBalance = (balance) => {
    if (!balance) return '0.0000';
    try {
      return (Number(balance) / 1e18).toFixed(4);
    } catch {
      return '0.0000';
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

  if (!isInitialized || !account) {
    return null;
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
          {isLoadingBalance ? 'Loading...' : `${formatSbcBalance(sbcBalance)} SBC`}
        </div>
      </div>
      <div className="info-row">
        <label>Nonce:</label>
        <div className="value">{account.nonce}</div>
      </div>
      <div className="info-row">
        <label>ETH Balance:</label>
        <div className="value">{formatEthBalance(account.balance)} ETH</div>
      </div>
    </div>
  );
}

function WalletConnectFlow() {
  const { ownerAddress, disconnectWallet, refreshAccount } = useSbcApp();
  const prevOwnerAddress = useRef(null);

  useEffect(() => {
    if (ownerAddress && !prevOwnerAddress.current) {
      refreshAccount();
    }
    prevOwnerAddress.current = ownerAddress;
  }, [ownerAddress, refreshAccount]);

  if (!ownerAddress) {
    return (
      <div className="connect-prompt">
        <h3>Connect Your Wallet</h3>
        <p>Connect your wallet to create a smart account with gasless transactions</p>
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
      <WalletStatus onDisconnect={disconnectWallet} />
      <SmartAccountInfo />
      <BalanceTransfer />
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
    <div className="signin-screen">
      <main className="signin-main">
        <WalletConnectFlow />
      </main>
    </div>
  );
};

export default SignIn;
