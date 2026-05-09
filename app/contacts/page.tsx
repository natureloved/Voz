'use client';

import * as React from 'react';
import { useAccount } from 'wagmi';
import type { Contact } from '@/lib/contacts';
import { ContactList } from '@/components/contacts/ContactList';
import { ContactForm } from '@/components/contacts/ContactForm';
import { WalletBar } from '@/components/wallet/WalletBar';
import { Button } from '@/components/ui/Button';
import { Plus, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

export default function ContactsPage() {
  const { address } = useAccount();
  const [contacts, setContacts] = React.useState<Contact[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [showForm, setShowForm] = React.useState(false);
  const [editingContact, setEditingContact] = React.useState<Contact | null>(null);

  React.useEffect(() => {
    if (!address) { setLoading(false); return; }
    fetch(`/api/contacts?evmAddress=${address}`)
      .then((r) => r.json())
      .then((data) => setContacts(Array.isArray(data) ? data : []))
      .finally(() => setLoading(false));
  }, [address]);

  function handleSaved(contact: Contact) {
    setContacts((prev: Contact[]) => {
      const idx = prev.findIndex((c: Contact) => c.id === contact.id);
      if (idx >= 0) { const next = [...prev]; next[idx] = contact; return next; }
      return [...prev, contact];
    });
    setShowForm(false);
    setEditingContact(null);
  }

  function handleDeleted(id: string) {
    setContacts((prev: Contact[]) => prev.filter((c: Contact) => c.id !== id));
  }

  const formOpen = showForm || editingContact !== null;

  return (
    <main className="min-h-screen bg-cream flex flex-col">
      <WalletBar />
      <div className="flex-1 w-full max-w-md mx-auto px-4 py-6 sm:py-8 space-y-6">
        <div className="flex items-center gap-3">
          <Link href="/send" className="text-ocean/40 hover:text-ocean transition-colors">
            <ArrowLeft size={20} />
          </Link>
          <h1 className="text-xl sm:text-2xl font-display font-bold text-ocean">Contacts</h1>
          <div className="flex-1" />
          {!formOpen && address && (
            <Button
              onClick={() => setShowForm(true)}
              className="bg-ocean text-cream gap-2 h-9 text-sm px-4"
            >
              <Plus size={15} /> Add
            </Button>
          )}
        </div>

        {!address && (
          <div className="text-center py-16 text-ocean/50">
            <p className="text-sm">Connect your EVM wallet to manage contacts.</p>
          </div>
        )}

        {address && (
          <>
            <AnimatePresence>
              {formOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <ContactForm
                    initial={editingContact ?? undefined}
                    evmAddress={address}
                    onSave={handleSaved}
                    onCancel={() => { setShowForm(false); setEditingContact(null); }}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {loading ? (
              <div className="text-center py-16 text-ocean/30 text-sm animate-pulse">Loading contacts…</div>
            ) : (
              <ContactList
                contacts={contacts}
                evmAddress={address}
                onEdit={(c) => { setEditingContact(c); setShowForm(false); }}
                onDeleted={handleDeleted}
              />
            )}
          </>
        )}
      </div>
    </main>
  );
}
