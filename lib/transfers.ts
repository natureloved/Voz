import { z } from 'zod';
import { kv, keys } from './kv';

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
  return transfer;
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
