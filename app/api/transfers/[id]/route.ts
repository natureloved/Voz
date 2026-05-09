import { NextResponse } from 'next/server';
import { getTransfer } from '@/lib/transfers';

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  try {
    const transfer = await getTransfer(params.id);
    if (!transfer) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(transfer);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
