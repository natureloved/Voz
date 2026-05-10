'use client';

import * as React from 'react';
import { useAccount } from 'wagmi';
import { PaymentIntent } from '@/lib/intent-schema';
import type { Contact } from '@/lib/contacts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { ContactPicker } from '@/components/contacts/ContactPicker';
import { ContactForm } from '@/components/contacts/ContactForm';
import { Check, AlertCircle, UserRound, UserPlus, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { truncateAddress } from '@/lib/cn';

interface IntentReviewProps {
  intent: PaymentIntent;
  onConfirm: (intent: PaymentIntent, resolvedContact?: Contact, recipientName?: string) => void;
  onBack?: () => void;
}

export function IntentReview({ intent, onConfirm, onBack }: IntentReviewProps) {
  const { address } = useAccount();
  const [editedIntent, setEditedIntent] = React.useState(intent);
  const [resolvedContact, setResolvedContact] = React.useState<Contact | null>(null);
  const [recipientName, setRecipientName] = React.useState<string>(() =>
    intent.recipient?.kind === 'name' ? (intent.recipient?.value ?? '') : ''
  );
  const [contactMatches, setContactMatches] = React.useState<Contact[] | null>(null);
  const [showPicker, setShowPicker] = React.useState(false);
  const [showQuickAdd, setShowQuickAdd] = React.useState(false);
  const [lookupDone, setLookupDone] = React.useState(false);

  const isHighConfidence = intent.confidence === 'high';
  const isNameRecipient = editedIntent.recipient?.kind === 'name';

  // Contact lookup when recipient is a name
  React.useEffect(() => {
    if (!isNameRecipient || !address || lookupDone) return;
    setLookupDone(true);

    fetch(`/api/contacts?evmAddress=${address}`)
      .then((r) => r.json())
      .then((contacts: Contact[]) => {
        if (!Array.isArray(contacts)) return;
        const lower = editedIntent.recipient?.value?.toLowerCase() ?? '';
        if (!lower) return;
        const matches = contacts.filter((c: Contact) => c.name.toLowerCase().includes(lower));
        if (matches.length === 1) {
          // Auto-select single match
          setResolvedContact(matches[0]);
          setEditedIntent((prev: PaymentIntent) => ({
            ...prev,
            recipient: { kind: 'address', value: matches[0].solanaAddress },
          }));
        } else if (matches.length > 1) {
          setContactMatches(matches);
          setShowPicker(true);
        } else {
          // Zero matches → offer quick-add
          setContactMatches([]);
        }
      })
      .catch(() => {/* no-op — proceed without contact lookup */});
  }, [isNameRecipient, address, editedIntent.recipient?.value, lookupDone]);

  function handlePickerSelect(contact: Contact) {
    setResolvedContact(contact);
    setRecipientName(contact.name);
    setShowPicker(false);
    setEditedIntent((prev: PaymentIntent) => ({
      ...prev,
      recipient: { kind: 'address', value: contact.solanaAddress },
    }));
  }

  function handleQuickAddSaved(contact: Contact) {
    setResolvedContact(contact);
    setRecipientName(contact.name);
    setShowQuickAdd(false);
    setContactMatches(null);
    setEditedIntent((prev: PaymentIntent) => ({
      ...prev,
      recipient: { kind: 'address', value: contact.solanaAddress },
    }));
  }

  return (
    <>
      {showPicker && contactMatches && (
        <ContactPicker
          contacts={contactMatches}
          onSelect={handlePickerSelect}
          onClose={() => setShowPicker(false)}
        />
      )}

      <Card className="w-full max-w-md mx-auto animate-in fade-in zoom-in-95">
        <CardHeader className="pb-4 border-b border-ocean/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {onBack && (
                <button
                  onClick={onBack}
                  className="text-ocean/40 hover:text-ocean transition-colors"
                  aria-label="Back to voice"
                >
                  <ArrowLeft size={20} />
                </button>
              )}
              <CardTitle className="text-xl">Review Details</CardTitle>
            </div>
            {isHighConfidence ? (
              <div className="flex items-center gap-1.5 bg-gold/20 text-gold px-2.5 py-1 rounded-full text-xs font-bold">
                <Check size={14} /> Looks right
              </div>
            ) : (
              <div className="flex items-center gap-1.5 bg-coral/20 text-coral px-2.5 py-1 rounded-full text-xs font-bold">
                <AlertCircle size={14} /> Confirm details
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          {!isHighConfidence && intent.ambiguities && intent.ambiguities.length > 0 && (
            <div className="bg-coral/5 border border-coral/20 rounded-lg p-4 space-y-2">
              <h4 className="text-sm font-semibold text-coral flex items-center gap-2">
                <AlertCircle size={16} /> Needs Clarification
              </h4>
              <ul className="text-sm text-coral/80 list-disc pl-5 space-y-1">
                {intent.ambiguities.map((amb: string, i: number) => <li key={i}>{amb}</li>)}
              </ul>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-ocean/50 uppercase tracking-wider mb-1.5 block">Amount (USD)</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl sm:text-2xl font-mono text-ocean/50">$</span>
                <Input
                  type="number"
                  value={editedIntent.amount}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditedIntent({ ...editedIntent, amount: parseFloat(e.target.value) || 0 })}
                  className="font-mono text-2xl sm:text-4xl h-auto py-3 pl-10 bg-ocean/5 border-none"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-ocean/50 uppercase tracking-wider mb-1.5 block">Recipient</label>

              {/* Resolved contact banner */}
              <AnimatePresence>
                {resolvedContact && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-2 bg-gold/10 border border-gold/30 rounded-lg px-3 py-2 mb-2"
                  >
                    <UserRound size={14} className="text-gold shrink-0" />
                    <span className="text-xs font-semibold text-ocean">
                      {resolvedContact.name}
                    </span>
                    <span className="text-xs font-mono text-ocean/50 truncate">
                      {truncateAddress(resolvedContact.solanaAddress)}
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>

              <Input
                value={editedIntent.recipient?.value || ''}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  setEditedIntent({ ...editedIntent, recipient: { kind: 'address', value: e.target.value } });
                  setResolvedContact(null);
                }}
                className="bg-ocean/5 border-none font-mono text-sm"
                placeholder="Solana address or name"
              />

              <div className="mt-3">
                <label className="text-xs font-semibold text-ocean/50 uppercase tracking-wider mb-1.5 block">
                  Recipient name (optional)
                </label>
                <Input
                  value={recipientName}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setRecipientName(e.target.value)}
                  className="bg-ocean/5 border-none text-sm"
                  placeholder="e.g. Maria"
                />
              </div>

              {/* Zero-match inline message */}
              <AnimatePresence>
                {contactMatches !== null && contactMatches.length === 0 && !resolvedContact && !showQuickAdd && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-2 flex items-center gap-2 bg-coral/5 border border-coral/20 rounded-lg px-3 py-2"
                  >
                    <AlertCircle size={13} className="text-coral shrink-0" />
                    <span className="text-xs text-coral/80 flex-1">
                      No contact named &ldquo;{intent.recipient?.value}&rdquo; found.
                    </span>
                    {address && (
                      <button
                        onClick={() => setShowQuickAdd(true)}
                        className="text-xs font-semibold text-coral underline underline-offset-2 flex items-center gap-1 shrink-0"
                      >
                        <UserPlus size={12} /> Add contact
                      </button>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {editedIntent.occasion && (
              <div>
                <label className="text-xs font-semibold text-ocean/50 uppercase tracking-wider mb-1.5 block">Occasion</label>
                <Input
                  value={editedIntent.occasion}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditedIntent({ ...editedIntent, occasion: e.target.value })}
                  className="bg-ocean/5 border-none text-ocean/70"
                />
              </div>
            )}
          </div>

          {/* Quick-add drawer */}
          <AnimatePresence>
            {showQuickAdd && address && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="border-t border-ocean/10 pt-4">
                  <ContactForm
                    prefillName={intent.recipient?.value}
                    evmAddress={address}
                    onSave={handleQuickAddSaved}
                    onCancel={() => setShowQuickAdd(false)}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <Button
            className="w-full text-lg h-12"
            onClick={() => onConfirm(editedIntent, resolvedContact ?? undefined, recipientName || undefined)}
          >
            {isHighConfidence ? 'Continue' : 'Confirm & Continue'}
          </Button>
        </CardContent>
      </Card>
    </>
  );
}
