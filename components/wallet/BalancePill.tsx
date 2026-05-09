import * as React from 'react';
import { cn } from '@/lib/cn';

interface BalancePillProps {
  balance: string;
  symbol: string;
  isLoading?: boolean;
}

export function BalancePill({ balance, symbol, isLoading }: BalancePillProps) {
  return (
    <div className={cn(
      "hidden sm:flex items-center bg-cream/50 rounded-full px-3 py-1.5 border border-ocean/10",
      isLoading && "opacity-50 animate-pulse"
    )}>
      <span className="font-mono text-sm font-medium text-ocean">{balance}</span>
      <span className="text-ocean/50 text-xs ml-1 font-sans">{symbol}</span>
    </div>
  );
}
