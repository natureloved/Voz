import { NextResponse } from 'next/server';
import { getTransfer, updateTransfer } from '@/lib/transfers';
import { z } from 'zod';

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  try {
    const transfer = await getTransfer(params.id);
    if (!transfer) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(transfer);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

const PatchSchema = z.object({
  status: z.enum(['pending', 'confirmed']).optional(),
  txHash: z.string().optional(),
});

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();
    const parsed = PatchSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 });
    }
    const updated = await updateTransfer(params.id, parsed.data);
    if (!updated) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(updated);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
