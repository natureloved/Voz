import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';

export function SolanaConnectButton() {
  return (
    <WalletMultiButton 
      style={{
        backgroundColor: 'var(--color-coral)',
        color: 'var(--color-cream)',
        fontFamily: 'var(--font-inter)',
        height: '40px',
        borderRadius: '0.375rem',
        fontSize: '0.75rem',
        fontWeight: 500,
        padding: '0.5rem 0.75rem',
      }}
    />
  );
}
