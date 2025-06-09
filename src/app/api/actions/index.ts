// /api/actions/index.ts
import {
    VersionedTransaction,
    Connection,
    PublicKey,
  } from '@solana/web3.js';
  
  const RPC_ENDPOINT = 'https://api.mainnet-beta.solana.com';
  const web3Connection = new Connection(RPC_ENDPOINT, 'confirmed');
  
  export type TradeAction = 'buy' | 'sell';
  
  interface SendPortalTransactionParams {
    publicKey: PublicKey;
    action: TradeAction;
    mint: PublicKey;
    amount: number;
    signTransaction: (tx: VersionedTransaction) => Promise<VersionedTransaction>;
  }
  
  /**
   * Sends a trade transaction to pumpportal.fun using Wallet Adapter
   */
  export async function sendPortalTransaction({
    publicKey,
    action,
    mint,
    amount,
    signTransaction,
  }: SendPortalTransactionParams) {
    try {
        const response = await fetch('https://pumpportal.fun/api/trade-local', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                publicKey: publicKey.toBase58(),
                action,                          // 'buy' or 'sell'
                mint: mint.toBase58(),
                denominatedInSol: true,
                amount,
                slippage: 10,
                priorityFee: 0.00001,
                pool: 'auto',
            }),
        });
  
        if (response.ok) {
            const data = await response.arrayBuffer();
            const tx = VersionedTransaction.deserialize(new Uint8Array(data));

            // Sign using Wallet Adapter
            const signedTx = await signTransaction(tx);

            // Send the signed transaction to the network
            const signature = await web3Connection.sendTransaction(signedTx);
            console.log('Transaction:', `https://solscan.io/tx/${signature}`);
        } else {
            const error = await response.text();
            console.error('Error fetching transaction:', response.status, error);
        }
    } catch (err) {
        console.error('Error during transaction:', err);
    }
  }
  