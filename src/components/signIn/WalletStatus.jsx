import React from 'react';
import { useSbcApp } from '@stablecoin.xyz/react';
import { chain } from '../../config/rpc';

function WalletStatus({ onDisconnect }) {
    const { ownerAddress } = useSbcApp();

    if (!ownerAddress) {
        return (
            <div className="wallet-status-card">
                <div className="status-header">
                    <h3>Wallet Connected</h3>
                    <div className="skeleton skeleton-button" style={{ width: '100px', height: '2rem' }}></div>
                </div>
                <div className="info-row">
                    <label>EOA Address:</label>
                    <div className="skeleton skeleton-text long"></div>
                </div>
                <div className="info-row">
                    <label>Connection:</label>
                    <div className="skeleton skeleton-text medium"></div>
                </div>
                <div className="info-row">
                    <label>Chain:</label>
                    <div className="skeleton skeleton-text short"></div>
                </div>
            </div>
        );
    }

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

export default WalletStatus;
