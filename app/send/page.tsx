'use client';

import * as React from 'react';
import { Route } from '@lifi/sdk';
import { PaymentIntent } from '@/lib/intent-schema';
import { Contact } from '@/lib/contacts';
import { TranscribeResponse } from '@/hooks/useTranscribe';
import { WalletBar } from '@/components/wallet/WalletBar';
import { StepVoice } from '@/components/send/StepVoice';
import { StepReview } from '@/components/send/StepReview';
import { StepQuote } from '@/components/send/StepQuote';
import { StepExecute } from '@/components/send/StepExecute';
import { StepDone } from '@/components/send/StepDone';
import { motion, AnimatePresence } from 'framer-motion';
import { useAccount } from 'wagmi';
import Link from 'next/link';
import { Sparkles, X, ArrowRight } from 'lucide-react';

type SendStep = 'voice' | 'review' | 'quote' | 'execute' | 'done';

export default function SendPage() {
  const [step, setStep] = React.useState<SendStep>('voice');
  const [transcript, setTranscript] = React.useState<TranscribeResponse | null>(null);
  const [intent, setIntent] = React.useState<PaymentIntent | null>(null);
  const [route, setRoute] = React.useState<Route | null>(null);
  const [executedRoute, setExecutedRoute] = React.useState<Route | null>(null);
  const [resolvedContact, setResolvedContact] = React.useState<Contact | null>(null);
  const [claimId] = React.useState(() => crypto.randomUUID());
  const [isParsing, setIsParsing] = React.useState(false);
  const [parseError, setParseError] = React.useState<string | null>(null);

  const { address } = useAccount();
  const [hasNoContacts, setHasNoContacts] = React.useState(false);
  const [hideTip, setHideTip] = React.useState(false);

  React.useEffect(() => {
    if (!address) return;
    fetch(`/api/contacts?evmAddress=${address}`)
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data) && data.length === 0) {
          setHasNoContacts(true);
        }
      })
      .catch(() => {});
  }, [address]);

  const handleTranscribe = async (data: TranscribeResponse) => {
    setTranscript(data);
    setIsParsing(true);
    setParseError(null);

    try {
      const res = await fetch('/api/parse-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transcript: data.text, language: data.language }),
      });

      if (!res.ok) throw new Error('Intent parsing failed');

      const parsedIntent = await res.json();

      // Detect hard-fail fallback (amount=0 + empty recipient)
      if (parsedIntent.amount === 0 && !parsedIntent.recipient?.value) {
        setParseError("Couldn't understand that. Try saying e.g. \"Send 20 dollars to Maria\".");
        return;
      }

      setIntent(parsedIntent);
      setStep('review');
    } catch (err) {
      console.error('Parse intent error:', err);
      setParseError('Something went wrong. Please try again.');
    } finally {
      setIsParsing(false);
    }
  };

  const handleReviewConfirm = (confirmedIntent: PaymentIntent, contact?: Contact) => {
    setIntent(confirmedIntent);
    setResolvedContact(contact ?? null);
    setStep('quote');
  };

  const handleBackToVoice = () => {
    setIntent(null);
    setStep('voice');
  };

  const handleQuoteConfirm = (confirmedRoute: Route) => {
    setRoute(confirmedRoute);
    setStep('execute');
  };

  const handleExecuteComplete = (completedRoute: Route) => {
    setExecutedRoute(completedRoute);
    setStep('done');
  };

  // Progress indicator dots
  const steps: SendStep[] = ['voice', 'review', 'quote', 'execute', 'done'];
  const stepLabels: Record<SendStep, string> = {
    voice: 'Speak', review: 'Review', quote: 'Quote', execute: 'Send', done: 'Done',
  };

  return (
    <main className="min-h-screen bg-cream flex flex-col">
      <WalletBar />

      {/* Progress bar */}
      <div className="w-full max-w-md mx-auto pt-6 sm:pt-8 px-4">
        <div className="flex items-center justify-between">
          {steps.map((s, i) => {
            const isActive = steps.indexOf(step) >= i;
            const isCurrent = step === s;
            return (
              <React.Fragment key={s}>
                <div className="flex flex-col items-center gap-1.5">
                  <motion.div
                    animate={{
                      backgroundColor: isActive ? '#F5C842' : '#0A2540',
                      opacity: isActive ? 1 : 0.15,
                      scale: isCurrent ? 1.2 : 1,
                    }}
                    className="w-3 h-3 rounded-full"
                  />
                  <span className={`text-[10px] font-medium ${isActive ? 'text-ocean' : 'text-ocean/30'}`}>
                    {stepLabels[s]}
                  </span>
                </div>
                {i < steps.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-1 mb-5 ${
                    steps.indexOf(step) > i ? 'bg-gold' : 'bg-ocean/10'
                  }`} />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Step content */}
      <div className="flex-1 px-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25 }}
          >
            {step === 'voice' && (
              <div className="relative">
                <AnimatePresence>
                  {hasNoContacts && !hideTip && (
                    <motion.div
                      initial={{ opacity: 0, y: -10, height: 0 }}
                      animate={{ opacity: 1, y: 0, height: 'auto' }}
                      exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                      className="max-w-md mx-auto mb-6 bg-gold/10 border border-gold/30 rounded-xl p-4 relative overflow-hidden"
                    >
                      <button
                        onClick={() => setHideTip(true)}
                        className="absolute top-3 right-3 text-ocean/40 hover:text-ocean transition-colors"
                        aria-label="Dismiss"
                      >
                        <X size={16} />
                      </button>
                      <div className="flex items-start gap-3 pr-4">
                        <div className="p-2 rounded-lg bg-gold/20 text-gold mt-0.5 shrink-0">
                          <Sparkles size={18} />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-display font-bold text-ocean text-sm mb-1">New to Voz?</h3>
                          <p className="text-sm text-ocean/70 leading-relaxed mb-2">
                            You can send directly by speaking, but voice transfers are <strong>even easier</strong> if you add contacts first!
                          </p>
                          <Link
                            href="/contacts"
                            className="inline-flex items-center gap-1.5 text-sm font-bold text-coral hover:opacity-80 transition-all"
                          >
                            Add a contact <ArrowRight size={14} />
                          </Link>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
                <StepVoice transcript={transcript} onTranscribe={handleTranscribe} />
                {isParsing && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center text-ocean/60 text-sm animate-pulse mt-4"
                  >
                    Parsing your intent with AI...
                  </motion.div>
                )}
                {parseError && !isParsing && (
                  <motion.div
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-4 text-center text-sm text-coral font-medium bg-coral/5 border border-coral/20 rounded-lg px-4 py-3 max-w-md mx-auto"
                  >
                    {parseError}
                  </motion.div>
                )}
              </div>
            )}

            {step === 'review' && intent && (
              <StepReview intent={intent} onConfirm={handleReviewConfirm} onBack={handleBackToVoice} />
            )}

            {step === 'quote' && intent && (
              <StepQuote intent={intent} onQuoteConfirm={handleQuoteConfirm} />
            )}

            {step === 'execute' && route && (
              <StepExecute route={route} onComplete={handleExecuteComplete} />
            )}

            {step === 'done' && intent && (
              <StepDone
                claimId={claimId}
                claimUrl={typeof window !== 'undefined' ? `${window.location.origin}/claim/${claimId}` : ''}
                recipientName={resolvedContact?.name ?? intent.recipient?.value}
                recipientEmail={resolvedContact?.email}
                amount={intent.amount}
                txHash={extractTxHash(executedRoute)}
                recipientLanguage={(resolvedContact?.language ?? intent.language) === 'es' ? 'es' : 'en'}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </main>
  );
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

export const dynamic = 'force-dynamic';
