import * as React from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { USDC_SPL_MINT } from '@/lib/solana';

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
      // Use getParsedTokenAccountsByOwner so all USDC accounts are found,
      // not just the standard ATA — handles wallets with non-ATA token accounts.
      const { value: accounts } = await connection.getParsedTokenAccountsByOwner(publicKey, {
        mint: USDC_SPL_MINT,
      });
      const total = accounts.reduce((sum, { account }) => {
        const ui = (account.data as any).parsed?.info?.tokenAmount?.uiAmount ?? 0;
        return sum + ui;
      }, 0);
      setBalance(total.toFixed(2));
    } catch (err) {
      console.error('Error fetching Solana USDC balance:', err);
      setIsError(true);
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
