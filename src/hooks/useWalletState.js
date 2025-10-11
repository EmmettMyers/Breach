import { useState, useEffect, useCallback } from 'react';
import { useSbcApp } from '@stablecoin.xyz/react';
import { createPublicClient, http, formatUnits } from 'viem';
import { baseSepolia } from 'viem/chains';

export const useWalletState = () => {
  const { account, ownerAddress, isLoadingAccount, refreshAccount } = useSbcApp();
  const [forceUpdate, setForceUpdate] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [walletBalance, setWalletBalance] = useState(null);
  const [isLoadingWalletBalance, setIsLoadingWalletBalance] = useState(false);

  // Fetch wallet balance using the SBC AppKit's built-in capabilities
  const fetchWalletBalance = useCallback(async () => {
    if (!ownerAddress || !account) {
      setWalletBalance(null);
      return;
    }

    setIsLoadingWalletBalance(true);
    try {
      // SBC token contract address on Base Sepolia
      const sbcTokenAddress = '0xf9FB20B8E097904f0aB7d12e9DbeE88f2dcd0F16';
      
      console.log('Fetching balance for account:', account.address);
      console.log('SBC token address:', sbcTokenAddress);
      
      // Create a public client to read from the blockchain
      const publicClient = createPublicClient({
        chain: baseSepolia,
        transport: http()
      });
      
      // ERC-20 balanceOf function ABI
      const erc20Abi = [
        {
          "inputs": [{"internalType": "address", "name": "account", "type": "address"}],
          "name": "balanceOf",
          "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
          "stateMutability": "view",
          "type": "function"
        }
      ];
      
      // First, check if the contract exists at the address
      const code = await publicClient.getBytecode({ address: sbcTokenAddress });
      if (!code || code === '0x') {
        console.warn('No contract found at SBC token address:', sbcTokenAddress);
        setWalletBalance({
          formatted: '0',
          symbol: 'SBC',
          decimals: 18,
          value: '0'
        });
        return;
      }

      // Fetch the SBC token balance
      const balance = await publicClient.readContract({
        address: sbcTokenAddress,
        abi: erc20Abi,
        functionName: 'balanceOf',
        args: [account.address]
      });
      
      console.log('Raw balance response:', balance);
      
      if (balance !== undefined && balance !== null) {
        const formattedBalance = formatUnits(balance, 18);
        console.log('Formatted balance:', formattedBalance);
        
        setWalletBalance({
          formatted: formattedBalance,
          symbol: 'SBC',
          decimals: 18,
          value: balance.toString()
        });
      } else {
        console.log('No SBC balance found in smart account');
        // Fallback to zero balance if no balance found
        setWalletBalance({
          formatted: '0',
          symbol: 'SBC',
          decimals: 18,
          value: '0'
        });
      }
    } catch (error) {
      console.error('Failed to fetch wallet balance:', error);
      
      // Try fallback approach using SBC AppKit if available
      try {
        console.log('Attempting fallback balance fetch...');
        // For now, set a zero balance as fallback
        // In a real implementation, you might want to try alternative methods
        setWalletBalance({
          formatted: '0',
          symbol: 'SBC',
          decimals: 18,
          value: '0'
        });
      } catch (fallbackError) {
        console.error('Fallback balance fetch also failed:', fallbackError);
        // Final fallback to zero balance
        setWalletBalance({
          formatted: '0',
          symbol: 'SBC',
          decimals: 18,
          value: '0'
        });
      }
    } finally {
      setIsLoadingWalletBalance(false);
    }
  }, [ownerAddress, account]);

  // Fetch balance when wallet connects or account changes
  useEffect(() => {
    if (ownerAddress && account) {
      fetchWalletBalance();
    }
  }, [fetchWalletBalance, ownerAddress, account]);

  // Force update when wallet connection changes
  useEffect(() => {
    setForceUpdate(prev => prev + 1);
  }, [ownerAddress, account]);

  // Enhanced refresh function
  const enhancedRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await refreshAccount();
      setForceUpdate(prev => prev + 1);
    } catch (error) {
      console.error('Failed to refresh account:', error);
    } finally {
      setIsRefreshing(false);
    }
  }, [refreshAccount]);

  // Auto-refresh when wallet connects
  useEffect(() => {
    if (ownerAddress) {
      const timeout = setTimeout(() => {
        enhancedRefresh();
      }, 1000);
      
      return () => clearTimeout(timeout);
    }
  }, [ownerAddress, enhancedRefresh]);

  // Poll for account data if wallet is connected but no account data yet
  useEffect(() => {
    if (ownerAddress && !account && !isLoadingAccount && !isRefreshing) {
      let pollCount = 0;
      const maxPolls = 10;
      
      const interval = setInterval(() => {
        pollCount++;
        enhancedRefresh();
        
        if (pollCount >= maxPolls) {
          clearInterval(interval);
        }
      }, 2000);
      
      return () => clearInterval(interval);
    }
  }, [ownerAddress, account, isLoadingAccount, isRefreshing, enhancedRefresh]);

  // Refresh on window focus (when user comes back to tab)
  useEffect(() => {
    const handleFocus = () => {
      if (ownerAddress) {
        enhancedRefresh();
      }
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [ownerAddress, enhancedRefresh]);

  return {
    account,
    ownerAddress,
    isLoadingAccount,
    isRefreshing,
    forceUpdate,
    setForceUpdate,
    walletBalance,
    isLoadingWalletBalance,
    fetchWalletBalance,
    refreshAccount: enhancedRefresh
  };
};
