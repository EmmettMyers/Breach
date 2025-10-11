import { useState, useEffect, useRef, createContext, useContext } from 'react';
import { SbcProvider, WalletButton, useSbcApp, useUserOperation } from '@stablecoin.xyz/react';
import { base, baseSepolia } from 'viem/chains';
import { createPublicClient, http, getAddress, parseSignature, WalletClient, PublicClient } from 'viem';
import { parseUnits, encodeFunctionData, erc20Abi } from 'viem';
import './App.css';

// Chain selection helpers
const chain = base;
const rpcUrl = import.meta.env.VITE_RPC_URL;

const SBC_TOKEN_ADDRESS = (chain) => {
  if (chain.id === baseSepolia.id) {
    return '0xf9FB20B8E097904f0aB7d12e9DbeE88f2dcd0F16';
  } else if (chain.id === base.id) {
    return '0xfdcC3dd6671eaB0709A4C0f3F53De9a333d80798';
  }
  throw new Error('Unsupported chain');
};

const SBC_DECIMALS = (chain) => {
  if (chain.id === baseSepolia.id) {
    return 6;
  } else if (chain.id === base.id) {
    return 18;
  }
  throw new Error('Unsupported chain');
};

const chainExplorer = (chain) => {
  if (chain.id === baseSepolia.id) {
    return 'https://sepolia.basescan.org';
  } else if (chain.id === base.id) {
    return 'https://basescan.org';
  }
  throw new Error('Unsupported chain');
};

const publicClient = createPublicClient({ chain, transport: http() });

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

