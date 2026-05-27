'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  DEMO_TRANSCRIPT, DEMO_INTENT, DEMO_ROUTE,
  DEMO_TIMELINE, DEMO_TRANSFER_BASE, DEMO_CONTACT, DEMO_TX_HASH,
} from '@/lib/demo-mode';
import { RouteCard } from '@/components/send/RouteCard';
import { Button } from '@/components/ui/Button';
import { Check, Loader2, Mic, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/Card';
import { StepDone } from '@/components/send/StepDone';
import { LocalCashOut } from '@/components/claim/LocalCashOut';
import { SUPPORTED_CURRENCIES, SupportedCurrency } from '@/lib/fx';

type DemoStep = 'voice' | 'review' | 'quote' | 'execute' | 'done';

interface TimelineEntry {
  id: string;
  label: string;
  status: 'pending' | 'active' | 'done';
}

export default function DemoPage() {
  const [step, setStep] = React.useState<DemoStep>('voice');
  const [typedText, setTypedText] = React.useState('');
  const [claimId] = React.useState(() => crypto.randomUUID());
  const [timeline, setTimeline] = React.useState<TimelineEntry[]>(
    DEMO_TIMELINE.map((t) => ({ id: t.id, label: t.label, status: 'pending' }))
  );
  const executionStarted = React.useRef(false);

  // Typewriter effect for voice step
  React.useEffect(() => {
    if (step !== 'voice') return;
    let i = 0;
    const interval = setInterval(() => {
      i++;
      setTypedText(DEMO_TRANSCRIPT.slice(0, i));
      if (i >= DEMO_TRANSCRIPT.length) clearInterval(interval);
    }, 38);
    return () => clearInterval(interval);
  }, [step]);

  // Mock execution timeline
  React.useEffect(() => {
    if (step !== 'execute' || executionStarted.current) return;
    executionStarted.current = true;

    DEMO_TIMELINE.forEach(({ id, activateAt, doneAt }) => {
      setTimeout(() => {
        setTimeline((prev) => prev.map((t) => t.id === id ? { ...t, status: 'active' } : t));
      }, activateAt);
      setTimeout(() => {
        setTimeline((prev) => prev.map((t) => t.id === id ? { ...t, status: 'done' } : t));
      }, doneAt);
    });

    const totalDuration = DEMO_TIMELINE[DEMO_TIMELINE.length - 1].doneAt + 600;
    setTimeout(async () => {
      // Create the real transfer record so the claim page works
      try {
        await fetch('/api/transfers', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: claimId, ...DEMO_TRANSFER_BASE }),
        });
      } catch { /* non-blocking */ }
      setStep('done');
    }, totalDuration);
  }, [step, claimId]);

  const steps: DemoStep[] = ['voice', 'review', 'quote', 'execute', 'done'];
  const stepLabels: Record<DemoStep, string> = {
    voice: 'Speak', review: 'Review', quote: 'Quote', execute: 'Send', done: 'Done',
  };

  return (
    <main className="min-h-screen bg-cream flex flex-col">
      {/* Demo nav */}
      <div className="sticky top-0 z-50 bg-cream/80 backdrop-blur border-b border-ocean/10 py-3 px-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 text-ocean/40 hover:text-ocean transition-colors">
          <ArrowLeft size={16} />
          <span className="text-sm">Back</span>
        </Link>
        <div className="flex items-center gap-2">
          <Link href="/" className="font-display font-bold text-ocean text-xl tracking-tight hover:opacity-90 transition-opacity">
            Voz<span className="text-coral">.</span>
          </Link>
          <span className="text-[10px] font-bold bg-coral/15 text-coral px-2 py-0.5 rounded-full uppercase tracking-wider">
            Demo
          </span>
        </div>
        <div className="w-16" />
      </div>

      {/* Progress */}
      <div className="w-full max-w-md mx-auto pt-6 px-4">
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
                  <div className={`flex-1 h-0.5 mx-1 mb-5 transition-colors duration-700 ${steps.indexOf(step) > i ? 'bg-gold' : 'bg-ocean/10'}`} />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      <div className="flex-1 px-4 max-w-md mx-auto w-full">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3 }}
          >
            {step === 'voice' && (
              <DemoVoiceStep
                typedText={typedText}
                ready={typedText.length >= DEMO_TRANSCRIPT.length}
                onContinue={() => setStep('review')}
              />
            )}

            {step === 'review' && (
              <DemoReviewStep onContinue={() => setStep('quote')} />
            )}

            {step === 'quote' && (
              <DemoQuoteStep onContinue={() => setStep('execute')} />
            )}

            {step === 'execute' && (
              <DemoExecuteStep timeline={timeline} />
            )}

            {step === 'done' && (
              <>
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-coral/10 border border-coral/20 rounded-lg px-4 py-3 mb-6 text-center max-w-xl mx-auto"
                >
                  <p className="text-sm text-coral">
                    ✨ <strong>Demo mode</strong> — try the email flow with your own address
                  </p>
                </motion.div>

                <StepDone
                  claimId={claimId}
                  claimUrl={typeof window !== 'undefined' ? `${window.location.origin}/claim/${claimId}` : ''}
                  recipientName={DEMO_CONTACT.name}
                  recipientSolanaAddress={DEMO_CONTACT.solanaAddress}
                  recipientEmail=""
                  amount={DEMO_TRANSFER_BASE.amount}
                  fromChain={DEMO_TRANSFER_BASE.fromChain}
                  message={DEMO_INTENT.message ?? ''}
                  txHash={DEMO_TX_HASH}
                  recipientLanguage={DEMO_CONTACT.language}
                />

                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.4 }}
                  className="mt-6 pb-12"
                >
                  <DemoCashOutPreview recipientName={DEMO_CONTACT.name} />
                </motion.div>
              </>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </main>
  );
}

