'use client';

import * as React from 'react';
import { motion } from 'framer-motion';

const STEPS = [
  {
    num: '01',
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <rect x="9" y="2" width="10" height="16" rx="5" fill="currentColor" />
        <path d="M5 13c0 4.97 4.03 9 9 9s9-4.03 9-9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <line x1="14" y1="22" x2="14" y2="26" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <line x1="10" y1="26" x2="18" y2="26" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
    title: 'Speak your intent',
    body: 'Say "Send 25 dollars to Maria for her birthday" in English or Spanish. Claude parses the who, what, and why.',
  },
  {
    num: '02',
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <circle cx="6" cy="14" r="4" stroke="currentColor" strokeWidth="2" />
        <circle cx="22" cy="14" r="4" stroke="currentColor" strokeWidth="2" />
        <path d="M10 14h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <path d="M16 10l4 4-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    title: 'We route to Solana',
    body: 'LI.FI finds the best bridge route from any EVM chain. With just one signature, your USDC arrives on Solana.',
  },
  {
    num: '03',
    icon: (
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <path d="M4 10c0-3.314 2.686-6 6-6h8c3.314 0 6 2.686 6 6v2c0 3.314-2.686 6-6 6H10.5l-4 4v-4H10c-3.314 0-6-2.686-6-6v-2z" stroke="currentColor" strokeWidth="2" />
        <circle cx="10" cy="13" r="1.5" fill="currentColor" />
        <circle cx="14" cy="13" r="1.5" fill="currentColor" />
        <circle cx="18" cy="13" r="1.5" fill="currentColor" />
      </svg>
    ),
    title: 'They hear it in their language',
    body: 'The recipient opens a link. Claude translates your message and ElevenLabs speaks it in natural Spanish.',
  },
];

export function HowItWorks() {
  return (
    <section className="py-12 md:py-20 px-4 sm:px-6 md:px-12 lg:px-20 bg-ocean/[0.03]">
      <div className="max-w-6xl mx-auto space-y-12">
        <div className="text-center space-y-3">
          <p className="text-xs font-bold text-coral uppercase tracking-widest">How it works</p>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-display font-bold text-ocean tracking-tight">
            Three steps. Zero confusion.
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-4 md:gap-6">
          {STEPS.map((step, i) => (
            <motion.div
              key={step.num}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.5, delay: i * 0.15 }}
            >
              <div className="h-full rounded-2xl border border-ocean/10 bg-cream p-5 sm:p-7 space-y-5 hover:border-ocean/20 hover:shadow-md transition-all">
                <div className="flex items-start justify-between">
                  <div className="w-12 h-12 rounded-xl bg-ocean/5 flex items-center justify-center text-ocean">
                    {step.icon}
                  </div>
                  <span className="text-3xl sm:text-4xl font-display font-bold text-coral/20 leading-none">
                    {step.num}
                  </span>
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-display font-bold text-ocean">{step.title}</h3>
                  <p className="text-sm text-ocean/60 leading-relaxed">{step.body}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
