import { NextResponse } from 'next/server';
import { getContacts, createContact, ContactInputSchema } from '@/lib/contacts';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const evmAddress = searchParams.get('evmAddress');
  if (!evmAddress) return NextResponse.json({ error: 'evmAddress required' }, { status: 400 });

  try {
    const contacts = await getContacts(evmAddress);
    return NextResponse.json(contacts);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const { searchParams } = new URL(req.url);
  const evmAddress = searchParams.get('evmAddress');
  if (!evmAddress) return NextResponse.json({ error: 'evmAddress required' }, { status: 400 });

  try {
    const body = await req.json();
    const parsed = ContactInputSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 });
    }
    const contact = await createContact(evmAddress, parsed.data);
    return NextResponse.json(contact, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
