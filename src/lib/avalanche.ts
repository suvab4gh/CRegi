import { createWalletClient, createPublicClient, http, parseAbi } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { avalancheFuji } from 'viem/chains';

const SETTLEMENT_ABI = parseAbi([
  'function recordSettlement(bytes32 invoiceId, address merchant, uint256 amount, string solanaTx, string circleTransferId) external'
]);

const RPC_URL = process.env.AVALANCHE_RPC_URL || 'https://api.avax-test.network/ext/bc/C/rpc';
const PRIVATE_KEY = process.env.AVALANCHE_PRIVATE_KEY;
const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_SETTLEMENT_CONTRACT_ADDRESS as `0x${string}`;

export async function recordOnAvalanche(
  invoiceId: string,
  merchantAddress: string,
  amount: number,
  solanaTx: string,
  circleId: string
) {
  if (!RPC_URL || !RPC_URL.startsWith('http')) {
    console.error('Invalid Avalanche RPC_URL. Cannot record on-chain.');
    return '0xerror_invalid_rpc';
  }

  if (!PRIVATE_KEY) {
    console.warn('AVALANCHE_PRIVATE_KEY not set. Simulating Avalanche record.');
    return '0xsimulated_tx_' + Math.random().toString(16).substring(2);
  }

  const account = privateKeyToAccount(PRIVATE_KEY as `0x${string}`);
  const client = createWalletClient({
    account,
    chain: avalancheFuji,
    transport: http(RPC_URL)
  });

  const publicClient = createPublicClient({
    chain: avalancheFuji,
    transport: http(RPC_URL)
  });

  try {
    // In real app, we'd deploy the contract first.
    // For now, this serves as the integration logic.
    const { request } = await publicClient.simulateContract({
      account,
      address: CONTRACT_ADDRESS,
      abi: SETTLEMENT_ABI,
      functionName: 'recordSettlement',
      args: [
        invoiceId as `0x${string}`,
        merchantAddress as `0x${string}`,
        BigInt(Math.floor(amount * 10**6)), // USDC decimals
        solanaTx,
        circleId
      ]
    });

    const hash = await client.writeContract(request);
    return hash;
  } catch (error) {
    console.error('Avalanche record failed:', error);
    throw error;
  }
}
