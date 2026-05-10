import { NextResponse } from 'next/server';
import { scanKeys, kv, keys } from '@/lib/kv';
import { TransferSchema } from '@/lib/transfers';

// POST /api/admin/backfill-history?evmAddress=0x...
// Scans all voz:transfer:* keys and indexes unowned transfers under the given EVM address.
// Safe to call multiple times — skips transfers already indexed.
export async function POST(req: Request) {
  const { searchParams } = new URL(req.url);
  const evmAddress = searchParams.get('evmAddress');
  if (!evmAddress) {
    return NextResponse.json({ error: 'evmAddress is required' }, { status: 400 });
  }

  try {
    const transferKeys = await scanKeys('voz:transfer:*');
    const senderKey = keys.transfersBySender(evmAddress);
    const existingIds = ((await kv.get(senderKey)) as string[] | null) ?? [];
    const existingSet = new Set(existingIds);

    let indexed = 0;
    const newIds = [...existingIds];

    for (const k of transferKeys) {
      const raw = await kv.get(k);
      const parsed = TransferSchema.safeParse(raw);
      if (!parsed.success) continue;
      const transfer = parsed.data;

      if (existingSet.has(transfer.id)) continue;

      // Index the transfer and stamp the sender address on the record
      newIds.unshift(transfer.id);
      existingSet.add(transfer.id);
      if (!transfer.senderEvmAddress) {
        await kv.set(k, { ...transfer, senderEvmAddress: evmAddress.toLowerCase() });
      }
      indexed++;
    }

    if (indexed > 0) {
      await kv.set(senderKey, newIds);
    }

    return NextResponse.json({ indexed, total: transferKeys.length });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
