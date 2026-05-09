import * as React from 'react';
import { ExternalLink } from 'lucide-react';

interface TxLinkProps {
  txHash: string;
  status: 'pending' | 'confirmed';
}

export function TxLink({ txHash, status }: TxLinkProps) {
  const solscanUrl = `https://solscan.io/tx/${txHash}`;

  return (
    <div className="flex items-center justify-between text-sm">
      <div className="flex items-center gap-2">
        <div className={`w-2 h-2 rounded-full ${status === 'confirmed' ? 'bg-gold' : 'bg-coral animate-pulse'}`} />
        <span className={`text-xs font-semibold uppercase tracking-wider ${status === 'confirmed' ? 'text-ocean/60' : 'text-coral/80'}`}>
          {status === 'confirmed' ? 'Confirmed on Solana' : 'Pending…'}
        </span>
      </div>
      <a
        href={solscanUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="font-mono text-xs text-ocean/40 hover:text-ocean transition-colors flex items-center gap-1"
      >
        {txHash.slice(0, 8)}…{txHash.slice(-6)}
        <ExternalLink size={11} />
      </a>
    </div>
  );
}
