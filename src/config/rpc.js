import { createPublicClient, http, fallback } from 'viem';
import { base } from 'viem/chains';

// Base mainnet RPC endpoints with fallbacks
const baseRpcUrls = [
    'https://mainnet.base.org',
    'https://base-mainnet.g.alchemy.com/v2/demo', // Alchemy fallback
    'https://base-mainnet.public.blastapi.io', // BlastAPI fallback
];

// Create a fallback transport that tries multiple RPC endpoints
const createBaseTransport = () => {
    const transports = baseRpcUrls.map(url =>
        http(url, {
            timeout: 10000, // 10 second timeout
            retryCount: 2, // Retry up to 2 times
            retryDelay: 1000, // 1 second delay between retries
        })
    );

    return fallback(transports);
};

// Create the public client with fallback transport
export const publicClient = createPublicClient({
    chain: base,
    transport: createBaseTransport()
});

// Chain configuration
export const chain = base;

// SBC Token configuration
export const SBC_TOKEN_ADDRESS = (chain) => {
    if (chain.id === base.id) {
        return '0xfdcC3dd6671eaB0709A4C0f3F53De9a333d80798';
    }
    throw new Error('Unsupported chain');
};

export const SBC_DECIMALS = (chain) => {
    if (chain.id === base.id) {
        return 18;
    }
    throw new Error('Unsupported chain');
};