function WalletStatus({ onDisconnect }: { onDisconnect: () => void }) {
  const { ownerAddress } = useSbcApp();

  if (!ownerAddress) return null;

  return (
    <div className="card">
      <div className="status-header">
        <h3>✅ Wallet Connected</h3>
        <button onClick={onDisconnect}>Disconnect</button>
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
  const [sbcBalance, setSbcBalance] = useState<string | null>(null);
  const [isLoadingBalance, setIsLoadingBalance] = useState(false);

  // Fetch SBC balance for smart account
  useEffect(() => {
    if (!account?.address) return;

    const fetchSbcBalance = async () => {
      setIsLoadingBalance(true);
      try {
        const balance = await publicClient.readContract({
          address: SBC_TOKEN_ADDRESS(chain) as `0x${string}`,
          abi: erc20Abi,
          functionName: 'balanceOf',
          args: [account.address as `0x${string}`],
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
            address: SBC_TOKEN_ADDRESS(chain) as `0x${string}`,
            abi: erc20Abi,
            functionName: 'balanceOf',
            args: [account.address as `0x${string}`],
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

  const formatEthBalance = (balance: string | null): string => {
    if (!balance) return '0.0000';
    try {
      return (Number(balance) / 1e18).toFixed(4);
    } catch {
      return '0.0000';
    }
  };

  const formatSbcBalance = (balance: string | null): string => {
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
    <div className="card">
      <div className="status-header">
        <h3>🔐 Smart Account</h3>
        <button
          onClick={handleRefresh}
          disabled={isRefreshing || isLoadingAccount}
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
        <div className="value">{account.isDeployed ? '✅ Yes' : '⏳ On first transaction'}</div>
      </div>
      <div className="info-row">
        <label>Nonce:</label>
        <div className="value">{account.nonce}</div>
      </div>
      <div className="info-row">
        <label>ETH Balance:</label>
        <div className="value">{formatEthBalance(account.balance)} ETH</div>
      </div>
      <div className="info-row">
        <label>SBC Balance:</label>
        <div className="value">
          {isLoadingBalance ? 'Loading...' : `${formatSbcBalance(sbcBalance)} SBC`}
        </div>
      </div>
    </div>
  );
}

function SendSBCForm() {
  const { account, sbcAppKit, ownerAddress } = useSbcApp();
  const { sendUserOperation, isLoading, isSuccess, isError, error: opError, data } = useUserOperation();
  const [recipient, setRecipient] = useState('');
  const walletClient = (sbcAppKit as any)?.walletClient;
  const isFormValid = recipient && /^0x[a-fA-F0-9]{40}$/.test(recipient);

  const handleSendSBC = async () => {
    if (!account || !ownerAddress || !walletClient) return;
    
    try {
      const ownerChecksum = getAddress(ownerAddress);
      const spenderChecksum = getAddress(account.address);
      const value = parseUnits('1', SBC_DECIMALS(chain)); // Send 1 SBC
      const deadline = Math.floor(Date.now() / 1000) + 60 * 30; // 30 min
      
      const signature = await getPermitSignature({
        publicClient: publicClient as PublicClient,
        walletClient: walletClient as WalletClient,
        owner: ownerChecksum,
        spender: spenderChecksum,
        value,
        tokenAddress: SBC_TOKEN_ADDRESS(chain),
        chainId: chain.id,
        deadline,
      });

      if (!signature) {
        console.error('Error signing permit transaction');
        return;
      }
      const { r, s, v } = parseSignature(signature);
      
      const permitCallData = encodeFunctionData({
        abi: permitAbi,
        functionName: 'permit',
        args: [ownerChecksum, spenderChecksum, value, deadline, v, r, s],
      });
      const transferFromCallData = encodeFunctionData({
        abi: erc20PermitAbi,
        functionName: 'transferFrom',
        args: [ownerChecksum, recipient as `0x${string}`, value],
      });
      
      await sendUserOperation({
        calls: [
          { to: SBC_TOKEN_ADDRESS(chain) as `0x${string}`, data: permitCallData },
          { to: SBC_TOKEN_ADDRESS(chain) as `0x${string}`, data: transferFromCallData },
        ],
      });
    } catch (err) {
      console.error('Transaction failed:', err);
    }
  };

  if (!account) return null;

  return (
    <div className="card">
      <h3>💸 Send 1 SBC Token</h3>
      <div className="form-group">
        <label>Recipient Address</label>
        <input
          type="text"
          value={recipient}
          onChange={(e) => setRecipient(e.target.value)}
          placeholder="0x..."
          className={recipient && !isFormValid ? 'error' : ''}
        />
        {recipient && !isFormValid && (
          <span className="error-text">Invalid Ethereum address</span>
        )}
      </div>
      
      <div className="status-section">
        <div className="info-row">
          <label>Amount:</label>
          <div className="value">1.00 SBC</div>
        </div>
        <div className="info-row">
          <label>Gas fees:</label>
          <div className="value">Covered by SBC Paymaster ✨</div>
        </div>
        <div className="info-row">
          <label>Signing:</label>
          <div className="value">Your wallet will prompt to sign 🖊️</div>
        </div>
      </div>

      <button
        onClick={handleSendSBC}
        disabled={!isFormValid || isLoading || !account}
        className="primary"
      >
        {isLoading ? 'Waiting for signature...' : 'Send 1 SBC'}
      </button>

      {isSuccess && data && (
        <div className="success-message">
          <p>✅ Transaction Successful!</p>
          <a 
            href={`${chainExplorer(chain)}/tx/${data.transactionHash}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            View on BaseScan: {data.transactionHash}
          </a>
        </div>
      )}
      
      {isError && opError && (
        <div className="error-message">
          <p>❌ Transaction Failed</p>
          <p>{opError.message}</p>
        </div>
      )}
    </div>
  );
}

function WalletConnectFlow() {
  const { ownerAddress, disconnectWallet, refreshAccount } = useSbcApp();
  const prevOwnerAddress = useRef<string | null>(null);

  useEffect(() => {
    if (ownerAddress && !prevOwnerAddress.current) {
      refreshAccount();
    }
    prevOwnerAddress.current = ownerAddress;
  }, [ownerAddress, refreshAccount]);

  if (!ownerAddress) {
    return (
      <div className="connect-prompt">
        <h3>🔗 Connect Your Wallet</h3>
        <p>Connect your wallet to create a smart account with gasless transactions</p>
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <WalletButton
            walletType="auto"
            onConnect={refreshAccount}
            render={({ onClick, isConnecting }) => (
              <button
                className="primary wallet-connect-btn"
                onClick={onClick}
                disabled={isConnecting}
                style={{ minWidth: 160 }}
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
    <>
      <WalletStatus onDisconnect={disconnectWallet} />
      <SmartAccountInfo />
      <SendSBCForm />
    </>
  );
}

// Add theme context
const ThemeContext = createContext({ isDark: false, toggle: () => {} });

function ThemeToggle() {
  const { isDark, toggle } = useContext(ThemeContext);
  return (
    <button 
      onClick={toggle}
      className="theme-toggle"
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {isDark ? '🌞' : '🌙'}
    </button>
  );
}

export default function App() {
  const sbcConfig = {
    apiKey: import.meta.env.VITE_SBC_API_KEY || 'sbc-9ed6e3d6757659db2ade740eb5046946',
    chain,
    rpcUrl,
    wallet: 'auto' as const,
    debug: true,
    walletOptions: { autoConnect: false },
  };

  // Add theme state
  const [isDark, setIsDark] = useState(() => {
    if (typeof window === 'undefined') return false;
    const saved = localStorage.getItem('theme');
    return saved ? saved === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
  }, [isDark]);

  const themeValue = {
    isDark,
    toggle: () => setIsDark(prev => !prev)
  };

  return (
    <ThemeContext.Provider value={themeValue}>
      <SbcProvider config={sbcConfig}>
        <div className="app">
          <div className="container">
            <header className="app-header">
              <h1>my-app</h1>
              <p>SBC Account Abstraction Demo</p>
            </header>
            <main>
              <WalletConnectFlow />
            </main>
            <footer className="app-footer">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                <span>Powered by</span>
                <img src="/sbc-logo.png" alt="SBC Logo" style={{ width: 20, height: 20, verticalAlign: 'middle' }} />
                <a href="https://github.com/stablecoinxyz/app-kit" target="_blank" rel="noopener noreferrer">
                  SBC App Kit
                </a>
              </div>
            </footer>
          </div>
          <ThemeToggle />
        </div>
      </SbcProvider>
    </ThemeContext.Provider>
  );
}

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
}: {
  publicClient: PublicClient;
  walletClient: WalletClient;
  owner: string;
  spender: string;
  value: bigint;
  tokenAddress: string;
  chainId: number;
  deadline: number;
}): Promise<`0x${string}` | null> {
  try {
    const ownerChecksum = getAddress(owner);
    const spenderChecksum = getAddress(spender);
    
    const nonce = await publicClient.readContract({
      address: tokenAddress as `0x${string}`,
      abi: erc20PermitAbi,
      functionName: 'nonces',
      args: [ownerChecksum],
    });
    
    const tokenName = await publicClient.readContract({
      address: tokenAddress as `0x${string}`,
      abi: erc20PermitAbi,
      functionName: 'name',
    });
    
    const domain = {
      name: tokenName as string,
      version: '1',
      chainId: BigInt(chainId),
      verifyingContract: tokenAddress as `0x${string}`,
    };
    
    const types = {
      EIP712Domain: [
        { name: 'name', type: 'string' },
        { name: 'version', type: 'string' },
        { name: 'chainId', type: 'uint256' },
        { name: 'verifyingContract', type: 'address' },
      ],
      Permit: [
        { name: 'owner', type: 'address' },
        { name: 'spender', type: 'address' },
        { name: 'value', type: 'uint256' },
        { name: 'nonce', type: 'uint256' },
        { name: 'deadline', type: 'uint256' },
      ],
    } as const;
    
    const message = {
      owner: ownerChecksum,
      spender: spenderChecksum,
      value: value,
      nonce: nonce as bigint,
      deadline: BigInt(deadline),
    };
    
    const signature = await walletClient.signTypedData({
      account: ownerChecksum,
      domain,
      types,
      primaryType: 'Permit',
      message,
    });

    return signature;
  } catch (e) {
    console.error('Error in getPermitSignature:', e);
    return null;
  }
} 