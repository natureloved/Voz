import { Route } from '@lifi/sdk';
import { Card, CardContent } from '@/components/ui/Card';

export function RouteCard({ route }: { route: Route }) {
  const bestStep = route.steps[0];
  const bridgeName = bestStep?.tool || 'Unknown Bridge';
  const feesUSD = route.steps.reduce((acc, step) => 
    acc + (step.estimate.feeCosts?.reduce((feeAcc, fee) => feeAcc + parseFloat(fee.amountUSD || '0'), 0) || 0)
  , 0);
  const gasCostUSD = parseFloat(route.gasCostUSD || '0');
  const executionTimeMin = Math.ceil(route.steps.reduce((acc, s) => acc + s.estimate.executionDuration, 0) / 60);

  return (
    <Card className="bg-cream border-ocean/10 shadow-sm animate-in fade-in slide-in-from-bottom-4">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display font-semibold text-ocean text-lg">Best Route: {bridgeName}</h3>
          <span className="bg-ocean/5 text-ocean/70 text-xs px-2 py-1 rounded font-medium">
            ~{executionTimeMin} min
          </span>
        </div>
        
        <div className="flex gap-4 sm:gap-8 text-sm">
          <div>
            <span className="text-ocean/50 block text-xs uppercase tracking-wider mb-1">Bridge Fees</span>
            <span className="font-medium text-ocean font-mono">${feesUSD.toFixed(4)}</span>
          </div>
          <div>
            <span className="text-ocean/50 block text-xs uppercase tracking-wider mb-1">Est. Gas</span>
            <span className="font-medium text-ocean font-mono">${gasCostUSD.toFixed(4)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
