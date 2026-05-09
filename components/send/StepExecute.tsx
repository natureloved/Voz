import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Route } from '@lifi/sdk';
import { executeLifiRoute } from '@/lib/route-execution';
import { Check, Loader2, ExternalLink, AlertCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';

interface StepExecuteProps {
  route: Route;
  onComplete: (executedRoute: Route) => void;
}

interface TimelineStep {
  id: string;
  label: string;
  status: 'pending' | 'active' | 'done' | 'error';
  txHash?: string;
  txLink?: string;
}

export function StepExecute({ route, onComplete }: StepExecuteProps) {
  const [timelineSteps, setTimelineSteps] = React.useState<TimelineStep[]>([]);
  const [error, setError] = React.useState<string | null>(null);
  const hasStarted = React.useRef(false);

  React.useEffect(() => {
    if (hasStarted.current) return;
    hasStarted.current = true;

    // Initialize timeline from route steps
    const initialSteps: TimelineStep[] = [];
    for (const step of route.steps) {
      initialSteps.push({
        id: `approve-${step.id}`,
        label: `Approving ${step.action.fromToken.symbol}`,
        status: 'pending',
      });
      initialSteps.push({
        id: `bridge-${step.id}`,
        label: `Bridging via ${step.tool}`,
        status: 'pending',
      });
    }
    initialSteps.push({
      id: 'confirm-solana',
      label: 'Confirming on Solana',
      status: 'pending',
    });
    initialSteps.push({
      id: 'done',
      label: 'Done',
      status: 'pending',
    });
    setTimelineSteps(initialSteps);

    // Execute
    executeLifiRoute(route, (updatedRoute: Route) => {
      setTimelineSteps((prev) => {
        const updated = [...prev];
        for (const step of updatedRoute.steps) {
          const extStep = step as any;
          const processes = extStep.execution?.process || [];
          const hasApproval = processes.some(
            (p: any) => p.type === 'TOKEN_ALLOWANCE'
          );
          const approveIdx = updated.findIndex((s) => s.id === `approve-${step.id}`);
          const bridgeIdx = updated.findIndex((s) => s.id === `bridge-${step.id}`);

          if (approveIdx >= 0) {
            const approvalProcess = processes.find(
              (p: any) => p.type === 'TOKEN_ALLOWANCE'
            );
            if (approvalProcess) {
              updated[approveIdx] = {
                ...updated[approveIdx],
                status: approvalProcess.status === 'DONE' ? 'done' : 
                        approvalProcess.status === 'FAILED' ? 'error' : 'active',
                txHash: approvalProcess.txHash,
                txLink: approvalProcess.txLink,
              };
            } else if (!hasApproval && processes.length > 0) {
              updated[approveIdx] = { ...updated[approveIdx], status: 'done', label: 'Approval (skipped)' };
            }
          }

          if (bridgeIdx >= 0) {
            const crossProcess = processes.find(
              (p: any) => p.type === 'CROSS_CHAIN' || p.type === 'SWAP'
            );
            const sendProcess = processes.find(
              (p: any) => p.type === 'SEND'  
            );
            const activeProcess = crossProcess || sendProcess;
            if (activeProcess) {
              updated[bridgeIdx] = {
                ...updated[bridgeIdx],
                status: activeProcess.status === 'DONE' ? 'done' :
                        activeProcess.status === 'FAILED' ? 'error' : 'active',
                txHash: activeProcess.txHash,
                txLink: activeProcess.txLink,
              };
            }
          }

          // Check receiving
          const receiveProcess = processes.find(
            (p: any) => p.type === 'RECEIVING_CHAIN'
          );
          if (receiveProcess) {
            const solIdx = updated.findIndex((s) => s.id === 'confirm-solana');
            if (solIdx >= 0) {
              updated[solIdx] = {
                ...updated[solIdx],
                status: receiveProcess.status === 'DONE' ? 'done' :
                        receiveProcess.status === 'FAILED' ? 'error' : 'active',
                txHash: receiveProcess.txHash,
                txLink: receiveProcess.txLink,
              };
            }
          }
        }

        // Check overall
        if (updatedRoute.steps.every((s) => (s as any).execution?.status === 'DONE')) {
          const doneIdx = updated.findIndex((s) => s.id === 'done');
          if (doneIdx >= 0) updated[doneIdx] = { ...updated[doneIdx], status: 'done' };
          setTimeout(() => onComplete(updatedRoute), 500);
        }

        return updated;
      });
    }).catch((err) => {
      setError(err.message || 'Execution failed');
    });
  }, [route, onComplete]);

  return (
    <div className="py-8 sm:py-12 space-y-4 sm:space-y-6 max-w-md mx-auto">
      <div className="text-center space-y-2">
        <h2 className="text-2xl sm:text-3xl font-display font-bold text-ocean">Sending...</h2>
        <p className="text-ocean/60 font-sans text-sm">Your transaction is being processed</p>
      </div>

      {error && (
        <Card className="border-coral bg-coral/5">
          <CardContent className="p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-coral shrink-0 mt-0.5" />
            <p className="text-coral text-sm">{error}</p>
          </CardContent>
        </Card>
      )}

      <div className="space-y-0 relative">
        {/* Vertical line */}
        <div className="absolute left-3 sm:left-4 top-6 bottom-6 w-0.5 bg-ocean/10" />

        <AnimatePresence>
          {timelineSteps.map((step, i) => (
            <motion.div
              key={step.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className="flex items-start gap-3 sm:gap-4 py-2 sm:py-3 relative z-10"
            >
              {/* Dot */}
              <div className="w-8 h-8 flex items-center justify-center shrink-0">
                {step.status === 'done' && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="w-8 h-8 rounded-full bg-gold flex items-center justify-center"
                  >
                    <Check size={16} className="text-cream" />
                  </motion.div>
                )}
                {step.status === 'active' && (
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ repeat: Infinity, duration: 1.2 }}
                    className="w-8 h-8 rounded-full bg-coral flex items-center justify-center"
                  >
                    <Loader2 size={16} className="text-cream animate-spin" />
                  </motion.div>
                )}
                {step.status === 'pending' && (
                  <div className="w-8 h-8 rounded-full border-2 border-ocean/20 bg-cream" />
                )}
                {step.status === 'error' && (
                  <div className="w-8 h-8 rounded-full bg-coral/20 flex items-center justify-center">
                    <AlertCircle size={16} className="text-coral" />
                  </div>
                )}
              </div>

              {/* Label */}
              <div className="flex-1 min-w-0 pt-1">
                <p className={`text-sm font-medium ${
                  step.status === 'done' ? 'text-ocean' : 
                  step.status === 'active' ? 'text-coral' : 
                  step.status === 'error' ? 'text-coral' : 'text-ocean/40'
                }`}>
                  {step.label}
                </p>
                {step.txHash && (
                  <a
                    href={step.txLink || '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-mono text-ocean/50 hover:text-ocean flex items-center gap-1 mt-0.5 truncate"
                  >
                    {step.txHash.slice(0, 8)}...{step.txHash.slice(-6)}
                    <ExternalLink size={10} />
                  </a>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
