'use client';

import * as React from 'react';
import type { Contact } from '@/lib/contacts';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check } from 'lucide-react';

interface ContactPickerProps {
  contacts: Contact[];
  onSelect: (contact: Contact) => void;
  onClose: () => void;
}

export function ContactPicker({ contacts, onSelect, onClose }: ContactPickerProps) {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-ocean/40 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 40, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="w-full max-w-sm bg-cream rounded-2xl shadow-xl overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between px-5 pt-5 pb-3">
            <h3 className="font-display font-bold text-ocean text-lg">Choose recipient</h3>
            <button onClick={onClose} className="text-ocean/40 hover:text-ocean transition-colors">
              <X size={18} />
            </button>
          </div>
          <p className="px-5 text-sm text-ocean/50 pb-3">Multiple contacts found. Select one:</p>
          <ul className="px-3 pb-4 space-y-2">
            {contacts.map((contact) => (
              <li key={contact.id}>
                <button
                  onClick={() => onSelect(contact)}
                  className="w-full flex items-center gap-3 p-3.5 sm:p-3 rounded-xl hover:bg-ocean/5 transition-colors text-left min-h-[52px]"
                >
                  <div className="w-11 h-11 rounded-full bg-ocean/10 flex items-center justify-center shrink-0 font-display font-bold text-ocean text-sm">
                    {contact.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-ocean">{contact.name}</p>
                    <p className="text-xs font-mono text-ocean/50 truncate">{contact.solanaAddress}</p>
                  </div>
                  <Check size={16} className="text-ocean/20 shrink-0" />
                </button>
              </li>
            ))}
          </ul>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
