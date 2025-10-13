import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useSbcApp } from '@stablecoin.xyz/react';
import WalletConnectFlow from '../components/signin/WalletConnectFlow';
import '../styles/screens/SignIn.css';

const SignIn = () => {
  const { account, ownerAddress, isLoadingAccount, refreshAccount, disconnectWallet } = useSbcApp();
  const [isConnecting, setIsConnecting] = useState(false);

  const handleWalletConnection = () => {
    if (ownerAddress && account) {
      setIsConnecting(false);
      window.walletDisconnected = false;
    }
  };

  const handleOwnerAddressChange = () => {
    if (ownerAddress) {
      const timeout = setTimeout(() => {
        refreshAccount();
      }, 1000);

      return () => clearTimeout(timeout);
    }
  };

  const handleAccountPolling = () => {
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
  };

  const handleConnectingTimeout = () => {
    if (isConnecting) {
      const timeout = setTimeout(() => {
        setIsConnecting(false);
      }, 10000);

      return () => clearTimeout(timeout);
    }
  };

  const handleWalletConnectionEvent = () => {
    window.walletDisconnected = false;
  };

  useEffect(() => {
    handleWalletConnection();
  }, [ownerAddress, account]);

  useEffect(() => {
    handleOwnerAddressChange();
  }, [ownerAddress, refreshAccount]);

  useEffect(() => {
    handleAccountPolling();
  }, [ownerAddress, account, isLoadingAccount, refreshAccount]);

  useEffect(() => {
    handleConnectingTimeout();
  }, [isConnecting]);

  useEffect(() => {
    window.addEventListener('walletConnected', handleWalletConnectionEvent);
    return () => window.removeEventListener('walletConnected', handleWalletConnectionEvent);
  }, []);

  const handleDisconnect = () => {
    window.walletDisconnected = true;
    disconnectWallet();
    setIsConnecting(false);
    window.dispatchEvent(new CustomEvent('walletDisconnected'));
  };

  return (
    <div className="signin-screen">
      <main className="signin-main">
        <WalletConnectFlow onDisconnect={handleDisconnect} />
      </main>
    </div>
  );
};

export default SignIn;
