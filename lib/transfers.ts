import { z } from 'zod';
import { kv, keys } from './kv';
import { connection } from './solana';

export const TransferSchema = z.object({
  id: z.string(),
  amount: z.number(),
  fromChain: z.number(),
  toSolanaAddress: z.string(),
  recipientName: z.string().optional(),
  recipientLanguage: z.enum(['en', 'es']),
  recipientEmail: z.string().optional(),
  senderName: z.string().optional(),
  senderEmail: z.string().optional(),
  senderEvmAddress: z.string().optional(),
  senderMessageOriginal: z.string(),
  senderLanguage: z.enum(['en', 'es']),
  occasion: z.string().optional(),
  txHash: z.string(),
  status: z.enum(['pending', 'confirmed']),
  createdAt: z.string(),
  translatedMessage: z.string().optional(),
});

export type Transfer = z.infer<typeof TransferSchema>;

export async function createTransfer(data: Omit<Transfer, 'createdAt'>): Promise<Transfer> {
  const transfer: Transfer = {
    ...data,
    createdAt: new Date().toISOString(),
  };
  await kv.set(keys.transfer(transfer.id), transfer);

  if (transfer.senderEvmAddress) {
    const senderKey = keys.transfersBySender(transfer.senderEvmAddress);
    const existing = (((await kv.get(senderKey)) as string[] | null) ?? []);
    await kv.set(senderKey, [transfer.id, ...existing]);
  }

  return transfer;
}

export async function listTransfersBySender(evmAddress: string): Promise<Transfer[]> {
  const ids = (((await kv.get(keys.transfersBySender(evmAddress))) as string[] | null) ?? []);
  const results = await Promise.all(ids.map((id: string) => getTransfer(id)));
  const transfers = results.filter((t): t is Transfer => t !== null);

  // Auto-confirm pending transfers that have a real txHash
  const toCheck = transfers.filter(
    (t) => t.status === 'pending' && t.txHash && t.txHash !== 'pending',
  );
  if (toCheck.length > 0) {
    await Promise.allSettled(
      toCheck.map(async (t) => {
        const confirmed = await isTxConfirmed(t.txHash);
        if (confirmed) {
          await updateTransfer(t.id, { status: 'confirmed' });
          t.status = 'confirmed';
        }
      }),
    );
  }

  return transfers;
}

async function isTxConfirmed(txHash: string): Promise<boolean> {
  // EVM txHash — assume confirmed if the hash exists (bridge won't record it until done)
  if (txHash.startsWith('0x')) return true;
  try {
    const tx = await connection.getTransaction(txHash, {
      commitment: 'confirmed',
      maxSupportedTransactionVersion: 0,
    });
    return tx !== null;
  } catch {
    return false;
  }
}

export async function getTransfer(id: string): Promise<Transfer | null> {
  return (await kv.get(keys.transfer(id))) as Transfer | null;
}
export async function updateTransfer(id: string, data: Partial<Transfer>): Promise<Transfer | null> {
  const transfer = await getTransfer(id);
  if (!transfer) return null;
  const updated = { ...transfer, ...data };
  await kv.set(keys.transfer(id), updated);
  return updated;
}
