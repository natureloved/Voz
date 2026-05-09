import { z } from 'zod';
import { PublicKey } from '@solana/web3.js';
import { kv, keys } from './kv';

export const ContactSchema = z.object({
  id: z.string(),
  name: z.string().min(1, 'Name is required'),
  solanaAddress: z.string().refine((addr) => {
    try { new PublicKey(addr); return true; } catch { return false; }
  }, 'Invalid Solana address'),
  language: z.enum(['en', 'es']),
  email: z.string().email('Invalid email').optional().or(z.literal('')).transform(v => v || undefined),
  createdAt: z.string(),
});

export const ContactInputSchema = ContactSchema.omit({ id: true, createdAt: true });

export type Contact = z.infer<typeof ContactSchema>;
export type ContactInput = z.infer<typeof ContactInputSchema>;

export async function getContacts(evmAddress: string): Promise<Contact[]> {
  const data = (await kv.get(keys.contacts(evmAddress))) as Contact[] | null;
  return data ?? [];
}

export async function saveContacts(evmAddress: string, contacts: Contact[]): Promise<void> {
  await kv.set(keys.contacts(evmAddress), contacts);
}

export async function createContact(evmAddress: string, input: ContactInput): Promise<Contact> {
  const contacts = await getContacts(evmAddress);
  const contact: Contact = {
    ...input,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  };
  await saveContacts(evmAddress, [...contacts, contact]);
  return contact;
}

export async function updateContact(
  evmAddress: string,
  id: string,
  data: Partial<ContactInput>
): Promise<Contact | null> {
  const contacts = await getContacts(evmAddress);
  const idx = contacts.findIndex((c) => c.id === id);
  if (idx === -1) return null;
  const updated = { ...contacts[idx], ...data };
  contacts[idx] = updated;
  await saveContacts(evmAddress, contacts);
  return updated;
}

export async function deleteContact(evmAddress: string, id: string): Promise<boolean> {
  const contacts = await getContacts(evmAddress);
  const filtered = contacts.filter((c) => c.id !== id);
  if (filtered.length === contacts.length) return false;
  await saveContacts(evmAddress, filtered);
  return true;
}

export function fuzzyMatch(contacts: Contact[], name: string): Contact[] {
  const lower = name.toLowerCase();
  return contacts.filter((c) => c.name.toLowerCase().includes(lower));
}
