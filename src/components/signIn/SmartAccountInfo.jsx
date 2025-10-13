import React, { useState, useEffect } from 'react';
import { useSbcApp } from '@stablecoin.xyz/react';
import { fetchSbcBalance, formatSbcBalance, dispatchBalanceUpdate } from '../../utils/signinUtils';

function SmartAccountInfo() {
    const { account, isInitialized, refreshAccount, isLoadingAccount } = useSbcApp();
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [sbcBalance, setSbcBalance] = useState(null);
    const [isLoadingBalance, setIsLoadingBalance] = useState(false);

    const loadSbcBalance = async () => {
        if (!account?.address) return;

        setIsLoadingBalance(true);
        try {
            const balance = await fetchSbcBalance(account.address);
            setSbcBalance(balance);
            dispatchBalanceUpdate(balance);
        } catch (error) {
            setSbcBalance('0');
            dispatchBalanceUpdate('0');
        } finally {
            setIsLoadingBalance(false);
        }
    };

    const handleAccountChange = () => {
        if (!account?.address) return;
        const timeout = setTimeout(loadSbcBalance, 500);
        return () => clearTimeout(timeout);
    };

    const handleSmartAccountRefresh = () => {
        if (account?.address) {
            refreshAccount?.();
            loadSbcBalance();
        }
    };

    const handleRefresh = async () => {
        setIsRefreshing(true);
        try {
            await refreshAccount?.();
            if (account?.address) {
                await loadSbcBalance();
            }
        } catch (error) {
        } finally {
            setIsRefreshing(false);
        }
    };

    useEffect(() => {
        handleAccountChange();
    }, [account?.address]);

    useEffect(() => {
        window.addEventListener('smartAccountRefreshed', handleSmartAccountRefresh);
        return () => window.removeEventListener('smartAccountRefreshed', handleSmartAccountRefresh);
    }, [account?.address, refreshAccount]);

    if (!isInitialized) {
        return (
            <div className="smart-account-card">
                <div className="status-header">
                    <h3>Smart Account</h3>
                    <div className="skeleton skeleton-button" style={{ width: '80px', height: '2rem' }}></div>
                </div>
                <div className="info-row">
                    <label>Address:</label>
                    <div className="skeleton skeleton-text long"></div>
                </div>
                <div className="info-row">
                    <label>Deployed:</label>
                    <div className="skeleton skeleton-text medium"></div>
                </div>
                <div className="info-row">
                    <label>SBC Balance:</label>
                    <div className="skeleton skeleton-text medium"></div>
                </div>
            </div>
        );
    }

    if (!account) {
        return (
            <div className="smart-account-card">
                <div className="status-header">
                    <h3>Smart Account</h3>
                    <div className="skeleton skeleton-button" style={{ width: '80px', height: '2rem' }}></div>
                </div>
                <div className="info-row">
                    <label>Address:</label>
                    <div className="skeleton skeleton-text long"></div>
                </div>
                <div className="info-row">
                    <label>Deployed:</label>
                    <div className="skeleton skeleton-text medium"></div>
                </div>
                <div className="info-row">
                    <label>SBC Balance:</label>
                    <div className="skeleton skeleton-text medium"></div>
                </div>
            </div>
        );
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
                    {isLoadingBalance ? (
                        <div className="skeleton skeleton-text medium"></div>
                    ) : (
                        `${formatSbcBalance(sbcBalance)} SBC`
                    )}
                </div>
            </div>
        </div>
    );
}

export default SmartAccountInfo;