// ── Voice step ────────────────────────────────────────────────
function DemoVoiceStep({
  typedText,
  ready,
  onContinue,
}: {
  typedText: string;
  ready: boolean;
  onContinue: () => void;
}) {
  return (
    <div className="py-5 sm:py-10 flex flex-col items-center space-y-6 sm:space-y-10">
      <div className="text-center space-y-2">
        <h2 className="text-2xl sm:text-3xl font-display font-bold text-ocean">Who to pay?</h2>
        <p className="text-ocean/50 text-sm">Demo: watch the AI parse your voice</p>
      </div>

      {/* Mic visual */}
      <div className="relative w-24 h-24 flex items-center justify-center">
        {ready && [1, 2].map((i) => (
          <motion.div
            key={i}
            className="absolute rounded-full border-2 border-coral/30"
            style={{ width: 24 + i * 28, height: 24 + i * 28 } as any}
            animate={{ scale: [1, 1.2, 1], opacity: [0.6, 0.1, 0.6] }}
            transition={{ duration: 1.6, delay: i * 0.5, repeat: Infinity }}
          />
        ))}
        <div className="w-20 h-20 rounded-full bg-ocean flex items-center justify-center shadow-lg">
          <Mic size={32} className="text-cream" />
        </div>
      </div>

      {/* Transcript card */}
      <div className="w-full rounded-2xl border border-ocean/10 bg-ocean/[0.03] p-5 min-h-[72px] flex items-center">
        <p className="font-mono text-ocean/80 text-sm leading-relaxed">
          {typedText}
          {!ready && <span className="animate-pulse">|</span>}
        </p>
      </div>

      <AnimatePresence>
        {ready && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full space-y-3"
          >
            <div className="flex items-center gap-2 text-xs text-ocean/50 justify-center">
              <div className="w-2 h-2 rounded-full bg-gold animate-pulse" />
              Detected: English · Confidence: High
            </div>
            <Button className="w-full h-12 text-base" onClick={onContinue}>
              Review intent →
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Review step ────────────────────────────────────────────────
function DemoReviewStep({ onContinue }: { onContinue: () => void }) {
  return (
    <div className="py-5 sm:py-10 space-y-5">
      <div className="text-center space-y-1">
        <h2 className="text-2xl sm:text-3xl font-display font-bold text-ocean">Review Details</h2>
        <p className="text-sm text-ocean/50">AI parsed your intent</p>
      </div>

      <Card>
        <CardContent className="p-6 space-y-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-ocean/40 uppercase tracking-wider">Confidence</span>
            <div className="flex items-center gap-1.5 bg-gold/20 text-gold px-2.5 py-1 rounded-full text-xs font-bold">
              <Check size={12} /> High
            </div>
          </div>

          <div className="space-y-4">
            <Field label="Amount" value="$25.00 USD" mono />
            <Field label="Recipient" value="Maria García" />
            <div>
              <span className="text-xs font-semibold text-ocean/40 uppercase tracking-wider mb-1.5 block">Resolved contact</span>
              <div className="flex items-center gap-2 bg-gold/10 border border-gold/20 rounded-lg px-3 py-2">
                <div className="w-6 h-6 rounded-full bg-ocean flex items-center justify-center text-[10px] font-bold text-cream shrink-0">M</div>
                <span className="text-sm font-semibold text-ocean">Maria García</span>
                <span className="text-xs font-mono text-ocean/40 truncate">7xKX…gAsU</span>
                <span className="ml-auto text-[10px] font-bold text-ocean/30 uppercase">ES</span>
              </div>
            </div>
            <Field label="Message" value={`"${DEMO_INTENT.message}"`} />
            <Field label="Occasion" value="Birthday 🎂" />
          </div>

          <Button className="w-full h-12 text-base" onClick={onContinue}>
            Get route quote →
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

function Field({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <span className="text-xs font-semibold text-ocean/40 uppercase tracking-wider mb-1 block">{label}</span>
      <p className={`text-ocean ${mono ? 'font-mono text-2xl font-bold' : 'text-sm'}`}>{value}</p>
    </div>
  );
}

// ── Quote step ────────────────────────────────────────────────
function DemoQuoteStep({ onContinue }: { onContinue: () => void }) {
  return (
    <div className="py-5 sm:py-10 space-y-5">
      <div className="text-center space-y-2">
        <h2 className="text-2xl sm:text-3xl font-display font-bold text-ocean">Route Quote</h2>
        <p className="text-ocean/60 text-sm">
          Bridging <span className="font-mono font-semibold">$25.00</span> USDC to Solana
        </p>
      </div>

      <RouteCard route={DEMO_ROUTE as any} />

      <div className="rounded-xl bg-ocean/[0.03] border border-ocean/10 px-5 py-4 text-sm text-ocean/60 space-y-1">
        <div className="flex justify-between">
          <span>You send</span>
          <span className="font-mono font-semibold text-ocean">25.0000 USDC</span>
        </div>
        <div className="flex justify-between">
          <span>Maria receives</span>
          <span className="font-mono font-semibold text-ocean">24.8700 USDC</span>
        </div>
      </div>

      <Button className="w-full h-12 text-base" onClick={onContinue}>
        Execute transfer →
      </Button>
    </div>
  );
}

// ── Cash-out preview (done step) ────────────────────────────────
function DemoCashOutPreview({ recipientName }: { recipientName: string }) {
  const [currency, setCurrency] = React.useState<SupportedCurrency>('MXN');

  return (
    <div className="space-y-3">
      {/* Framing header */}
      <div className="flex items-center gap-2 px-1">
        <div className="flex-1 h-px bg-ocean/10" />
        <p className="text-[11px] font-semibold text-ocean/35 uppercase tracking-widest whitespace-nowrap">
          What {recipientName.split(' ')[0]} sees
        </p>
        <div className="flex-1 h-px bg-ocean/10" />
      </div>

      {/* Currency switcher */}
      <div className="flex gap-1.5 justify-center flex-wrap">
        {SUPPORTED_CURRENCIES.map((cur) => (
          <button
            key={cur}
            onClick={() => setCurrency(cur)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
              currency === cur
                ? 'bg-ocean text-cream'
                : 'bg-ocean/10 text-ocean/50 hover:bg-ocean/15'
            }`}
          >
            {cur}
          </button>
        ))}
      </div>

      <LocalCashOut currency={currency} />
    </div>
  );
}

// ── Execute step ────────────────────────────────────────────────
function DemoExecuteStep({ timeline }: { timeline: TimelineEntry[] }) {
  return (
    <div className="py-5 sm:py-10 space-y-5">
      <div className="text-center space-y-2">
        <h2 className="text-2xl sm:text-3xl font-display font-bold text-ocean">Sending…</h2>
        <p className="text-ocean/50 text-sm">Live transaction progress</p>
      </div>

      <div className="space-y-0 relative">
        <div className="absolute left-3 sm:left-4 top-6 bottom-6 w-0.5 bg-ocean/10" />
        {timeline.map((entry, i) => (
          <motion.div
            key={entry.id}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            className="flex items-start gap-3 sm:gap-4 py-2 sm:py-3 relative z-10"
          >
            <div className="w-8 h-8 flex items-center justify-center shrink-0">
              {entry.status === 'done' && (
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-8 h-8 rounded-full bg-gold flex items-center justify-center">
                  <Check size={16} className="text-cream" />
                </motion.div>
              )}
              {entry.status === 'active' && (
                <motion.div animate={{ scale: [1, 1.15, 1] }} transition={{ repeat: Infinity, duration: 1 }} className="w-8 h-8 rounded-full bg-coral flex items-center justify-center">
                  <Loader2 size={16} className="text-cream animate-spin" />
                </motion.div>
              )}
              {entry.status === 'pending' && (
                <div className="w-8 h-8 rounded-full border-2 border-ocean/20 bg-cream" />
              )}
            </div>
            <div className="flex-1 pt-1">
              <p className={`text-sm font-medium ${
                entry.status === 'done' ? 'text-ocean' :
                entry.status === 'active' ? 'text-coral' : 'text-ocean/30'
              }`}>
                {entry.label}
              </p>
              {entry.status === 'active' && entry.id === 'bridge' && (
                <p className="text-xs font-mono text-ocean/30 mt-0.5">via Stargate · Base → Solana</p>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}


