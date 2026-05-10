import * as React from 'react';
import { Route } from '@lifi/sdk';
import { PaymentIntent } from '@/lib/intent-schema';
import { RouteCard } from './RouteCard';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Loader2, AlertCircle } from 'lucide-react';
import { useAccount } from 'wagmi';

interface StepQuoteProps {
  intent: PaymentIntent;
  onQuoteConfirm: (route: Route) => void;
}

export function StepQuote({ intent, onQuoteConfirm }: StepQuoteProps) {
  const [route, setRoute] = React.useState<Route | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const { address, chainId } = useAccount();

  React.useEffect(() => {
    async function fetchQuote() {
      if (!address || !chainId) {
        setError('Please connect your EVM wallet first.');
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);
      try {
        const res = await fetch('/api/quote', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fromChainId: chainId,
            amount: intent.amount,
            toAddress: intent.recipient.kind === 'address' ? intent.recipient.value : '11111111111111111111111111111111',
            fromAddress: address,
          }),
        });

        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.error || 'Quote failed');
        }

        const routeData = await res.json();
        setRoute(routeData);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    }

    fetchQuote();
  }, [address, chainId, intent]);

  return (
    <div className="py-6 sm:py-12 space-y-6 max-w-md mx-auto">
      <div className="text-center space-y-2">
        <h2 className="text-2xl sm:text-3xl font-display font-bold text-ocean">Route Quote</h2>
        <p className="text-ocean/60 font-sans">
          Bridging <span className="font-mono font-semibold">${intent.amount}</span> USDC to Solana
        </p>
      </div>

      {isLoading && (
        <Card>
          <CardContent className="p-8 flex flex-col items-center gap-3">
            <Loader2 className="w-8 h-8 text-ocean animate-spin" />
            <p className="text-ocean/60 text-sm">Fetching best route...</p>
          </CardContent>
        </Card>
      )}

      {error && !isLoading && (
        <Card className="border-coral bg-coral/5">
          <CardContent className="p-6 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-coral mt-0.5 shrink-0" />
            <p className="text-coral text-sm">{error}</p>
          </CardContent>
        </Card>
      )}

      {route && !isLoading && (
        <div className="space-y-6">
          <RouteCard route={route} />
          <Button className="w-full text-lg h-12" onClick={() => onQuoteConfirm(route)}>
            Execute Transfer
          </Button>
        </div>
      )}
    </div>
  );
}
