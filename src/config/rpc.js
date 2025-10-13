import { createPublicClient, http, fallback } from 'viem';
import { base } from 'viem/chains';

const baseRpcUrls = [
    'https://mainnet.base.org',
    'https://base-mainnet.g.alchemy.com/v2/demo',
    'https://base-mainnet.public.blastapi.io',
];

const createBaseTransport = () => {
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
