import * as React from 'react';
import { Transfer } from '@/lib/transfers';
import { SupportedCurrency } from '@/lib/fx';
import { LocalCurrencyToggle } from './LocalCurrencyToggle';
import { VoiceMessage } from './VoiceMessage';
import { TxLink } from './TxLink';
import Link from 'next/link';

interface ClaimHeroProps {
  transfer: Transfer;
  rates: Partial<Record<SupportedCurrency, number>>;
  audioUrl: string;
}

export function ClaimHero({ transfer, rates, audioUrl }: ClaimHeroProps) {
  const senderDisplay = transfer.senderName ?? 'Someone';

  return (
    <div className="min-h-screen bg-cream flex flex-col">
      {/* Header band */}
      <div className="bg-ocean px-4 sm:px-6 py-5 flex items-center justify-between">
        <Link href="/" className="font-display font-bold text-cream text-xl sm:text-2xl tracking-tight hover:opacity-90 transition-opacity">
          Voz<span className="text-coral">.</span>
        </Link>
        <span className="text-cream/50 text-[10px] sm:text-xs font-mono">
          {new Date(transfer.createdAt).toLocaleDateString()}
        </span>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 py-8 sm:py-12 space-y-8 sm:space-y-10 max-w-md mx-auto w-full">
        {/* Sender subtitle */}
        <p className="text-coral font-display font-semibold text-xl text-center">
          {senderDisplay} sent you a message
        </p>

        {/* Amount with currency toggle */}
        <LocalCurrencyToggle usdAmount={transfer.amount} rates={rates} />

        <p className="text-ocean/40 text-sm font-mono">USDC</p>

        {/* Voice message player */}
        <div className="w-full bg-ocean/5 rounded-2xl p-4 sm:p-6 space-y-4">
          <p className="text-xs font-semibold text-ocean/40 uppercase tracking-wider">Voice Message</p>
          <VoiceMessage
            audioUrl={audioUrl}
            translatedMessage={transfer.translatedMessage ?? transfer.senderMessageOriginal}
            senderName={transfer.senderName}
          />
        </div>

        {/* Transaction link */}
        <div className="w-full bg-ocean/5 rounded-2xl px-4 py-3 sm:px-5 sm:py-4">
          <TxLink txHash={transfer.txHash} status={transfer.status} />
        </div>
      </div>
    </div>
  );
}
