'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { useAccount } from 'wagmi';
import { Route } from '@lifi/sdk';
import { PaymentIntent } from '@/lib/intent-schema';
import type { Contact } from '@/lib/contacts';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Copy, Check, Mail } from 'lucide-react';

interface StepDoneProps {
  intent: PaymentIntent;
  claimId: string;
  executedRoute: Route | null;
  resolvedContact: Contact | null;
}

function extractTxHash(route: Route | null): string {
  if (!route) return '';
  for (const step of route.steps) {
    const ext = step as any;
    const processes: any[] = ext.execution?.process ?? [];
    const cross = processes.find((p: any) => p.type === 'CROSS_CHAIN' || p.type === 'SEND' || p.type === 'RECEIVING_CHAIN');
    if (cross?.txHash) return cross.txHash;
  }
  return '';
}

export function StepDone({ intent, claimId, executedRoute, resolvedContact }: StepDoneProps) {
  const { address: evmAddress } = useAccount();
  const [copied, setCopied] = React.useState(false);
  const [audioPlayed, setAudioPlayed] = React.useState(false);
  const audioRef = React.useRef<HTMLAudioElement | null>(null);
  const didCreate = React.useRef(false);

  const appUrl = typeof window !== 'undefined' ? window.location.origin : (process.env.NEXT_PUBLIC_APP_URL ?? '');
  const claimUrl = `${appUrl}/claim/${claimId}`;

  // Create transfer record + fire email on mount (once)
  React.useEffect(() => {
    if (didCreate.current) return;
    didCreate.current = true;

    const txHash = extractTxHash(executedRoute);
    const toSolanaAddress = intent.recipient?.value ?? '';
    const fromChain = (executedRoute?.steps?.[0] as any)?.action?.fromChainId ?? 0;

    const transferPayload = {
      id: claimId,
      amount: intent.amount,
      fromChain,
      toSolanaAddress,
      recipientName: resolvedContact?.name,
      recipientLanguage: resolvedContact?.language ?? intent.language,
      recipientEmail: resolvedContact?.email,
      senderMessageOriginal: intent.message ?? '',
      senderLanguage: intent.language,
      occasion: intent.occasion,
      txHash: txHash || 'pending',
      status: txHash ? 'confirmed' : 'pending',
    };

    // Fire transfer creation + email non-blockingly
    (async () => {
      try {
        await fetch('/api/transfers', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(transferPayload),
        });

        if (resolvedContact?.email || /* sender email not tracked yet */ false) {
          fetch('/api/emails/send-claim', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              transferId: claimId,
              amount: intent.amount,
              senderName: evmAddress ? `${evmAddress.slice(0, 6)}…${evmAddress.slice(-4)}` : undefined,
              senderLanguage: intent.language,
              recipientName: resolvedContact?.name,
              recipientEmail: resolvedContact?.email,
              recipientLanguage: resolvedContact?.language ?? intent.language,
              txHash,
              claimUrl,
            }),
          }).catch(() => {/* non-blocking */});
        }
      } catch {
        // Non-blocking — don't block the success UI
      }
    })();
  }, [claimId, evmAddress, intent, executedRoute, resolvedContact, claimUrl]);

  // Auto-play TTS confirmation
  React.useEffect(() => {
    if (audioPlayed) return;

    const recipientName = resolvedContact?.name ?? intent.recipient?.value ?? 'the recipient';
    const confirmationText = intent.language === 'es'
      ? `${intent.amount} dólares enviados a ${recipientName}. Recibirá un mensaje de voz.`
      : `${intent.amount} dollars sent to ${recipientName}. They'll get a voice message.`;

    async function playConfirmation() {
      try {
        const res = await fetch('/api/tts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: confirmationText, language: intent.language }),
        });
        if (!res.ok) return;
        const audioBlob = await res.blob();
        const audioUrl = URL.createObjectURL(audioBlob);
        const audio = new Audio(audioUrl);
        audioRef.current = audio;
        await audio.play();
        setAudioPlayed(true);
      } catch {
        // TTS is non-critical
      }
    }

    const timer = setTimeout(playConfirmation, 1200);
    return () => clearTimeout(timer);
  }, [intent, resolvedContact, audioPlayed]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(claimUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="py-8 sm:py-12 space-y-6 sm:space-y-8 max-w-md mx-auto flex flex-col items-center">
      {/* Animated checkmark */}
      <motion.div className="relative w-24 h-24 sm:w-32 sm:h-32 flex items-center justify-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 12 }}
          className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-gold/20 flex items-center justify-center"
        >
          <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
            <motion.path
              d="M16 32L28 44L48 20"
              stroke="#F5C842"
              strokeWidth="5"
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.6, delay: 0.3, ease: 'easeOut' }}
            />
          </svg>
        </motion.div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="text-center space-y-2"
      >
        <h2 className="text-2xl sm:text-3xl font-display font-bold text-ocean">Sent!</h2>
        <p className="text-ocean/60 font-sans">
          <span className="font-mono font-semibold">${intent.amount}</span> USDC to{' '}
          <span className="font-semibold">{resolvedContact?.name ?? intent.recipient?.value}</span>
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.0 }}
        className="w-full"
      >
        <Card className="border-ocean/10">
          <CardContent className="p-6 space-y-4">
            <div>
              <label className="text-xs font-semibold text-ocean/50 uppercase tracking-wider mb-2 block">
                Claim Link
              </label>
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-ocean/5 rounded-lg px-3 py-2.5 font-mono text-xs text-ocean truncate">
                  {claimUrl}
                </div>
                <button
                  onClick={handleCopy}
                  className="shrink-0 p-2.5 rounded-lg bg-ocean/5 hover:bg-ocean/10 text-ocean transition-colors"
                >
                  {copied ? <Check size={16} /> : <Copy size={16} />}
                </button>
              </div>
            </div>

            {resolvedContact?.email ? (
              <p className="text-xs text-ocean/50 text-center">
                Email sent to <span className="font-semibold">{resolvedContact.email}</span>
              </p>
            ) : (
              <Button className="w-full h-12 bg-ocean hover:bg-ocean/90 text-cream gap-2" onClick={handleCopy}>
                <Mail size={18} />
                Copy &amp; Share Link
              </Button>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
