import { createPublicClient, http, fallback } from 'viem';
import { base } from 'viem/chains';

const baseRpcUrls = [
    import.meta.env.VITE_BASE_RPC_URL_1 || '',
    import.meta.env.VITE_BASE_RPC_URL_2 || '',
    import.meta.env.VITE_BASE_RPC_URL_3 || '',
].filter(url => url);

const createBaseTransport = () => {
    if (baseRpcUrls.length === 0) {
        throw new Error('No RPC URLs configured. Please set VITE_BASE_RPC_URL_1, VITE_BASE_RPC_URL_2, and/or VITE_BASE_RPC_URL_3 environment variables.');
    }
    
    const transports = baseRpcUrls.map(url =>
        http(url, {
            timeout: 10000,
            retryCount: 2,
            retryDelay: 1000,
        })
    );

    return fallback(transports);
};

export const publicClient = createPublicClient({
    chain: base,
    transport: createBaseTransport()
});

export const chain = base;

export const SBC_TOKEN_ADDRESS = (chain) => {
    if (chain.id === base.id) {
        const address = import.meta.env.VITE_SBC_TOKEN_ADDRESS || '';
        if (!address) {
            throw new Error('SBC token address not configured. Please set VITE_SBC_TOKEN_ADDRESS environment variable.');
        }
        return address;
    }
    throw new Error('Unsupported chain');
};

export const SBC_DECIMALS = (chain) => {
    if (chain.id === base.id) {
        return 18;
    }
    throw new Error('Unsupported chain');
};
