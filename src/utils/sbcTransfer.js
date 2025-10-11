import { parseUnits, encodeFunctionData, getAddress } from 'viem';
import { erc20Abi } from 'viem';
import { chain, SBC_TOKEN_ADDRESS, SBC_DECIMALS } from '../config/rpc';

// Main function to send SBC tokens from smart account
export async function sendSBCTransfer({
  account,
  sendUserOperation,
  recipientAddress = '0x1b2A56827892ccB83AA2679075aF1bf6E1c3B7C0', // Default recipient
  amount = '0.01' // Default amount in SBC
}) {
  if (!account) {
    throw new Error('Missing smart account for SBC transfer');
  }
  
  try {
    const recipientChecksum = getAddress(recipientAddress);
    const value = parseUnits(amount, SBC_DECIMALS(chain));
    
    // Direct transfer from smart account using ERC20 transfer function
    const transferCallData = encodeFunctionData({
      abi: erc20Abi,
      functionName: 'transfer',
      args: [recipientChecksum, value],
    });
    
    const result = await sendUserOperation({
      calls: [
        { to: SBC_TOKEN_ADDRESS(chain), data: transferCallData },
      ],
    });

    return result;
  } catch (err) {
    console.error('SBC transfer failed:', err);
    throw err;
  }
}
