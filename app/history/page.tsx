'use client';

import * as React from 'react';
import { useAccount } from 'wagmi';
import { WalletBar } from '@/components/wallet/WalletBar';
import { ArrowLeft, Clock, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { truncateAddress } from '@/lib/cn';
import type { Transfer } from '@/lib/transfers';

const CHAIN_NAMES: Record<number, string> = {
  8453: 'Base',
  42161: 'Arbitrum',
  137: 'Polygon',
  10: 'Optimism',
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export default function HistoryPage() {
  const { address } = useAccount();
  const [transfers, setTransfers] = React.useState<Transfer[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    if (!address) { setLoading(false); return; }
    fetch(`/api/transfers?evmAddress=${address}`)
      .then((r) => r.json())
      .then((data) => setTransfers(Array.isArray(data) ? data : []))
      .finally(() => setLoading(false));
  }, [address]);

  return (
    <main className="min-h-screen bg-cream flex flex-col">
      <WalletBar />
      <div className="flex-1 w-full max-w-md mx-auto px-4 py-6 sm:py-8 space-y-6">
        <div className="flex items-center gap-3">
          <Link href="/send" className="text-ocean/40 hover:text-ocean transition-colors">
            <ArrowLeft size={20} />
          </Link>
          <h1 className="text-xl sm:text-2xl font-display font-bold text-ocean">History</h1>
        </div>

        {!address && (
          <div className="text-center py-20 space-y-3">
            <Clock className="w-10 h-10 mx-auto text-ocean/20" />
            <p className="text-sm text-ocean/50">Connect your EVM wallet to view your transaction history.</p>
          </div>
        )}

        {address && loading && (
          <div className="text-center py-20 text-ocean/30 text-sm animate-pulse">Loading history…</div>
        )}

        {address && !loading && transfers.length === 0 && (
          <div className="text-center py-20 space-y-3">
            <Clock className="w-10 h-10 mx-auto text-ocean/20" />
            <p className="text-sm text-ocean/50">No transfers yet.</p>
            <Link href="/send" className="inline-block text-sm font-semibold text-coral hover:opacity-80 transition-opacity">
              Send your first payment →
            </Link>
          </div>
        )}

        {address && !loading && transfers.length > 0 && (
          <div className="space-y-3">
            {transfers.map((t, i) => (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-white border border-ocean/10 rounded-2xl p-4 flex items-center gap-4"
              >
                {/* Amount badge */}
                <div className="w-12 h-12 rounded-full bg-gold/20 flex items-center justify-center shrink-0">
                  <span className="font-display font-bold text-ocean text-sm">${t.amount}</span>
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold text-ocean text-sm truncate">
                      {t.recipientName ?? truncateAddress(t.toSolanaAddress)}
                    </p>
                    <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded-full shrink-0 ${
                      t.status === 'confirmed'
                        ? 'bg-gold/20 text-ocean'
                        : 'bg-ocean/10 text-ocean/50'
                    }`}>
                      {t.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-0.5 text-xs text-ocean/40">
                    <span>{formatDate(t.createdAt)}</span>
                    {t.fromChain > 0 && (
                      <>
                        <span>·</span>
                        <span>{CHAIN_NAMES[t.fromChain] ?? `Chain ${t.fromChain}`}</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3 shrink-0">
                  <Link
                    href={`/claim/${t.id}`}
                    className="text-xs font-medium text-coral hover:opacity-70 transition-opacity"
                  >
                    Claim link
                  </Link>
                  {t.txHash && t.txHash !== 'pending' && (
                    <a
                      href={`https://solscan.io/tx/${t.txHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-ocean/30 hover:text-ocean transition-colors"
                      title="View on Solscan"
                    >
                      <ExternalLink size={14} />
                    </a>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

export const dynamic = 'force-dynamic';
