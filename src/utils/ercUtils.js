import { encodeFunctionData, erc20Abi } from 'viem';
import { publicClient, chain, SBC_TOKEN_ADDRESS, SBC_DECIMALS } from '../config/rpc';

export const erc20PermitAbi = [
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

export const permitAbi = [
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

export async function getPermitSignature({
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
        const [tokenName, tokenVersion] = await Promise.all([
            publicClient.readContract({
                address: tokenAddress,
                abi: erc20PermitAbi,
                functionName: 'name',
            }).catch(() => 'SBC'),
            publicClient.readContract({
                address: tokenAddress,
                abi: erc20PermitAbi,
                functionName: 'version',
            }).catch(() => '1'),
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

        const signature = await walletClient.signTypedData({
            domain,
            types,
            primaryType: 'Permit',
            message,
        });

        return signature;
    } catch (error) {
        return null;
    }
}

export async function fetchWalletBalance(ownerAddress) {
    if (!ownerAddress) {
        return '0';
    }

    try {
        const balance = await publicClient.readContract({
            address: SBC_TOKEN_ADDRESS(chain),
            abi: erc20Abi,
            functionName: 'balanceOf',
            args: [ownerAddress],
        });

        return balance.toString();
    } catch (error) {
        return '0';
    }
}

export function formatSbcBalance(balance) {
    if (!balance) return '0.0000';
    try {
        return (Number(balance) / Math.pow(10, SBC_DECIMALS(chain))).toFixed(4);
    } catch {
        return '0.0000';
    }
}

export async function getSmartAccountBalance(accountAddress) {
    if (!accountAddress) {
        return '0';
    }

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
}

export function createPermitCallData({ owner, spender, value, deadline, v, r, s }) {
    return encodeFunctionData({
        abi: permitAbi,
        functionName: 'permit',
        args: [owner, spender, value, deadline, v, r, s],
    });
}

export function createTransferFromCallData({ from, to, value }) {
    return encodeFunctionData({
        abi: erc20PermitAbi,
        functionName: 'transferFrom',
        args: [from, to, value],
    });
}
