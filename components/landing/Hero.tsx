'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { useAccount } from 'wagmi';
import { useWallet } from '@solana/wallet-adapter-react';

const HEADLINE_WORDS = ['Speak.', 'Send.', 'Heard.'];

// Fade-in that starts VISIBLE so server-rendered HTML is never invisible.
// y animates 12→0 for a subtle rise; opacity goes 1→1 (no flash on SSR).
const fadeUp = (delay = 0) => ({
  initial: { opacity: 1, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] as const },
});

export function Hero() {
  const { isConnected: isEvmConnected } = useAccount();
  const { connected: isSolanaConnected } = useWallet();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const isAnyConnected = mounted && (isEvmConnected || isSolanaConnected);

  return (
    <section className="min-h-[calc(100vh-60px)] flex items-center px-4 sm:px-6 md:px-12 lg:px-20">
      <div className="w-full max-w-6xl mx-auto grid md:grid-cols-2 gap-8 md:gap-12 items-center">

        {/* Left — copy */}
        <div className="space-y-8">
          <div className="space-y-2">
            <motion.p {...fadeUp(0)} className="text-xs font-bold text-coral uppercase tracking-widest">
              VOICE-FIRST · CROSS-CHAIN · SOLANA
            </motion.p>

            <h1 className="text-6xl sm:text-7xl lg:text-8xl font-display font-bold text-ocean tracking-tighter leading-none">
              {HEADLINE_WORDS.map((word, i) => (
                <motion.span
                  key={word}
                  initial={{ opacity: 1, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.55, delay: 0.1 + i * 0.18, ease: [0.22, 1, 0.36, 1] }}
                  className="block"
                >
                  {word}
                </motion.span>
              ))}
            </h1>
          </div>

          <motion.p
            {...fadeUp(0.55)}
            className="text-lg text-ocean/60 font-sans max-w-md leading-relaxed"
          >
            Send more than just crypto. Deliver cross-chain remittances to Solana with your actual voice, perfectly translated into their native language.
          </motion.p>

          {isAnyConnected && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 bg-ocean/5 border border-ocean/10 px-4 py-2 rounded-full max-w-full text-left"
            >
              <span className="flex h-2 w-2 relative shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <p className="text-xs text-ocean/80 font-sans font-medium leading-normal break-words">
                Wallet connected successfully! You are ready to make voice payments.
              </p>
            </motion.div>
          )}

          <motion.div {...fadeUp(0.72)} className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
            {isAnyConnected ? (
              <Link
                href="/send"
                className="inline-flex items-center justify-center whitespace-nowrap bg-coral text-cream hover:bg-coral/90 h-12 px-7 text-base gap-2 shadow-lg shadow-coral/20 rounded-xl font-semibold transition-all active:scale-[0.97]"
              >
                Start Voice Payment
                <ArrowRight size={16} />
              </Link>
            ) : (
              <>
                <Link
                  href="/demo"
                  className="inline-flex items-center justify-center whitespace-nowrap bg-coral text-cream hover:bg-coral/90 h-12 px-7 text-base gap-2 shadow-lg shadow-coral/20 rounded-xl font-semibold transition-all active:scale-[0.97]"
                >
                  Try the demo
                  <ArrowRight size={16} />
                </Link>
                <Link
                  href="/send"
                  className="inline-flex items-center justify-center text-ocean/60 hover:text-ocean text-sm gap-1.5 font-medium transition-colors"
                >
                  Connect wallet
                  <ArrowRight size={14} />
                </Link>
              </>
            )}
          </motion.div>

          <motion.div
            {...fadeUp(0.9)}
            className="flex items-center gap-6 text-xs text-ocean/70 font-mono"
          >
            <span>Base · Arbitrum · Optimism · Polygon</span>
            <span className="text-gold">→</span>
            <span>Solana</span>
          </motion.div>
        </div>

        {/* Right — animated mic */}
        <motion.div
          initial={{ opacity: 1, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="flex items-center justify-center"
        >
          <AnimatedMic />
        </motion.div>
      </div>
    </section>
  );
}

function AnimatedMic() {
  // Precompute dot positions so Framer Motion never needs to touch transform for placement.
  // Each dot is 6×6px (w-1.5 h-1.5); r=92px from centre.
  const dots = [0, 60, 120, 180, 240, 300].map((deg, i) => {
    const rad = (deg * Math.PI) / 180;
    const x = Math.round(Math.sin(rad) * 92);
    const y = Math.round(-Math.cos(rad) * 92);
    return { i, x, y };
  });

  return (
    <div className="relative flex items-center justify-center w-64 h-64">
      {/* Pulse rings — no initial opacity so they're visible immediately */}
      {[1, 2, 3].map((ring) => (
        <motion.div
          key={ring}
          className="absolute rounded-full border-2 border-coral/20"
          style={{ width: `${80 + ring * 56}px`, height: `${80 + ring * 56}px` } as any}
          animate={{ scale: [1, 1.12, 1], opacity: [0.5, 0.1, 0.5] }}
          transition={{ duration: 2.4, delay: ring * 0.5, repeat: Infinity, ease: 'easeInOut' }}
        />
      ))}

      {/* Center circle */}
      <motion.div
        className="relative z-10 w-24 h-24 rounded-full bg-ocean flex items-center justify-center shadow-2xl"
        animate={{ scale: [1, 1.04, 1] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
      >
        <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
          <rect x="14" y="4" width="12" height="20" rx="6" fill="#FBF7EF" />
          <path
            d="M8 19c0 6.627 5.373 12 12 12s12-5.373 12-12"
            stroke="#FBF7EF"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          <line x1="20" y1="31" x2="20" y2="37" stroke="#FBF7EF" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="15" y1="37" x2="25" y2="37" stroke="#FBF7EF" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
      </motion.div>

      {/* Orbit dots — positioned with left/top, NOT transform, so Framer can own scale */}
      {dots.map(({ i, x, y }) => (
        <motion.div
          key={i}
          className="absolute w-1.5 h-1.5 rounded-full bg-gold"
          style={{
            // Centre of container is 50%/50%; dot is 6px so subtract 3px to centre it
            left: `calc(50% + ${x - 3}px)`,
            top: `calc(50% + ${y - 3}px)`,
          } as React.CSSProperties}
          animate={{ opacity: [0.25, 1, 0.25], scale: [0.8, 1.5, 0.8] }}
          transition={{ duration: 2, delay: i * 0.33, repeat: Infinity }}
        />
      ))}
    </div>
  );
}
