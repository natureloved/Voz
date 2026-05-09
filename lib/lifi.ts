import { createConfig, getRoutes, executeRoute, EVM, Solana } from '@lifi/sdk';

export const lifiConfig = createConfig({
  integrator: process.env.NEXT_PUBLIC_LIFI_INTEGRATOR || 'voz-dev3pack',
  providers: [EVM(), Solana()],
});

export { getRoutes, executeRoute };
