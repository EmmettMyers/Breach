import React, { useEffect, useRef } from 'react';
import { WalletButton, useSbcApp } from '@stablecoin.xyz/react';
import BalanceTransfer from '../BalanceTransfer';
import WalletStatus from './WalletStatus';
import SmartAccountInfo from './SmartAccountInfo';

function WalletConnectFlow({ onDisconnect }) {
    const { ownerAddress, refreshAccount } = useSbcApp();
    const prevOwnerAddress = useRef(null);

    const handleWalletConnection = () => {
        if (ownerAddress && !prevOwnerAddress.current) {
            refreshAccount();
            window.dispatchEvent(new CustomEvent('walletConnected', {
                detail: { ownerAddress }
            }));
        }
        prevOwnerAddress.current = ownerAddress;
    };

    useEffect(() => {
        handleWalletConnection();
    }, [ownerAddress, refreshAccount]);

    if (!ownerAddress || window.walletDisconnected) {
        return (
            <div className="connect-prompt">
                <h3>Connect Your Crypto Wallet</h3>
                <p>Enables creation of a smart account with gasless transactions and payments for jailbreak chats using stablecoin</p>
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
                                {isConnecting ? 'Connecting...' : 'Connect Crypto Wallet'}
                            </button>
                        )}
                    />
                </div>
            </div>
        );
    }

    return (
        <div className="connected-content">
            <div className="left-column">
                <WalletStatus onDisconnect={onDisconnect} />
                <SmartAccountInfo />
            </div>
            <div className="right-column">
                <BalanceTransfer />
            </div>
        </div>
    );
}

export default WalletConnectFlow;
