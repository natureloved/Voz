'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { Check, Copy, Mail, Loader2, ExternalLink } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { cn, truncateAddress } from '@/lib/cn';

interface StepDoneProps {
  claimId: string;
  claimUrl: string;
  recipientName?: string;
  recipientAddress?: string;
  recipientSolanaAddress?: string;
  recipientEmail?: string;
  senderEvmAddress?: string;
  fromChain?: number;
  amount: number;
  message?: string;
  txHash?: string;
  txLink?: string;
  recipientLanguage: 'en' | 'es';
}

export function StepDone({
  claimId,
  claimUrl,
  recipientName,
  recipientAddress,
  recipientSolanaAddress,
  recipientEmail: prefilledEmail,
  senderEvmAddress,
  fromChain,
  amount,
  message,
  txHash,
  txLink,
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
      fromChain: fromChain ?? 0,
      toSolanaAddress: recipientSolanaAddress ?? '',
      recipientName,
      recipientLanguage,
      recipientEmail: prefilledEmail,
      senderEvmAddress,
      senderMessageOriginal: message ?? '',
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
    <div className="max-w-xl mx-auto py-6 sm:py-12 px-4 sm:px-6">
      {/* Animated checkmark */}
      <motion.div
        initial={{ scale: 0, rotate: -90 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 200, damping: 15 }}
        className="w-16 h-16 sm:w-20 sm:h-20 mx-auto rounded-full bg-gold flex items-center justify-center mb-6 sm:mb-8"
      >
        <Check className="w-8 h-8 sm:w-10 sm:h-10 text-ocean" strokeWidth={3} />
      </motion.div>

      {/* Headline */}
      <div className="text-center mb-6 sm:mb-10">
        <h2 className="font-display text-2xl sm:text-4xl text-ocean mb-2 break-words">
          ${amount} sent to {recipientName ? recipientName : truncateAddress(recipientAddress ?? '')}
        </h2>
        {recipientName && recipientAddress && (
          <p className="font-mono text-sm text-ocean/50 mt-1">
            {truncateAddress(recipientAddress)}
          </p>
        )}
        <p className="text-ocean/60 mt-2">
          Now share the claim link so they can hear your message
        </p>
        {txHash && txHash !== 'pending' && (
          <a
            href={txLink || `https://solscan.io/tx/${txHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 mt-3 text-sm text-coral hover:underline font-mono"
          >
            View transaction ({truncateAddress(txHash)}) <ExternalLink className="w-3 h-3" />
          </a>
        )}
      </div>

      {/* Email card — primary action */}
      <div className="bg-white border border-coral/30 rounded-2xl p-4 sm:p-6 mb-4">
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

      {/* QR Code + copy link card */}
      <div className="bg-cream border border-ocean/10 rounded-2xl p-4 sm:p-6 overflow-hidden">
        <p className="text-sm font-semibold text-ocean/70 uppercase tracking-wide mb-4">
          Or share anywhere
        </p>

        {/* QR code — scan to open claim page on any phone */}
        <div className="flex flex-col items-center gap-4">
          <div className="bg-white rounded-xl p-3 border border-ocean/10 self-center">
            <QRCodeSVG
              value={claimUrl}
              size={140}
              bgColor="#ffffff"
              fgColor="#0A2540"
              level="M"
            />
          </div>
          <p className="text-xs text-ocean/50 text-center">
            Point any phone camera at this code to open the claim page and hear the voice message
          </p>
          <div className="flex gap-2 w-full min-w-0">
            <div className="flex-1 min-w-0 px-3 py-2.5 rounded-lg bg-white border border-ocean/10 font-mono text-xs text-ocean/60 truncate">
              {claimUrl}
            </div>
            <button
              onClick={handleCopy}
              className={cn(
                'px-4 py-2.5 rounded-lg font-semibold transition-all text-sm',
                'border border-ocean/20 hover:border-ocean/40 hover:bg-white',
                'flex items-center gap-1.5 shrink-0 justify-center',
                copied ? 'text-gold border-gold' : 'text-ocean'
              )}
            >
              {copied ? <><Check className="w-3.5 h-3.5" /> Copied</> : <><Copy className="w-3.5 h-3.5" /> Copy</>}
            </button>
          </div>
          <p className="text-xs text-ocean/40 text-center -mt-2">
            Also works via WhatsApp, Telegram, iMessage, or email
          </p>
        </div>
      </div>
    </div>
  );
}
