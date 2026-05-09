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

  const handleTranscribe = async (data: TranscribeResponse) => {
    setTranscript(data);
    setIsParsing(true);

    try {
      const res = await fetch('/api/parse-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transcript: data.text, language: data.language }),
      });

      if (!res.ok) throw new Error('Intent parsing failed');

      const parsedIntent = await res.json();
      setIntent(parsedIntent);
      setStep('review');
    } catch (err) {
      console.error('Parse intent error:', err);
    } finally {
      setIsParsing(false);
    }
  };

  const handleReviewConfirm = (confirmedIntent: PaymentIntent, contact?: Contact) => {
    setIntent(confirmedIntent);
    setResolvedContact(contact ?? null);
    setStep('quote');
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
              </div>
            )}

            {step === 'review' && intent && (
              <StepReview intent={intent} onConfirm={handleReviewConfirm} />
            )}

            {step === 'quote' && intent && (
              <StepQuote intent={intent} onQuoteConfirm={handleQuoteConfirm} />
            )}

            {step === 'execute' && route && (
              <StepExecute route={route} onComplete={handleExecuteComplete} />
            )}

            {step === 'done' && intent && (
              <StepDone
                intent={intent}
                claimId={claimId}
                executedRoute={executedRoute}
                resolvedContact={resolvedContact}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </main>
  );
}
