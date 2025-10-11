import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useWalletState } from '../hooks/useWalletState';
import '../styles/components/navigation.css';

const Navigation = () => {
  const location = useLocation();
  const { ownerAddress, account, forceUpdate, setForceUpdate, walletBalance, isLoadingWalletBalance, fetchWalletBalance } = useWalletState();


  const navItems = [
    { path: '/', name: 'Explore' },
    { path: '/create', name: 'Create' },
    { path: '/statistics', name: 'Statistics' },
    { path: '/signin', name: ownerAddress ? 'Profile' : 'Sign In' }
  ];

  return (
    <nav className="navigation" key={`nav-${forceUpdate}`}>
      <div className="nav-brand">
        <Link to="/" className="nav-logo">
          <img src="/src/assets/logos/breach_logo_white.png" alt="Breach Logo" className="logo-img" />
        </Link>
      </div>
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
        <div className="wallet-status">
          <div className="wallet-indicator">
            <div className="status-dot"></div>
            <span className="wallet-address">
              {ownerAddress.slice(0, 6)}...{ownerAddress.slice(-4)}
            </span>
          </div>
          {walletBalance && (
            <div className="balance-info">
              {isLoadingWalletBalance ? 'Loading...' : 
                `${parseFloat(walletBalance.formatted).toFixed(2)} ${walletBalance.symbol}`}
            </div>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navigation;
