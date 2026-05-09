import * as React from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { USDC_SPL_MINT } from '@/lib/solana';
import { getAssociatedTokenAddress } from '@solana/spl-token';

export function useSolanaUsdcBalance() {
  const { connection } = useConnection();
  const { publicKey } = useWallet();
  const [balance, setBalance] = React.useState<string>('0.00');
  const [isLoading, setIsLoading] = React.useState(false);
  const [isError, setIsError] = React.useState(false);

  const fetchBalance = React.useCallback(async () => {
    if (!publicKey) {
      setBalance('0.00');
      return;
    }

    setIsLoading(true);
    setIsError(false);
    try {
      const ata = await getAssociatedTokenAddress(USDC_SPL_MINT, publicKey);
      const balanceInfo = await connection.getTokenAccountBalance(ata);
      setBalance(balanceInfo.value.uiAmountString || '0.00');
    } catch (err) {
      console.error("Error fetching Solana USDC balance:", err);
      // Usually means the ATA doesn't exist (balance is 0)
      setBalance('0.00');
    } finally {
      setIsLoading(false);
    }
  }, [publicKey, connection]);

  React.useEffect(() => {
    fetchBalance();
    const interval = setInterval(fetchBalance, 10000); // 10s polling
    return () => clearInterval(interval);
  }, [fetchBalance]);

  return {
    balance,
    symbol: 'USDC',
    isLoading,
    isError,
    refetch: fetchBalance,
  };
}
