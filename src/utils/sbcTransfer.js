import { parseUnits, encodeFunctionData, getAddress } from 'viem';
import { erc20Abi } from 'viem';
import { chain, SBC_TOKEN_ADDRESS, SBC_DECIMALS } from '../config/rpc';

export async function sendSBCTransfer({
  account,
  sendUserOperation,
  recipientAddress = import.meta.env.VITE_DEFAULT_RECIPIENT_ADDRESS || '',
  amount
}) {
  if (!account) {
    throw new Error('Missing smart account for SBC transfer');
  }
  
  if (!recipientAddress) {
    throw new Error('Recipient address not configured. Please set VITE_DEFAULT_RECIPIENT_ADDRESS environment variable.');
  }
  
  try {
    const recipientChecksum = getAddress(recipientAddress);
    const value = parseUnits(amount, SBC_DECIMALS(chain));
    
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
    throw err;
  }
}
