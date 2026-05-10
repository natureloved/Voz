import { NextResponse } from 'next/server';
import { createTransfer, listTransfersBySender, TransferSchema } from '@/lib/transfers';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const evmAddress = searchParams.get('evmAddress');
    if (!evmAddress) {
      return NextResponse.json({ error: 'evmAddress is required' }, { status: 400 });
    }
    const transfers = await listTransfersBySender(evmAddress);
    return NextResponse.json(transfers);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = TransferSchema.omit({ createdAt: true }).safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 });
    }
    const transfer = await createTransfer(parsed.data);
    return NextResponse.json(transfer, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
