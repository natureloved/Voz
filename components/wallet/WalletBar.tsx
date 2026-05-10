'use client';

import { EvmConnectButton } from './EvmConnectButton';
import { SolanaConnectButton } from './SolanaConnectButton';
import { BalancePill } from './BalancePill';
import { useEvmUsdcBalance } from '@/hooks/useEvmUsdcBalance';
import { useSolanaUsdcBalance } from '@/hooks/useSolanaUsdcBalance';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV_LINKS = [
  { href: '/send', label: 'Send' },
  { href: '/contacts', label: 'Contacts' },
  { href: '/history', label: 'History' },
];

export function WalletBar() {
  const evmBalance = useEvmUsdcBalance();
  const solanaBalance = useSolanaUsdcBalance();
  const pathname = usePathname();

  return (
    <div className="sticky top-0 z-50 w-full bg-cream/80 backdrop-blur border-b border-ocean/10">
      <div className="py-3 px-2 sm:px-6 flex items-center justify-between gap-2">
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
        <Link href="/" className="font-display font-bold text-ocean text-2xl sm:text-3xl tracking-tight hover:opacity-90 transition-opacity">
          Voz<span className="text-coral">.</span>
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

      {/* Page nav */}
      <div className="flex items-center justify-center gap-6 pb-2">
        {NAV_LINKS.map(({ href, label }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`text-xs font-medium transition-colors ${
                active ? 'text-coral' : 'text-ocean/40 hover:text-ocean'
              }`}
            >
              {label}
              {active && <span className="block h-0.5 mt-0.5 rounded-full bg-coral" />}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
