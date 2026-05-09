'use client';

import { EvmConnectButton } from './EvmConnectButton';
import { SolanaConnectButton } from './SolanaConnectButton';
import { BalancePill } from './BalancePill';
import { useEvmUsdcBalance } from '@/hooks/useEvmUsdcBalance';
import { useSolanaUsdcBalance } from '@/hooks/useSolanaUsdcBalance';

export function WalletBar() {
  const evmBalance = useEvmUsdcBalance();
  const solanaBalance = useSolanaUsdcBalance();

  return (
    <div className="sticky top-0 z-50 w-full bg-cream/80 backdrop-blur border-b border-ocean/10 py-3 px-4 flex items-center justify-between">
      {/* EVM Side */}
      <div className="flex items-center gap-4">
        <EvmConnectButton />
        <BalancePill 
          balance={evmBalance.balance} 
          symbol={evmBalance.symbol} 
          isLoading={evmBalance.isLoading} 
        />
      </div>

      {/* Center Brand */}
      <div className="font-display font-bold text-ocean text-xl tracking-tight">
        Voz
      </div>

      {/* Solana Side */}
      <div className="flex items-center gap-4">
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
