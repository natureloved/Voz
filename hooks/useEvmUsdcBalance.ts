import * as React from 'react';
import { useAccount, useBalance } from 'wagmi';
import { TOKENS } from '@/lib/tokens';

export function useEvmUsdcBalance() {
  const { address, chainId } = useAccount();

  const usdcAddress = React.useMemo(() => {
    if (!chainId) return undefined;
    if (chainId === 8453) return TOKENS.EVM.Base_USDC;
    if (chainId === 42161) return TOKENS.EVM.Arbitrum_USDC;
    if (chainId === 137) return TOKENS.EVM.Polygon_USDC;
    if (chainId === 10) return TOKENS.EVM.Optimism_USDC;
    return undefined;
  }, [chainId]);

  const { data, isError, isLoading, refetch } = useBalance({
    address,
    token: usdcAddress as `0x${string}`,
    query: {
      enabled: !!address && !!usdcAddress,
    }
  });

  return {
    balance: data?.formatted || '0.00',
    symbol: 'USDC',
    isError,
    isLoading,
    refetch,
  };
}
