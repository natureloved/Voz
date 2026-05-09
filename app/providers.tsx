'use client';

import * as React from 'react';
import { RainbowKitProvider } from '@rainbow-me/rainbowkit';
import { WagmiProvider } from 'wagmi';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { PhantomWalletAdapter, SolflareWalletAdapter } from '@solana/wallet-adapter-wallets';
import '@rainbow-me/rainbowkit/styles.css';
import '@solana/wallet-adapter-react-ui/styles.css';

import { config } from '@/lib/wagmi';

const queryClient = new QueryClient();

export function Providers({ children }: { children: React.ReactNode }) {

  const wallets = React.useMemo(
    () => [
      new PhantomWalletAdapter(),
      new SolflareWalletAdapter(),
    ],
    []
  );

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
          <ConnectionProvider endpoint="https://api.mainnet-beta.solana.com">
            <WalletProvider wallets={wallets} autoConnect>
              <WalletModalProvider>
                {children}
              </WalletModalProvider>
            </WalletProvider>
          </ConnectionProvider>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
