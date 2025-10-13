import { erc20Abi } from 'viem';
import { publicClient, chain, SBC_TOKEN_ADDRESS, SBC_DECIMALS } from '../config/rpc';

export const fetchSbcBalance = async (accountAddress) => {
  try {
    const balance = await publicClient.readContract({
      address: SBC_TOKEN_ADDRESS(chain),
      abi: erc20Abi,
      functionName: 'balanceOf',
      args: [accountAddress],
    });
    return balance.toString();
  } catch (error) {
    return '0';
  }
};

export const formatSbcBalance = (balance) => {
  if (!balance) return '0.0000';
  try {
    return (Number(balance) / Math.pow(10, SBC_DECIMALS(chain))).toFixed(4);
  } catch {
    return '0.0000';
  }
};

export const dispatchBalanceUpdate = (balance) => {
  window.dispatchEvent(new CustomEvent('sbcBalanceUpdated', { 
    detail: { 
      balance: balance,
      formattedBalance: formatSbcBalance(balance)
    } 
  }));
};
