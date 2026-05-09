'use client';

import * as React from 'react';
import { getRoutes } from '@/lib/lifi';
import { TOKENS } from '@/lib/tokens';
import { EVM_CHAINS, SOLANA_CHAIN_ID } from '@/lib/chains';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { WalletBar } from '@/components/wallet/WalletBar';
import type { RoutesResponse } from '@lifi/sdk';

export default function RouteTestPage() {
  const [routesResponse, setRoutesResponse] = React.useState<RoutesResponse | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchRoutes() {
      setIsLoading(true);
      setError(null);
      try {
        const response = await getRoutes({
          fromChainId: EVM_CHAINS.base.id,
          toChainId: SOLANA_CHAIN_ID,
          fromTokenAddress: TOKENS.EVM.Base_USDC,
          toTokenAddress: TOKENS.SOLANA.USDC,
          fromAmount: '10000000', // 10 USDC (6 decimals)
          fromAddress: '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045',
          toAddress: '11111111111111111111111111111111',
        });
        setRoutesResponse(response);
      } catch (err: any) {
        setError(err.message || String(err));
      } finally {
        setIsLoading(false);
      }
    }

    fetchRoutes();
  }, []);

  return (
    <main className="min-h-screen bg-cream flex flex-col">
      <WalletBar />
      <div className="flex-1 max-w-4xl w-full mx-auto p-8 space-y-6">
        <h1 className="text-3xl font-display font-bold text-ocean">
          LI.FI Route Test: Base → Solana
        </h1>

        {isLoading && (
          <Card>
            <CardContent className="p-6 text-ocean/70 text-center animate-pulse">
              Fetching routes...
            </CardContent>
          </Card>
        )}

        {error && !isLoading && (
          <Card className="border-coral bg-coral/5">
            <CardHeader>
              <CardTitle className="text-coral">Route Fetch Error</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="font-mono text-xs text-coral whitespace-pre-wrap">
                {error}
              </pre>
            </CardContent>
          </Card>
        )}

        {routesResponse && !isLoading && (
          <div className="space-y-6">
            {routesResponse.routes.length > 0 ? (
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-gold"></div>
                <span className="text-gold font-bold">
                  ✓ Cross-chain path confirmed ({routesResponse.routes.length} routes)
                </span>
              </div>
            ) : (
              <Card className="border-coral bg-coral/5">
                <CardContent className="p-6">
                  <p className="text-coral font-bold">No routes returned by LI.FI.</p>
                </CardContent>
              </Card>
            )}

            {routesResponse.routes.map((route, i) => {
              const bestStep = route.steps[0];
              const bridgeName = bestStep?.tool || 'Unknown Bridge';
              const feesUSD = route.steps.reduce((acc, step) => 
                acc + (step.estimate.feeCosts?.reduce((feeAcc, fee) => feeAcc + parseFloat(fee.amountUSD || '0'), 0) || 0)
              , 0);

              return (
                <Card key={i}>
                  <CardHeader>
                    <CardTitle>Route {i + 1} - {bridgeName}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex gap-8 text-sm">
                      <div>
                        <span className="text-ocean/50 block">Est. Time</span>
                        <span className="font-medium">{Math.ceil(route.steps.reduce((acc, s) => acc + s.estimate.executionDuration, 0) / 60)} min</span>
                      </div>
                      <div>
                        <span className="text-ocean/50 block">Fees (USD)</span>
                        <span className="font-medium">${feesUSD.toFixed(4)}</span>
                      </div>
                      <div>
                        <span className="text-ocean/50 block">Gas Cost (USD)</span>
                        <span className="font-medium">${parseFloat(route.gasCostUSD || '0').toFixed(4)}</span>
                      </div>
                    </div>
                    <details className="bg-ocean/5 rounded-lg p-4">
                      <summary className="text-sm font-medium cursor-pointer text-ocean hover:text-ocean/80">
                        View Full JSON
                      </summary>
                      <pre className="mt-4 font-mono text-xs text-ocean/70 overflow-x-auto">
                        {JSON.stringify(route, null, 2)}
                      </pre>
                    </details>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}

export const dynamic = 'force-dynamic';
