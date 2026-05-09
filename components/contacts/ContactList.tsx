'use client';

import * as React from 'react';
import type { Contact } from '@/lib/contacts';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Pencil, Trash2, Globe, Mail } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ContactListProps {
  contacts: Contact[];
  evmAddress: string;
  onEdit: (contact: Contact) => void;
  onDeleted: (id: string) => void;
}

export function ContactList({ contacts, evmAddress, onEdit, onDeleted }: ContactListProps) {
  const [deletingId, setDeletingId] = React.useState<string | null>(null);

  async function handleDelete(id: string) {
    setDeletingId(id);
    try {
      await fetch(`/api/contacts/${id}?evmAddress=${evmAddress}`, { method: 'DELETE' });
      onDeleted(id);
    } finally {
      setDeletingId(null);
    }
  }

  if (contacts.length === 0) {
    return (
      <div className="text-center py-16 text-ocean/40">
        <Globe size={40} className="mx-auto mb-3 opacity-30" />
        <p className="text-sm">No contacts yet. Add someone to get started.</p>
      </div>
    );
  }

  return (
    <ul className="space-y-3">
      <AnimatePresence initial={false}>
        {contacts.map((contact) => (
          <motion.li
            key={contact.id}
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8, height: 0, marginBottom: 0 }}
          >
            <Card className="border-ocean/10">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="w-11 h-11 rounded-full bg-ocean/10 flex items-center justify-center shrink-0 font-display font-bold text-ocean text-sm">
                  {contact.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-ocean">{contact.name}</p>
                    <span className="text-[10px] font-bold text-ocean/40 uppercase tracking-wider">
                      {contact.language}
                    </span>
                  </div>
                  <p className="text-xs font-mono text-ocean/50 truncate">{contact.solanaAddress}</p>
                  {contact.email && (
                    <p className="text-xs text-ocean/40 flex items-center gap-1 mt-0.5">
                      <Mail size={10} /> {contact.email}
                    </p>
                  )}
                </div>
                <div className="flex gap-1 shrink-0">
                  <button
                    onClick={() => onEdit(contact)}
                    className="p-2.5 rounded-lg text-ocean/40 hover:text-ocean hover:bg-ocean/5 transition-colors"
                  >
                    <Pencil size={15} />
                  </button>
                  <button
                    onClick={() => handleDelete(contact.id)}
                    disabled={deletingId === contact.id}
                    className="p-2.5 rounded-lg text-coral/40 hover:text-coral hover:bg-coral/5 transition-colors disabled:opacity-40"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </CardContent>
            </Card>
          </motion.li>
        ))}
      </AnimatePresence>
    </ul>
  );
}
