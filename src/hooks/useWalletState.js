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

  const fetchWalletBalance = useCallback(async () => {
    if (!ownerAddress || !account) {
      setWalletBalance(null);
      return;
    }

    setIsLoadingWalletBalance(true);
    try {
      const sbcTokenAddress = '0xfdcC3dd6671eaB0709A4C0f3F53De9a333d80798';
      
      console.log('Fetching balance for account:', account.address);
      console.log('SBC token address:', sbcTokenAddress);
      
      const publicClient = createPublicClient({
        chain: baseSepolia,
        transport: http()
      });
      
      const erc20Abi = [
        {
          "inputs": [{"internalType": "address", "name": "account", "type": "address"}],
          "name": "balanceOf",
          "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
          "stateMutability": "view",
          "type": "function"
        }
      ];
      
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
        setWalletBalance({
          formatted: '0',
          symbol: 'SBC',
          decimals: 18,
          value: '0'
        });
      }
    } catch (error) {
      console.error('Failed to fetch wallet balance:', error);
      
      try {
        console.log('Attempting fallback balance fetch...');
        setWalletBalance({
          formatted: '0',
          symbol: 'SBC',
          decimals: 18,
          value: '0'
        });
      } catch (fallbackError) {
        console.error('Fallback balance fetch also failed:', fallbackError);
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

  useEffect(() => {
    if (ownerAddress && account) {
      fetchWalletBalance();
    }
  }, [fetchWalletBalance, ownerAddress, account]);

  useEffect(() => {
    setForceUpdate(prev => prev + 1);
  }, [ownerAddress, account]);

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

  useEffect(() => {
    if (ownerAddress) {
      const timeout = setTimeout(() => {
        enhancedRefresh();
      }, 1000);
      
      return () => clearTimeout(timeout);
    }
  }, [ownerAddress, enhancedRefresh]);

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
