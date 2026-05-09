'use client';

import { EvmConnectButton } from './EvmConnectButton';
import { SolanaConnectButton } from './SolanaConnectButton';
import { BalancePill } from './BalancePill';
import { useEvmUsdcBalance } from '@/hooks/useEvmUsdcBalance';
import { useSolanaUsdcBalance } from '@/hooks/useSolanaUsdcBalance';
import Link from 'next/link';

export function WalletBar() {
  const evmBalance = useEvmUsdcBalance();
  const solanaBalance = useSolanaUsdcBalance();

  return (
    <div className="sticky top-0 z-50 w-full bg-cream/80 backdrop-blur border-b border-ocean/10 py-3 px-2 sm:px-6 flex items-center justify-between gap-2">
      {/* EVM Side */}
      <div className="flex items-center gap-1.5 sm:gap-4 shrink-0">
        <EvmConnectButton />
        <BalancePill 
          balance={evmBalance.balance} 
          symbol={evmBalance.symbol} 
          isLoading={evmBalance.isLoading} 
        />
      </div>

      {/* Center Brand */}
      <Link href="/" className="hidden sm:block font-display font-bold text-ocean text-xl tracking-tight hover:opacity-90 transition-opacity">
        Voz
      </Link>

      {/* Solana Side */}
      <div className="flex items-center gap-1.5 sm:gap-4 shrink-0">
        <BalancePill 
          balance={solanaBalance.balance} 
          symbol={solanaBalance.symbol} 
          isLoading={solanaBalance.isLoading} 
        />
        <SolanaConnectButton />
      </div>
    </div>
  );
}
