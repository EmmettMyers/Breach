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
  const [forceUpdate, setForceUpdate] = useState(0);

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
        window.dispatchEvent(new CustomEvent('sbcBalanceUpdated', { 
          detail: { 
            balance: balance.toString(),
            formattedBalance: (Number(balance) / Math.pow(10, SBC_DECIMALS(chain))).toFixed(4)
          } 
        }));
      } catch (error) {
        console.error('Failed to fetch SBC balance for smart account:', error);
        setSbcBalance('0');
        window.dispatchEvent(new CustomEvent('sbcBalanceUpdated', { 
          detail: { 
            balance: '0',
            formattedBalance: '0.0000'
          } 
        }));
      } finally {
        setIsLoadingBalance(false);
      }
    };

    const timeout = setTimeout(fetchSbcBalance, 500);
    return () => clearTimeout(timeout);
  }, [account?.address]);

  useEffect(() => {
    const handleSmartAccountRefresh = () => {
      console.log('Smart account refresh event received, updating UI...');
      setForceUpdate(prev => prev + 1);
      if (account?.address) {
        refreshAccount?.();
        const fetchBalance = async () => {
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
        };
        fetchBalance();
      }
    };

    window.addEventListener('smartAccountRefreshed', handleSmartAccountRefresh);
    return () => window.removeEventListener('smartAccountRefreshed', handleSmartAccountRefresh);
  }, [account?.address, refreshAccount]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refreshAccount?.();
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
          window.dispatchEvent(new CustomEvent('sbcBalanceUpdated', { 
            detail: { 
              balance: balance.toString(),
              formattedBalance: (Number(balance) / Math.pow(10, SBC_DECIMALS(chain))).toFixed(4)
            } 
          }));
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


  const formatSbcBalance = (balance) => {
    if (!balance) return '0.0000';
    try {
      return (Number(balance) / Math.pow(10, SBC_DECIMALS(chain))).toFixed(4);
    } catch {
      return '0.0000';
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

function WalletConnectFlow({ onDisconnect }) {
  const { ownerAddress, disconnectWallet, refreshAccount } = useSbcApp();
  const prevOwnerAddress = useRef(null);

  useEffect(() => {
    if (ownerAddress && !prevOwnerAddress.current) {
      console.log('New wallet connection detected:', ownerAddress);
      refreshAccount();
      window.dispatchEvent(new CustomEvent('walletConnected', { 
        detail: { ownerAddress } 
      }));
    }
    prevOwnerAddress.current = ownerAddress;
  }, [ownerAddress, refreshAccount]);

  if (!ownerAddress || window.walletDisconnected) {
    return (
      <div className="connect-prompt">
        <h3>Connect Your Crypto Wallet</h3>
        <p>Enables creation of a smart account with gasless transactions and payments for jailbreak chats using stablecoin</p>
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
                {isConnecting ? 'Connecting...' : 'Connect Crypto Wallet'}
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
        <WalletStatus onDisconnect={onDisconnect} />
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

  useEffect(() => {
    if (ownerAddress && account) {
      setIsConnecting(false);
      window.walletDisconnected = false;
    }
  }, [ownerAddress, account]);

  useEffect(() => {
    if (ownerAddress) {
      const timeout = setTimeout(() => {
        refreshAccount();
      }, 1000);
      
      return () => clearTimeout(timeout);
    }
  }, [ownerAddress, refreshAccount]);

  useEffect(() => {
    if (ownerAddress && !account && !isLoadingAccount) {
      let pollCount = 0;
      const maxPolls = 5;
      
      const interval = setInterval(() => {
        pollCount++;
        refreshAccount();
        
        if (pollCount >= maxPolls) {
          clearInterval(interval);
        }
      }, 5000);
      
      return () => clearInterval(interval);
    }
  }, [ownerAddress, account, isLoadingAccount, refreshAccount]);

  useEffect(() => {
    if (isConnecting) {
      const timeout = setTimeout(() => {
        setIsConnecting(false);
      }, 10000);

      return () => clearTimeout(timeout);
    }
  }, [isConnecting]);

  useEffect(() => {
    const handleWalletConnection = () => {
      console.log('Wallet connection event received, resetting disconnect state');
      window.walletDisconnected = false;
    };

    window.addEventListener('walletConnected', handleWalletConnection);
    return () => window.removeEventListener('walletConnected', handleWalletConnection);
  }, []);

  const handleDisconnect = () => {
    console.log('Disconnect button clicked, dispatching events...');
    window.walletDisconnected = true;
    disconnectWallet();
    setShowWalletSelector(false);
    setIsConnecting(false);
    window.dispatchEvent(new CustomEvent('walletDisconnected'));
  };

  const handleWalletConnect = useCallback(() => {
    setIsConnecting(true);
    setShowWalletSelector(false);
    setTimeout(() => {
      refreshAccount();
    }, 2000);
  }, [refreshAccount]);

  const handleWalletSelectorConnect = useCallback(() => {
    setIsConnecting(true);
    setShowWalletSelector(false);
    setTimeout(() => {
      refreshAccount();
    }, 2000);
  }, [refreshAccount]);

  return (
    <div className="signin-screen">
      <main className="signin-main">
        <WalletConnectFlow onDisconnect={handleDisconnect} />
      </main>
    </div>
  );
};

export default SignIn;
