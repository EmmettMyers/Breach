import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useSbcApp } from '@stablecoin.xyz/react';
import { createPublicClient, http } from 'viem';
import { base } from 'viem/chains';
import { erc20Abi } from 'viem';
import '../styles/components/navigation.css';

// SBC Token configuration
const chain = base;
const SBC_TOKEN_ADDRESS = '0xfdcC3dd6671eaB0709A4C0f3F53De9a333d80798';
const SBC_DECIMALS = 18;
const publicClient = createPublicClient({ chain, transport: http() });

const Navigation = () => {
  const location = useLocation();
  const { ownerAddress, account } = useSbcApp();
  const [sbcBalance, setSbcBalance] = useState(null);
  const [isLoadingBalance, setIsLoadingBalance] = useState(false);

  const navItems = [
    { path: '/', name: 'Explore' },
    { path: '/create', name: 'Create' },
    { path: '/statistics', name: 'Statistics' },
    { path: '/signin', name: 'Connect Wallet' }
  ];

  // Fetch SBC balance for smart account
  useEffect(() => {
    if (!account?.address) return;

    const fetchSbcBalance = async () => {
      setIsLoadingBalance(true);
      try {
        const balance = await publicClient.readContract({
          address: SBC_TOKEN_ADDRESS,
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

  // Format SBC balance
  const formatSbcBalance = (balance) => {
    if (!balance) return '0';
    try {
      const formatted = (Number(balance) / Math.pow(10, SBC_DECIMALS)).toFixed(1);
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
        {ownerAddress && (
          <div className="wallet-status-pill">
            <div className="status-indicator"></div>
            <div className="wallet-address">
              {ownerAddress.slice(0, 4)}...{ownerAddress.slice(-4)}
            </div>
            {account && (
              <div className="sbc-balance">
                {isLoadingBalance ? '...' : `${formatSbcBalance(sbcBalance)} SBC`}
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;
