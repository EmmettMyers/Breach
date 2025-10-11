import React, { useState, useEffect, useCallback } from 'react';
import { useSbcApp, useUserOperation } from '@stablecoin.xyz/react';
import { getAddress, parseSignature, parseUnits, encodeFunctionData, erc20Abi } from 'viem';
import { publicClient, chain, SBC_TOKEN_ADDRESS, SBC_DECIMALS } from '../config/rpc';

// ERC-20 Permit ABI
const erc20PermitAbi = [
  ...erc20Abi,
  {
    "inputs": [
      { "internalType": "address", "name": "owner", "type": "address" }
    ],
    "name": "nonces",
    "outputs": [
      { "internalType": "uint256", "name": "", "type": "uint256" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "name",
    "outputs": [
      { "internalType": "string", "name": "", "type": "string" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "version",
    "outputs": [
      { "internalType": "string", "name": "", "type": "string" }
    ],
    "stateMutability": "view",
    "type": "function"
  }
];

const permitAbi = [
  {
    "inputs": [
      { "internalType": "address", "name": "owner", "type": "address" },
      { "internalType": "address", "name": "spender", "type": "address" },
      { "internalType": "uint256", "name": "value", "type": "uint256" },
      { "internalType": "uint256", "name": "deadline", "type": "uint256" },
      { "internalType": "uint8", "name": "v", "type": "uint8" },
      { "internalType": "bytes32", "name": "r", "type": "bytes32" },
      { "internalType": "bytes32", "name": "s", "type": "bytes32" }
    ],
    "name": "permit",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
];

// Helper to get permit signature
async function getPermitSignature({
  publicClient,
  walletClient,
  owner,
  spender,
  value,
  tokenAddress,
  chainId,
  deadline,
}) {
  try {
    // Get the token name and version from the contract
    const [tokenName, tokenVersion] = await Promise.all([
      publicClient.readContract({
        address: tokenAddress,
        abi: erc20PermitAbi,
        functionName: 'name',
      }).catch(() => 'SBC'), // Fallback to 'SBC' if name() doesn't exist
      publicClient.readContract({
        address: tokenAddress,
        abi: erc20PermitAbi,
        functionName: 'version',
      }).catch(() => '1'), // Fallback to '1' if version() doesn't exist
    ]);

    const nonce = await publicClient.readContract({
      address: tokenAddress,
      abi: erc20PermitAbi,
      functionName: 'nonces',
      args: [owner],
    });

    const domain = {
      name: tokenName,
      version: tokenVersion,
      chainId: chainId,
      verifyingContract: tokenAddress,
    };

    const types = {
      Permit: [
        { name: 'owner', type: 'address' },
        { name: 'spender', type: 'address' },
        { name: 'value', type: 'uint256' },
        { name: 'nonce', type: 'uint256' },
        { name: 'deadline', type: 'uint256' },
      ],
    };

    const message = {
      owner,
      spender,
      value: value.toString(),
      nonce: nonce.toString(),
      deadline: deadline.toString(),
    };

    console.log('Permit signature data:', {
      domain,
      types,
      message,
      tokenName,
      tokenVersion,
      nonce: nonce.toString(),
    });

    const signature = await walletClient.signTypedData({
      domain,
      types,
      primaryType: 'Permit',
      message,
    });

    return signature;
  } catch (error) {
    console.error('Error getting permit signature:', error);
    return null;
  }
}

function BalanceTransfer() {
  const { account, ownerAddress, sbcAppKit } = useSbcApp();
  const { sendUserOperation, isLoading, isSuccess, isError, error: opError, data } = useUserOperation();
  const [amount, setAmount] = useState('');
  const [walletBalance, setWalletBalance] = useState(null);
  const [isLoadingBalance, setIsLoadingBalance] = useState(false);
  const [transferStatus, setTransferStatus] = useState(null);
  const [isWrongNetwork, setIsWrongNetwork] = useState(false);

  const walletClient = sbcAppKit?.walletClient;

  // Check if wallet is on the correct network
  const checkNetwork = useCallback(async () => {
    if (!walletClient) return;
    
    try {
      const chainId = await walletClient.getChainId();
      if (chainId !== chain.id) {
        setIsWrongNetwork(true);
        return false;
      } else {
        setIsWrongNetwork(false);
        return true;
      }
    } catch (error) {
      console.error('Error checking network:', error);
      return false;
    }
  }, [walletClient]);

  // Switch to Base network
  const switchToBaseNetwork = async () => {
    if (!walletClient) return;
    
    try {
      await walletClient.switchChain({ id: chain.id });
      setIsWrongNetwork(false);
    } catch (error) {
      console.error('Error switching network:', error);
      // If the network is not added, try to add it
      try {
        await walletClient.addChain({
          chain: {
            id: chain.id,
            name: chain.name,
            nativeCurrency: chain.nativeCurrency,
            rpcUrls: {
              default: { http: [chain.rpcUrls.default.http[0]] },
              public: { http: [chain.rpcUrls.public.http[0]] },
            },
            blockExplorers: {
              default: { name: 'BaseScan', url: chain.blockExplorers.default.url },
            },
          },
        });
        await walletClient.switchChain({ id: chain.id });
        setIsWrongNetwork(false);
      } catch (addError) {
        console.error('Error adding network:', addError);
        setTransferStatus({ type: 'error', message: 'Please switch to Base network manually in your wallet' });
      }
    }
  };

  // Fetch wallet (EOA) SBC balance
  const fetchWalletBalance = useCallback(async () => {
    if (!ownerAddress) {
      setWalletBalance(null);
      return;
    }

    setIsLoadingBalance(true);
    try {
      const balance = await publicClient.readContract({
        address: SBC_TOKEN_ADDRESS(chain),
        abi: erc20Abi,
        functionName: 'balanceOf',
        args: [ownerAddress],
      });
      
      setWalletBalance(balance.toString());
    } catch (error) {
      console.error('Failed to fetch wallet balance:', error);
      setWalletBalance('0');
    } finally {
      setIsLoadingBalance(false);
    }
  }, [ownerAddress]);

  // Check network and fetch balance when component mounts or ownerAddress changes
  useEffect(() => {
    if (ownerAddress) {
      checkNetwork();
      fetchWalletBalance();
    }
  }, [checkNetwork, fetchWalletBalance, ownerAddress]);

  const formatSbcBalance = (balance) => {
    if (!balance) return '0.00';
    try {
      return (Number(balance) / Math.pow(10, SBC_DECIMALS(chain))).toFixed(2);
    } catch {
      return '0.00';
    }
  };

  const handleTransfer = async () => {
    if (!account || !ownerAddress || !walletClient || !amount) return;
    
    // Check network first
    const isCorrectNetwork = await checkNetwork();
    if (!isCorrectNetwork) {
      setTransferStatus({ type: 'error', message: 'Please switch to Base network first' });
      return;
    }
    
    try {
      setTransferStatus({ type: 'pending', message: 'Preparing transfer...' });
      
      const ownerChecksum = getAddress(ownerAddress);
      const spenderChecksum = getAddress(account.address);
      const value = parseUnits(amount, SBC_DECIMALS(chain));
      const deadline = Math.floor(Date.now() / 1000) + 60 * 30; // 30 min
      
      setTransferStatus({ type: 'pending', message: 'Requesting signature...' });
      
      const signature = await getPermitSignature({
        publicClient,
        walletClient,
        owner: ownerChecksum,
        spender: spenderChecksum,
        value,
        tokenAddress: SBC_TOKEN_ADDRESS(chain),
        chainId: chain.id,
        deadline,
      });

      if (!signature) {
        setTransferStatus({ type: 'error', message: 'Failed to get signature' });
        return;
      }

      setTransferStatus({ type: 'pending', message: 'Executing transfer...' });
      
      const { r, s, v } = parseSignature(signature);
      
      const permitCallData = encodeFunctionData({
        abi: permitAbi,
        functionName: 'permit',
        args: [ownerChecksum, spenderChecksum, value, deadline, v, r, s],
      });
      
      const transferFromCallData = encodeFunctionData({
        abi: erc20PermitAbi,
        functionName: 'transferFrom',
        args: [ownerChecksum, spenderChecksum, value],
      });
      
      await sendUserOperation({
        calls: [
          { to: SBC_TOKEN_ADDRESS(chain), data: permitCallData },
          { to: SBC_TOKEN_ADDRESS(chain), data: transferFromCallData },
        ],
      });
    } catch (err) {
      console.error('Transfer failed:', err);
      setTransferStatus({ type: 'error', message: err.message || 'Transfer failed' });
    }
  };

  // Handle successful transfer
  useEffect(() => {
    if (isSuccess && data) {
      setTransferStatus({ type: 'success', hash: data.transactionHash });
      setAmount('');
      // Refresh wallet balance
      fetchWalletBalance();
    }
  }, [isSuccess, data, fetchWalletBalance]);

  // Handle transfer error
  useEffect(() => {
    if (isError && opError) {
      setTransferStatus({ type: 'error', message: opError.message });
    }
  }, [isError, opError]);

  const isFormValid = amount && parseFloat(amount) > 0 && parseFloat(amount) <= parseFloat(formatSbcBalance(walletBalance || '0'));

  if (!account || !ownerAddress) {
    return (
      <div className="balance-transfer-card">
        <div className="status-header">
          <h3>Transfer SBC to Smart Account</h3>
        </div>
        
        <div className="info-row">
          <label>Wallet Balance:</label>
          <div className="skeleton skeleton-text medium"></div>
        </div>
        
        <div className="form-group">
          <label>Amount to Transfer</label>
          <div className="skeleton skeleton-input"></div>
        </div>
        
        <div className="status-section">
          <div className="info-row">
            <label>From:</label>
            <div className="skeleton skeleton-text medium"></div>
          </div>
          <div className="info-row">
            <label>To:</label>
            <div className="skeleton skeleton-text medium"></div>
          </div>
          <div className="info-row">
            <label>Gas fees:</label>
            <div className="skeleton skeleton-text medium"></div>
          </div>
        </div>

        <div className="skeleton skeleton-button"></div>
      </div>
    );
  }

  return (
    <div className="balance-transfer-card">
      <div className="status-header">
        <h3>Transfer SBC to Smart Account</h3>
      </div>
      
      {isWrongNetwork && (
        <div className="network-warning">
          <div className="warning-content">
            <p>Wrong Network Detected</p>
            <p>Please switch to Base network to continue</p>
            <button onClick={switchToBaseNetwork} className="switch-network-btn">
              Switch to Base Network
            </button>
          </div>
        </div>
      )}
      
      <div className="info-row">
        <label>Wallet Balance:</label>
        <div className="value">
          {isLoadingBalance ? (
            <div className="skeleton skeleton-text medium"></div>
          ) : (
            `${formatSbcBalance(walletBalance)} SBC`
          )}
        </div>
      </div>
      
      <div className="form-group">
        <label>Amount to Transfer</label>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="0.00"
          step="0.01"
          min="0"
          max={formatSbcBalance(walletBalance || '0')}
          className={amount && !isFormValid ? 'error' : ''}
        />
        {amount && !isFormValid && (
          <span className="error-text">
            {parseFloat(amount) <= 0 ? 'Amount must be greater than 0' : 'Insufficient balance'}
          </span>
        )}
      </div>
      
      <div className="status-section">
        <div className="info-row">
          <label>From:</label>
          <div className="value">Your Wallet (EOA)</div>
        </div>
        <div className="info-row">
          <label>To:</label>
          <div className="value">Smart Account</div>
        </div>
        <div className="info-row">
          <label>Gas fees:</label>
          <div className="value">Covered by SBC Paymaster</div>
        </div>
      </div>

      <button
        onClick={handleTransfer}
        disabled={!isFormValid || isLoading || isWrongNetwork}
        className="primary"
      >
        {isLoading ? 'Processing...' : `Transfer ${amount || '0'} SBC`}
      </button>

      {transferStatus && (
        <div className={`status-message ${transferStatus.type}`}>
          {transferStatus.type === 'success' && (
            <div>
              <p>Transfer Successful!</p>
              <a 
                href={`https://basescan.org/tx/${transferStatus.hash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="tx-link"
              >
                View on BaseScan: {transferStatus.hash}
              </a>
            </div>
          )}
          
          {transferStatus.type === 'error' && (
            <div>
              <p>Transfer Failed</p>
              <p>{transferStatus.message}</p>
            </div>
          )}
          
          {transferStatus.type === 'pending' && (
            <div>
              <p>{transferStatus.message}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default BalanceTransfer;
