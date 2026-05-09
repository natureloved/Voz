import { NextResponse } from 'next/server';
import { updateContact, deleteContact, ContactInputSchema } from '@/lib/contacts';

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const { searchParams } = new URL(req.url);
  const evmAddress = searchParams.get('evmAddress');
  if (!evmAddress) return NextResponse.json({ error: 'evmAddress required' }, { status: 400 });

  try {
    const body = await req.json();
    const parsed = ContactInputSchema.partial().safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 });
    }
    const updated = await updateContact(evmAddress, params.id, parsed.data);
    if (!updated) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(updated);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const { searchParams } = new URL(req.url);
  const evmAddress = searchParams.get('evmAddress');
  if (!evmAddress) return NextResponse.json({ error: 'evmAddress required' }, { status: 400 });

  try {
    const deleted = await deleteContact(evmAddress, params.id);
    if (!deleted) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return new NextResponse(null, { status: 204 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
