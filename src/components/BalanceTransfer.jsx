import React, { useState, useEffect, useCallback } from 'react';
import { useSbcApp, useUserOperation } from '@stablecoin.xyz/react';
import { getAddress, parseSignature, parseUnits } from 'viem';
import { FaCheckCircle, FaExclamationCircle, FaSpinner } from 'react-icons/fa';
import { publicClient, chain, SBC_TOKEN_ADDRESS, SBC_DECIMALS } from '../config/rpc';
import {
  getPermitSignature,
  fetchWalletBalance,
  formatSbcBalance,
  createPermitCallData,
  createTransferFromCallData,
  getSmartAccountBalance
} from '../utils/ercUtils';

function BalanceTransfer() {
  const { account, ownerAddress, sbcAppKit, refreshAccount } = useSbcApp();
  const { sendUserOperation, isLoading, isSuccess, isError, error: opError, data } = useUserOperation();
  const [amount, setAmount] = useState('');
  const [walletBalance, setWalletBalance] = useState(null);
  const [isLoadingBalance, setIsLoadingBalance] = useState(false);
  const [transferStatus, setTransferStatus] = useState(null);
  const [isWrongNetwork, setIsWrongNetwork] = useState(false);

  const walletClient = sbcAppKit?.walletClient;

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
      return false;
    }
  }, [walletClient]);

  const switchToBaseNetwork = async () => {
    if (!walletClient) return;

    try {
      await walletClient.switchChain({ id: chain.id });
      setIsWrongNetwork(false);
    } catch (error) {
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
        setTransferStatus({ type: 'error', message: 'Please switch to Base network manually in your wallet' });
      }
    }
  };

  const loadWalletBalance = useCallback(async () => {
    if (!ownerAddress) {
      setWalletBalance(null);
      return;
    }

    setIsLoadingBalance(true);
    try {
      const balance = await fetchWalletBalance(ownerAddress);
      setWalletBalance(balance);
    } catch (error) {
      setWalletBalance('0');
    } finally {
      setIsLoadingBalance(false);
    }
  }, [ownerAddress]);

  useEffect(() => {
    if (ownerAddress) {
      checkNetwork();
      loadWalletBalance();
    }
  }, [checkNetwork, loadWalletBalance, ownerAddress]);


  const handleTransfer = async () => {
    if (!account || !ownerAddress || !walletClient || !amount) return;

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
      const deadline = Math.floor(Date.now() / 1000) + 60 * 30;

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

      const permitCallData = createPermitCallData({
        owner: ownerChecksum,
        spender: spenderChecksum,
        value,
        deadline,
        v,
        r,
        s,
      });

      const transferFromCallData = createTransferFromCallData({
        from: ownerChecksum,
        to: spenderChecksum,
        value,
      });

      await sendUserOperation({
        calls: [
          { to: SBC_TOKEN_ADDRESS(chain), data: permitCallData },
          { to: SBC_TOKEN_ADDRESS(chain), data: transferFromCallData },
        ],
      });
    } catch (err) {
      setTransferStatus({ type: 'error', message: err.message || 'Transfer failed' });
    }
  };

  const refreshSmartAccountBalance = useCallback(async () => {
    try {
      await refreshAccount?.();

      if (account?.address) {
        const balance = await getSmartAccountBalance(account.address);

        window.dispatchEvent(new CustomEvent('sbcBalanceUpdated', {
          detail: {
            balance: balance,
            formattedBalance: formatSbcBalance(balance)
          }
        }));

        window.dispatchEvent(new CustomEvent('smartAccountRefreshed'));
      }
    } catch (error) {
    }
  }, [account?.address, refreshAccount]);

  useEffect(() => {
    if (isSuccess && data) {
      setTransferStatus({ type: 'success', hash: data.transactionHash });
      setAmount('');
      loadWalletBalance();
      refreshSmartAccountBalance();
    }
  }, [isSuccess, data, loadWalletBalance, refreshSmartAccountBalance]);

  useEffect(() => {
    if (isError && opError) {
      setTransferStatus({ type: 'error', message: opError.message });
    }
  }, [isError, opError]);

  useEffect(() => {
    if (transferStatus && (transferStatus.type === 'success' || transferStatus.type === 'error')) {
      const fadeTimer = setTimeout(() => {
        const statusElement = document.querySelector('.balance-transfer-card .status-message');
        if (statusElement) {
          statusElement.classList.add('fade-out');
        }
      }, 4500);

      const hideTimer = setTimeout(() => {
        setTransferStatus(null);
      }, 5000);

      return () => {
        clearTimeout(fadeTimer);
        clearTimeout(hideTimer);
      };
    }
  }, [transferStatus]);

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
            <div className="status-content">
              <FaCheckCircle className="status-icon" />
              <p>Transfer Successful!</p>
              <a
                href={`https://basescan.org/tx/${transferStatus.hash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="tx-link"
              >
                View on BaseScan
              </a>
            </div>
          )}

          {transferStatus.type === 'error' && (
            <div className="status-content">
              <FaExclamationCircle className="status-icon" />
              <p>Transfer Failed</p>
            </div>
          )}

          {transferStatus.type === 'pending' && (
            <div className="status-content">
              <FaSpinner className="status-icon spinning" />
              <p>Processing...</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default BalanceTransfer;
