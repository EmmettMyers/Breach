import React, { useState, useEffect, useRef } from 'react';
import { WalletButton, useSbcApp } from '@stablecoin.xyz/react';
import { base } from 'viem/chains';
import { createPublicClient, http } from 'viem';
import { erc20Abi } from 'viem';
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
    </div>
  );
}

const SignIn = () => {
  return (
    <div className="signin-screen">
      <main className="signin-main">
        <WalletConnectFlow />
      </main>
    </div>
  );
};

export default SignIn;
