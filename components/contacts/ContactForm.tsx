'use client';

import * as React from 'react';
import type { Contact, ContactInput } from '@/lib/contacts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { X } from 'lucide-react';

interface ContactFormProps {
  initial?: Partial<Contact>;
  evmAddress: string;
  onSave: (contact: Contact) => void;
  onCancel: () => void;
  prefillName?: string;
}

export function ContactForm({ initial, evmAddress, onSave, onCancel, prefillName }: ContactFormProps) {
  const [name, setName] = React.useState(initial?.name ?? prefillName ?? '');
  const [solanaAddress, setSolanaAddress] = React.useState(initial?.solanaAddress ?? '');
  const [language, setLanguage] = React.useState<'en' | 'es'>(initial?.language ?? 'en');
  const [email, setEmail] = React.useState(initial?.email ?? '');
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [saving, setSaving] = React.useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrors({});

    const newErrors: Record<string, string> = {};
    if (!name.trim()) newErrors.name = 'Name is required';
    if (!solanaAddress.trim()) newErrors.solanaAddress = 'Solana address is required';
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) newErrors.email = 'Invalid email';

    if (Object.keys(newErrors).length) { setErrors(newErrors); return; }

    setSaving(true);
    try {
      const payload: ContactInput = {
        name: name.trim(),
        solanaAddress: solanaAddress.trim(),
        language,
        email: email.trim() || undefined,
      };

      const url = initial?.id
        ? `/api/contacts/${initial.id}?evmAddress=${evmAddress}`
        : `/api/contacts?evmAddress=${evmAddress}`;
      const method = initial?.id ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        setErrors({ form: data.error?.formErrors?.join(', ') ?? 'Save failed' });
        return;
      }

      const saved: Contact = await res.json();
      onSave(saved);
    } catch {
      setErrors({ form: 'Network error' });
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="pb-3 flex flex-row items-center justify-between">
        <CardTitle className="text-lg">{initial?.id ? 'Edit Contact' : 'Add Contact'}</CardTitle>
        <button onClick={onCancel} className="text-ocean/40 hover:text-ocean transition-colors">
          <X size={18} />
        </button>
      </CardHeader>
      <CardContent className="p-4 sm:p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          {errors.form && (
            <p className="text-xs text-coral bg-coral/10 rounded-lg px-3 py-2">{errors.form}</p>
          )}

          <div>
            <label className="text-xs font-semibold text-ocean/50 uppercase tracking-wider mb-1.5 block">Name</label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Maria García" className="bg-ocean/5 border-none" />
            {errors.name && <p className="text-xs text-coral mt-1">{errors.name}</p>}
          </div>

          <div>
            <label className="text-xs font-semibold text-ocean/50 uppercase tracking-wider mb-1.5 block">Solana Address</label>
            <Input
              value={solanaAddress}
              onChange={(e) => setSolanaAddress(e.target.value)}
              placeholder="So1xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
              className="bg-ocean/5 border-none font-mono text-sm"
            />
            {errors.solanaAddress && <p className="text-xs text-coral mt-1">{errors.solanaAddress}</p>}
          </div>

          <div>
            <label className="text-xs font-semibold text-ocean/50 uppercase tracking-wider mb-1.5 block">Preferred Language</label>
            <div className="flex gap-2">
              {(['en', 'es'] as const).map((lang) => (
                <button
                  key={lang}
                  type="button"
                  onClick={() => setLanguage(lang)}
                  className={`flex-1 py-3 sm:py-2.5 rounded-lg text-sm font-semibold transition-colors min-h-[44px] ${
                    language === lang ? 'bg-ocean text-cream' : 'bg-ocean/5 text-ocean/60 hover:bg-ocean/10'
                  }`}
                >
                  {lang === 'en' ? 'English' : 'Español'}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-ocean/50 uppercase tracking-wider mb-1.5 block">Email (optional)</label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="maria@example.com"
              className="bg-ocean/5 border-none"
            />
            {errors.email && <p className="text-xs text-coral mt-1">{errors.email}</p>}
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="ghost" className="flex-1" onClick={onCancel}>Cancel</Button>
            <Button type="submit" className="flex-1 bg-ocean text-cream" disabled={saving}>
              {saving ? 'Saving...' : 'Save Contact'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
