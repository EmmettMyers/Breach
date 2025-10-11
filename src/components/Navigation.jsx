import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useSbcApp } from '@stablecoin.xyz/react';
import { erc20Abi } from 'viem';
import { useWalletState } from '../hooks/useWalletState';
import { publicClient, chain, SBC_TOKEN_ADDRESS, SBC_DECIMALS } from '../config/rpc';
import '../styles/components/navigation.css';

const Navigation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { ownerAddress, account, refreshAccount } = useSbcApp();
  const { ownerAddress: walletStateOwnerAddress, account: walletStateAccount, refreshAccount: walletStateRefreshAccount } = useWalletState();
  const [sbcBalance, setSbcBalance] = useState(null);
  const [isLoadingBalance, setIsLoadingBalance] = useState(false);
  const [forceUpdate, setForceUpdate] = useState(0);
  const [isDisconnected, setIsDisconnected] = useState(false);

  // Use the wallet state hook as primary source, fallback to direct useSbcApp
  const effectiveOwnerAddress = walletStateOwnerAddress || ownerAddress;
  const effectiveAccount = walletStateAccount || account;


  const finalOwnerAddress = effectiveOwnerAddress;
  
  // Force refresh when wallet connection changes
  useEffect(() => {
    if (effectiveOwnerAddress) {
      // Force refresh to ensure pill shows up immediately
      const refreshTimer = setTimeout(() => {
        if (refreshAccount) refreshAccount();
        if (walletStateRefreshAccount) walletStateRefreshAccount();
        setForceUpdate(prev => prev + 1);
      }, 500);
      
      return () => clearTimeout(refreshTimer);
    }
  }, [effectiveOwnerAddress, refreshAccount, walletStateRefreshAccount]);
  
  // Additional validation: ensure we have a proper wallet connection
  const isWalletConnected = !isDisconnected && 
    finalOwnerAddress && 
    finalOwnerAddress.length === 42 && 
    finalOwnerAddress.startsWith('0x') &&
    (ownerAddress || walletStateOwnerAddress); // Must have active connection from hooks

  // Override: if explicitly disconnected, never show pill
  const shouldShowPill = isWalletConnected && !isDisconnected && !window.walletDisconnected;

  // Listen for wallet connection events
  useEffect(() => {
    const handleWalletConnection = () => {
      console.log('Wallet connection detected, refreshing Navigation...');
      setIsDisconnected(false);
      window.walletDisconnected = false; // Reset global state
      setForceUpdate(prev => prev + 1);
      if (refreshAccount) refreshAccount();
      if (walletStateRefreshAccount) walletStateRefreshAccount();
    };

    const handleWalletDisconnection = () => {
      console.log('Wallet disconnection detected, clearing Navigation state...');
      setIsDisconnected(true);
      setSbcBalance(null);
      setIsLoadingBalance(false);
      setForceUpdate(prev => prev + 1);
      // Force refresh to clear all wallet state
      if (refreshAccount) refreshAccount();
      if (walletStateRefreshAccount) walletStateRefreshAccount();
      
      // Additional timeout to force pill removal
      setTimeout(() => {
        console.log('Force removing pill after timeout...');
        setIsDisconnected(true);
        setForceUpdate(prev => prev + 1);
      }, 100);
    };

    const handleSbcBalanceUpdate = (event) => {
      console.log('SBC balance update received in Navigation:', event.detail);
      const { balance, formattedBalance } = event.detail;
      setSbcBalance(balance);
      setForceUpdate(prev => prev + 1);
    };

    // Listen for custom wallet connection events
    window.addEventListener('walletConnected', handleWalletConnection);
    window.addEventListener('walletDisconnected', handleWalletDisconnection);
    window.addEventListener('sbcBalanceUpdated', handleSbcBalanceUpdate);
    
    return () => {
      window.removeEventListener('walletConnected', handleWalletConnection);
      window.removeEventListener('walletDisconnected', handleWalletDisconnection);
      window.removeEventListener('sbcBalanceUpdated', handleSbcBalanceUpdate);
    };
  }, [refreshAccount, walletStateRefreshAccount]);

  // Cleanup effect when wallet disconnects
  useEffect(() => {
    if (!effectiveOwnerAddress && !ownerAddress && !walletStateOwnerAddress) {
      // All wallet sources are empty, clear all state
      setSbcBalance(null);
      setIsLoadingBalance(false);
      setForceUpdate(prev => prev + 1);
    }
  }, [effectiveOwnerAddress, ownerAddress, walletStateOwnerAddress]);

  // Force pill removal when disconnected
  useEffect(() => {
    if (isDisconnected) {
      console.log('Disconnected state detected, forcing pill removal...');
      setForceUpdate(prev => prev + 1);
    }
  }, [isDisconnected]);

  // Monitor global disconnect state
  useEffect(() => {
    const checkGlobalState = () => {
      if (window.walletDisconnected) {
        console.log('Global disconnect state detected, forcing pill removal...');
        setIsDisconnected(true);
        setForceUpdate(prev => prev + 1);
      }
    };
    
    // Check immediately
    checkGlobalState();
    
    // Check periodically
    const interval = setInterval(checkGlobalState, 100);
    
    return () => clearInterval(interval);
  }, []);

  // Debug logging
  useEffect(() => {
    console.log('Navigation Debug:', {
      directOwnerAddress: ownerAddress,
      walletStateOwnerAddress: walletStateOwnerAddress,
      effectiveOwnerAddress: effectiveOwnerAddress,
      finalOwnerAddress: finalOwnerAddress,
      isDisconnected: isDisconnected,
      isWalletConnected: isWalletConnected,
      forceUpdate: forceUpdate,
      directAccount: account,
      walletStateAccount: walletStateAccount,
      effectiveAccount: effectiveAccount
    });
  }, [ownerAddress, walletStateOwnerAddress, effectiveOwnerAddress, finalOwnerAddress, isDisconnected, isWalletConnected, forceUpdate, account, walletStateAccount, effectiveAccount]);

  const navItems = [
    { path: '/', name: 'Explore' },
    { path: '/create', name: 'Create' },
    { path: '/statistics', name: 'Statistics' }
  ];

  // Handle wallet pill click to navigate to sign-in
  const handleWalletPillClick = () => {
    navigate('/signin');
  };

  // Fetch SBC balance for smart account
  useEffect(() => {
    if (!effectiveAccount?.address) return;

    const fetchSbcBalance = async () => {
      setIsLoadingBalance(true);
      try {
        const balance = await publicClient.readContract({
          address: SBC_TOKEN_ADDRESS(chain),
          abi: erc20Abi,
          functionName: 'balanceOf',
          args: [effectiveAccount.address],
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
  }, [effectiveAccount?.address]);

  // Format SBC balance
  const formatSbcBalance = (balance) => {
    if (!balance) return '0';
    try {
      const formatted = (Number(balance) / Math.pow(10, SBC_DECIMALS(chain))).toFixed(1);
      return parseFloat(formatted).toString(); // Remove trailing zeros
    } catch {
      return '0';
    }
  };

  return (
    <nav className="navigation">
      <div className="nav-brand">
        <Link to="/" className="nav-logo">
          <img src="/src/assets/logos/breach_logo_white.png" alt="Breach Logo" className="logo-img" />
        </Link>
      </div>
      <div className="nav-right">
        <ul className="nav-list">
          {navItems.map((item) => (
            <li key={item.path} className="nav-item">
              <Link
                to={item.path}
                className={`nav-link ${location.pathname === item.path ? 'active' : ''}`}
              >
                {item.name}
              </Link>
            </li>
          ))}
        </ul>
        {shouldShowPill ? (
          <div className="wallet-status-pill" onClick={handleWalletPillClick} style={{ cursor: 'pointer' }}>
            <div className="status-indicator"></div>
            <div className="wallet-address">
              {finalOwnerAddress.slice(0, 4)}...{finalOwnerAddress.slice(-4)}
            </div>
            {effectiveAccount && (
              <div className="sbc-balance">
                {isLoadingBalance ? '...' : `${formatSbcBalance(sbcBalance)} SBC`}
              </div>
            )}
          </div>
        ) : (
          <Link to="/signin" className="nav-link">
            Connect Wallet
          </Link>
        )}
      </div>
    </nav>
  );
};

export default Navigation;
