import { Connection, PublicKey, Keypair } from '@solana/web3.js';
import { findReference, validateTransfer } from '@solana/pay';
import BigNumber from 'bignumber.js';

const getSolanaConnection = () => {
  const url = process.env.SOLANA_RPC_URL || 'https://api.devnet.solana.com';
  if (!url.startsWith('http')) {
     console.warn('SOLANA_RPC_URL is invalid. Using default devnet.');
     return new Connection('https://api.devnet.solana.com', 'confirmed');
  }
  return new Connection(url, 'confirmed');
};

const connection = getSolanaConnection();
const USDC_MINT = new PublicKey(process.env.NEXT_PUBLIC_SOLANA_USDC_MINT || '4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU');

export async function verifySolanaPayment(reference: string, amount: number, recipient: string) {
  try {
    const referencePubkey = new PublicKey(reference);
    const recipientPubkey = new PublicKey(recipient);
    
    // Find the transaction with the reference
    const signatureInfo = await findReference(connection, referencePubkey, { finality: 'confirmed' });
    
    // Validate the transfer
    const response = await validateTransfer(connection, signatureInfo.signature, {
      recipient: recipientPubkey,
      amount: new BigNumber(amount),
      splToken: USDC_MINT,
      reference: referencePubkey,
    });
    
    return { success: true, transaction: response };
  } catch (error) {
    console.error('Payment verification failed:', error);
    return { success: false, error };
  }
}

export function generatePaymentReference() {
  return Keypair.generate().publicKey.toBase58();
}
