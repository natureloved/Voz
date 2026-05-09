import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { arbitrum, base, optimism, polygon } from 'wagmi/chains';

export const config = typeof window !== 'undefined'
  ? getDefaultConfig({
      appName: 'Voz',
      projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'demo',
      chains: [base, arbitrum, optimism, polygon],
      ssr: true,
    })
  : null as any;
