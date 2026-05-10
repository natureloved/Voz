'use client';

import * as React from 'react';
import { SUPPORTED_CURRENCIES, CURRENCY_SYMBOLS, SupportedCurrency } from '@/lib/fx';

interface LocalCurrencyToggleProps {
  usdAmount: number;
  rates: Partial<Record<SupportedCurrency, number>>;
  onSelect?: (currency: SupportedCurrency) => void;
}

export function LocalCurrencyToggle({ usdAmount, rates, onSelect }: LocalCurrencyToggleProps) {
  const [selected, setSelected] = React.useState<SupportedCurrency>('USD');

  const displayAmount = selected === 'USD'
    ? usdAmount
    : Math.round(usdAmount * (rates[selected] ?? 1) * 100) / 100;

  const symbol = CURRENCY_SYMBOLS[selected];

  return (
    <div className="space-y-4">
      <div className="flex items-baseline gap-1 justify-center">
        <span className="text-3xl font-display font-semibold text-ocean/50">{symbol}</span>
        <span className="text-5xl sm:text-6xl md:text-7xl font-display font-bold text-ocean leading-none">
          {displayAmount.toLocaleString(undefined, { maximumFractionDigits: 2 })}
        </span>
      </div>

      <div className="flex gap-1.5 justify-center flex-wrap">
        {SUPPORTED_CURRENCIES.map((cur) => (
          <button
            key={cur}
            onClick={() => { setSelected(cur); onSelect?.(cur); }}
            className={`px-3 py-2 sm:py-1.5 rounded-full text-xs font-semibold transition-all min-h-[36px] ${
              selected === cur
                ? 'bg-ocean text-cream'
                : 'bg-ocean/10 text-ocean/50 hover:bg-ocean/15'
            }`}
          >
            {cur}
          </button>
        ))}
      </div>
    </div>
  );
}
