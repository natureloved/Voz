import { createConfig, getRoutes, executeRoute, EVM, Solana } from '@lifi/sdk';
import { getWalletClient, switchChain } from '@wagmi/core';
import { config as wagmiConfig } from './wagmi';

// wagmi's generic Config<[...chains]> and WalletClient types don't satisfy
// @lifi/sdk's narrower internal Client type — cast to bypass the mismatch
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const cfg = wagmiConfig as any;

export const lifiConfig = createConfig({
  integrator: process.env.NEXT_PUBLIC_LIFI_INTEGRATOR || 'voz-dev3pack',
  providers: [
    EVM({
      getWalletClient: async () => {
        const client = await getWalletClient(cfg);
        if (!client) throw new Error('No wallet client available');
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return client as any;
      },
      switchChain: async (chainId) => {
        const chain = await switchChain(cfg, { chainId });
        const client = await getWalletClient(cfg, { chainId: chain.id });
        if (!client) throw new Error('No wallet client after chain switch');
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return client as any;
      },
    }),
    Solana(),
  ],
});

export { getRoutes, executeRoute };
