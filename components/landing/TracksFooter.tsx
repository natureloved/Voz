'use client';

import * as React from 'react';
import { motion } from 'framer-motion';

const SolanaIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 397 311" fill="currentColor" {...props}>
    <path d="M64.6 237.9c2.4-2.4 5.7-3.8 9.2-3.8h317.4c5.8 0 8.7 7 4.6 11.1l-62.7 62.7c-2.4 2.4-5.7 3.8-9.2 3.8H6.5c-5.8 0-8.7-7-4.6-11.1l62.7-62.7z" />
    <path d="M64.6 3.8C67.1 1.4 70.4 0 73.8 0h317.4c5.8 0 8.7 7 4.6 11.1l-62.7 62.7c-2.4 2.4-5.7 3.8-9.2 3.8H6.5c-5.8 0-8.7-7-4.6-11.1L64.6 3.8z" />
    <path d="M333.1 120.1c-2.4-2.4-5.7-3.8-9.2-3.8H6.5c-5.8 0-8.7 7-4.6 11.1l62.7 62.7c2.4 2.4 5.7 3.8 9.2 3.8h317.4c5.8 0 8.7-7 4.6-11.1l-62.7-62.7z" />
  </svg>
);

const LifiIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <circle cx="6" cy="12" r="3" />
    <circle cx="18" cy="12" r="3" />
    <path d="M9 12h6" />
    <path d="M9 9l3-3 3 3" />
    <path d="M9 15l3 3 3-3" />
  </svg>
);

const ElevenLabsIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M7 3h3v18H7zM14 3h3v18h-3z" />
  </svg>
);

const AnthropicIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M12 2l2.4 7.6H22l-6.2 4.5 2.4 7.6-6.2-4.5-6.2 4.5 2.4-7.6L2 9.6h7.6z" />
  </svg>
);

const TRACKS = [
  { name: 'Solana', icon: SolanaIcon },
  { name: 'LI.FI', icon: LifiIcon },
  { name: 'ElevenLabs', icon: ElevenLabsIcon },
  { name: 'Anthropic', icon: AnthropicIcon },
];

export function TracksFooter() {
  return (
    <footer className="border-t border-ocean/10 py-8 md:py-12 px-4 sm:px-6 md:px-12 lg:px-20">
      <div className="max-w-6xl mx-auto space-y-8">
        <p className="text-center text-xs font-bold text-ocean/60 uppercase tracking-widest">
          Built with
        </p>
 
        <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10 md:gap-16">
          {TRACKS.map((track, i) => {
            const Icon = track.icon;
            return (
              <motion.div
                key={track.name}
                initial={{ opacity: 0, y: 6 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className="flex items-center gap-2 group"
              >
                <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-ocean/70 group-hover:text-ocean transition-colors" />
                <span className="text-lg sm:text-xl font-display font-bold text-ocean/70 group-hover:text-ocean transition-colors">
                  {track.name}
                </span>
              </motion.div>
            );
          })}
        </div>

        <p className="text-center text-xs text-ocean/60 font-mono">
          Voz · Breakpoint 2026 Hackathon
        </p>
      </div>
    </footer>
  );
}
