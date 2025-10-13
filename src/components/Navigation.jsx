import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useSbcApp } from '@stablecoin.xyz/react';
import { erc20Abi } from 'viem';
import { useWalletState } from '../hooks/useWalletState';
import { publicClient, chain, SBC_TOKEN_ADDRESS, SBC_DECIMALS } from '../config/rpc';
import '../styles/components/navigation.css';
import breachLogoWhite from '../assets/logos/breach_logo_white.png';

const Navigation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { ownerAddress, account, refreshAccount } = useSbcApp();
  const { ownerAddress: walletStateOwnerAddress, account: walletStateAccount, refreshAccount: walletStateRefreshAccount } = useWalletState();
  const [sbcBalance, setSbcBalance] = useState(null);
  const [isLoadingBalance, setIsLoadingBalance] = useState(false);
  const [isDisconnected, setIsDisconnected] = useState(false);

  const effectiveOwnerAddress = ownerAddress || walletStateOwnerAddress;
  const effectiveAccount = account || walletStateAccount;
  
  useEffect(() => {
    if (effectiveOwnerAddress) {
      const refreshTimer = setTimeout(() => {
        if (refreshAccount) refreshAccount();
        if (walletStateRefreshAccount) walletStateRefreshAccount();
      }, 500);
      
      return () => clearTimeout(refreshTimer);
    }
  }, [effectiveOwnerAddress, refreshAccount, walletStateRefreshAccount]);
  
  const isWalletConnected = !isDisconnected && 
    effectiveOwnerAddress && 
    effectiveOwnerAddress.length === 42 && 
    effectiveOwnerAddress.startsWith('0x') &&
    !window.walletDisconnected;

  const shouldShowPill = isWalletConnected;

  useEffect(() => {
    const handleWalletConnection = () => {
      setIsDisconnected(false);
      window.walletDisconnected = false;
      if (refreshAccount) refreshAccount();
      if (walletStateRefreshAccount) walletStateRefreshAccount();
    };

    const handleWalletDisconnection = () => {
      setIsDisconnected(true);
      setSbcBalance(null);
      setIsLoadingBalance(false);
      
      window.walletDisconnected = true;
      
      if (refreshAccount) refreshAccount();
      if (walletStateRefreshAccount) walletStateRefreshAccount();
      
      setTimeout(() => {
        setIsDisconnected(true);
      }, 50);
      
      setTimeout(() => {
        setIsDisconnected(true);
      }, 100);
      
      setTimeout(() => {
        setIsDisconnected(true);
      }, 200);
    };

    const handleSbcBalanceUpdate = (event) => {
      const { balance, formattedBalance } = event.detail;
      setSbcBalance(balance);
      
      setTimeout(() => {
      }, 100);
    };

    window.addEventListener('walletConnected', handleWalletConnection);
    window.addEventListener('walletDisconnected', handleWalletDisconnection);
    window.addEventListener('sbcBalanceUpdated', handleSbcBalanceUpdate);
    
    return () => {
      window.removeEventListener('walletConnected', handleWalletConnection);
      window.removeEventListener('walletDisconnected', handleWalletDisconnection);
      window.removeEventListener('sbcBalanceUpdated', handleSbcBalanceUpdate);
    };
  }, [refreshAccount, walletStateRefreshAccount]);

  useEffect(() => {
    if (!effectiveOwnerAddress && !ownerAddress && !walletStateOwnerAddress) {
      setIsDisconnected(true);
      setSbcBalance(null);
      setIsLoadingBalance(false);
    }
  }, [effectiveOwnerAddress, ownerAddress, walletStateOwnerAddress]);

  useEffect(() => {
    if (isDisconnected) {
    }
  }, [isDisconnected]);

  useEffect(() => {
    const checkGlobalState = () => {
      if (window.walletDisconnected) {
        setIsDisconnected(true);
      }
    };
    
    checkGlobalState();
    
    const interval = setInterval(checkGlobalState, 100);
    
    return () => clearInterval(interval);
  }, []);

  const navItems = [
    { path: '/', name: 'Explore' },
    { path: '/create', name: 'Create', requiresWallet: true },
    { path: '/statistics', name: 'Statistics', requiresWallet: true },
    { path: '/about', name: 'About' }
  ];

  const handleWalletPillClick = () => {
    navigate('/signin');
  };

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
        setSbcBalance('0');
      } finally {
        setIsLoadingBalance(false);
      }
    };

    fetchSbcBalance();
  }, [effectiveAccount?.address]);

  const formatSbcBalance = (balance) => {
    if (!balance) return '0.0000';
    try {
      const formatted = (Number(balance) / Math.pow(10, SBC_DECIMALS(chain))).toFixed(4);
      return formatted;
    } catch {
      return '0.0000';
    }
  };

  return (
    <nav className={`navigation ${location.pathname === '/signin' ? 'signin-page' : ''}`}>
      <div className="nav-brand">
        <Link to="/about" className="nav-logo">
          <img src={breachLogoWhite} alt="Breach Logo" className="logo-img" />
        </Link>
      </div>
      <div className="nav-right">
        <ul className="nav-list">
          {navItems.map((item) => {
            const isDisabled = item.requiresWallet && !isWalletConnected;
            return (
              <li key={item.path} className="nav-item">
                {isDisabled ? (
                  <span className={`nav-link disabled ${location.pathname === item.path ? 'active' : ''}`}>
                    {item.name}
                  </span>
                ) : (
                  <Link
                    to={item.path}
                    className={`nav-link ${location.pathname === item.path ? 'active' : ''}`}
                  >
                    {item.name}
                  </Link>
                )}
              </li>
            );
          })}
        </ul>
        {shouldShowPill ? (
          <div className="wallet-status-pill" onClick={handleWalletPillClick} style={{ cursor: 'pointer' }}>
            <div className="status-indicator"></div>
            <div className="wallet-address">
              {effectiveOwnerAddress.slice(0, 4)}...{effectiveOwnerAddress.slice(-4)}
            </div>
            {effectiveAccount && (
              <div className="sbc-balance">
                {isLoadingBalance ? '...' : `${formatSbcBalance(sbcBalance)} SBC`}
              </div>
            )}
          </div>
        ) : (
          <Link to="/signin" className="connect-wallet-pill">
            Connect Crypto Wallet
          </Link>
        )}
      </div>
    </nav>
  );
};

export default Navigation;
