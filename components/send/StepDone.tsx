'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { Check, Copy, Mail, Loader2, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/cn';

interface StepDoneProps {
  claimId: string;
  claimUrl: string;
  recipientName?: string;
  recipientEmail?: string;
  amount: number;
  txHash?: string;
  recipientLanguage: 'en' | 'es';
}

export function StepDone({
  claimId,
  claimUrl,
  recipientName,
  recipientEmail: prefilledEmail,
  amount,
  txHash,
  recipientLanguage,
}: StepDoneProps) {
  const [email, setEmail] = React.useState(prefilledEmail ?? '');
  const [emailStatus, setEmailStatus] = React.useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [copied, setCopied] = React.useState(false);
  const [audioPlayed, setAudioPlayed] = React.useState(false);
  const didCreate = React.useRef(false);

  // Create transfer record on mount (once)
  React.useEffect(() => {
    if (didCreate.current) return;
    didCreate.current = true;

    const transferPayload = {
      id: claimId,
      amount,
      fromChain: 0,
      toSolanaAddress: '',
      recipientName,
      recipientLanguage,
      recipientEmail: prefilledEmail,
      senderMessageOriginal: '',
      senderLanguage: 'en',
      occasion: 'General',
      txHash: txHash || 'pending',
      status: txHash ? 'confirmed' : 'pending',
    };

    (async () => {
      try {
        await fetch('/api/transfers', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(transferPayload),
        });
      } catch (err) {
        console.error('Error creating transfer record:', err);
      }
    })();
  }, [claimId, amount, txHash, recipientName, recipientLanguage, prefilledEmail]);

  // Auto-play TTS confirmation
  React.useEffect(() => {
    if (audioPlayed) return;

    const finalName = recipientName ?? 'the recipient';
    const confirmationText = recipientLanguage === 'es'
      ? `${amount} dólares enviados a ${finalName}. Recibirá un mensaje de voz.`
      : `${amount} dollars sent to ${finalName}. They'll get a voice message.`;

    async function playConfirmation() {
      try {
        const res = await fetch('/api/tts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: confirmationText, language: recipientLanguage }),
        });
        if (!res.ok) return;
        const audioBlob = await res.blob();
        const audioUrl = URL.createObjectURL(audioBlob);
        const audio = new Audio(audioUrl);
        await audio.play();
        setAudioPlayed(true);
      } catch {
        // TTS is non-critical
      }
    }

    const timer = setTimeout(playConfirmation, 1200);
    return () => clearTimeout(timer);
  }, [amount, recipientName, recipientLanguage, audioPlayed]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(claimUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleEmail = async () => {
    if (!email || !email.includes('@')) return;
    setEmailStatus('sending');
    try {
      const res = await fetch('/api/emails/send-claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transferId: claimId,
          recipientEmail: email,
          recipientLanguage,
        }),
      });
      if (!res.ok) throw new Error('Failed to send');
      setEmailStatus('sent');
    } catch {
      setEmailStatus('error');
      setTimeout(() => setEmailStatus('idle'), 3000);
    }
  };

  return (
    <div className="max-w-xl mx-auto py-12 px-6">
      {/* Animated checkmark */}
      <motion.div
        initial={{ scale: 0, rotate: -90 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 200, damping: 15 }}
        className="w-20 h-20 mx-auto rounded-full bg-gold flex items-center justify-center mb-8"
      >
        <Check className="w-10 h-10 text-ocean" strokeWidth={3} />
      </motion.div>

      {/* Headline */}
      <div className="text-center mb-10">
        <h2 className="font-display text-4xl text-ocean mb-2">
          ${amount} sent{recipientName ? ` to ${recipientName}` : ''}
        </h2>
        <p className="text-ocean/60">
          Now share the claim link so they can hear your message
        </p>
        {txHash && txHash !== 'pending' && (
          <a
            href={`https://solscan.io/tx/${txHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 mt-3 text-sm text-coral hover:underline font-mono"
          >
            View on Solscan <ExternalLink className="w-3 h-3" />
          </a>
        )}
      </div>

      {/* Email card — primary action */}
      <div className="bg-white border border-coral/30 rounded-2xl p-6 mb-4">
        <div className="flex items-center gap-2 mb-3">
          <Mail className="w-4 h-4 text-coral" />
          <p className="text-sm font-semibold text-ocean uppercase tracking-wide">
            Send by email
          </p>
        </div>
        <div className="flex gap-2">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="recipient@example.com"
            disabled={emailStatus === 'sending' || emailStatus === 'sent'}
            className="flex-1 px-4 py-3 rounded-lg border border-ocean/20 bg-cream
                       text-ocean placeholder:text-ocean/40
                       focus:outline-none focus:border-coral focus:ring-2 focus:ring-coral/20
                       disabled:opacity-60"
          />
          <button
            onClick={handleEmail}
            disabled={
              !email.includes('@') ||
              emailStatus === 'sending' ||
              emailStatus === 'sent'
            }
            className={cn(
              'px-4 py-3 rounded-lg font-semibold text-cream transition-all',
              'bg-coral hover:bg-coral/90',
              'disabled:bg-ocean/20 disabled:text-ocean/40 disabled:cursor-not-allowed',
              'flex items-center gap-2 justify-center'
            )}
          >
            {emailStatus === 'sending' && (
              <Loader2 className="w-4 h-4 animate-spin" />
            )}
            {emailStatus === 'sent' && <Check className="w-4 h-4" />}
            {emailStatus === 'idle' && 'Send'}
            {emailStatus === 'error' && 'Retry'}
          </button>
        </div>
        {emailStatus === 'sent' && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-3 text-sm text-ocean/70"
          >
            ✓ Email sent. They'll get the claim link in their inbox.
          </motion.p>
        )}
        {emailStatus === 'error' && (
          <p className="mt-3 text-sm text-coral">
            Couldn't send. Try again or copy the link below.
          </p>
        )}
      </div>

      {/* Copy link card — secondary action */}
      <div className="bg-cream border border-ocean/10 rounded-2xl p-6">
        <p className="text-sm font-semibold text-ocean/70 uppercase tracking-wide mb-3">
          Or share anywhere
        </p>
        <div className="flex gap-2">
          <div className="flex-1 px-4 py-3 rounded-lg bg-white border border-ocean/10 font-mono text-sm text-ocean/70 truncate">
            {claimUrl}
          </div>
          <button
            onClick={handleCopy}
            className={cn(
              'px-5 py-3 rounded-lg font-semibold transition-all',
              'border border-ocean/20 hover:border-ocean/40 hover:bg-white',
              'flex items-center gap-2 min-w-[100px] justify-center',
              copied ? 'text-gold border-gold' : 'text-ocean'
            )}
          >
            {copied ? (
              <>
                <Check className="w-4 h-4" /> Copied
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" /> Copy
              </>
            )}
          </button>
        </div>
        <p className="mt-3 text-xs text-ocean/50">
          Paste into WhatsApp, Telegram, iMessage, or anywhere else
        </p>
      </div>
    </div>
  );
}
